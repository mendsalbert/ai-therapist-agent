export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    technique: string;
    goal: string;
    progress: any[];
    analysis?: {
      emotionalState: string;
      themes: string[];
      riskLevel: number;
      recommendedApproach: string;
      progressIndicators: string[];
    };
  };
}

export interface ChatSession {
  sessionId: string;
  title?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse {
  message: string;
  response?: string;
  analysis?: {
    emotionalState: string;
    themes: string[];
    riskLevel: number;
    recommendedApproach: string;
    progressIndicators: string[];
  };
  metadata?: {
    technique: string;
    goal: string;
    progress: any[];
  };
}

// Route all chat traffic through our Next.js API to centralize retries/timeouts
const API_BASE = "/api/chat";

// Helper function to get auth headers
const getAuthHeaders = () => {
  let token: string | null = null;
  try {
    token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");
  } catch {}
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

import { logger } from "@/lib/utils/logger";

async function fetchWithRetry(url: string, options: RequestInit, retries = 1, timeoutMs = 25000): Promise<Response> {
  const attempt = async (): Promise<Response> => {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
    const id = controller ? setTimeout(() => controller.abort(), timeoutMs) : undefined as unknown as number;
    try {
      const res = await fetch(url, { ...options, signal: controller?.signal });
      if (res.status >= 500 && retries > 0) {
        await new Promise(r => setTimeout(r, 600));
        return fetchWithRetry(url, options, retries - 1, timeoutMs);
      }
      return res;
    } catch (err) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 600));
        return fetchWithRetry(url, options, retries - 1, timeoutMs);
      }
      throw err;
    } finally {
      if (controller && id) clearTimeout(id);
    }
  };
  return attempt();
}

async function parseJsonSafely(res: Response): Promise<any> {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return { error: `Unexpected content-type: ${ct}`, status: res.status };
  }
  try {
    return await res.json();
  } catch {
    return { error: 'Invalid JSON in response', status: res.status };
  }
}

export const createChatSession = async (): Promise<string> => {
  try {
    logger.debug("Creating new chat session...");
    const response = await fetchWithRetry(`${API_BASE}/sessions`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await parseJsonSafely(response);
      logger.error("Failed to create chat session", error);
      throw new Error(error.error || "Failed to create chat session");
    }

    const data = await parseJsonSafely(response);
    logger.debug("Chat session created", data);
    return data.sessionId;
  } catch (error) {
    logger.error("Error creating chat session", error);
    throw error;
  }
};

/**
 * Send chat message with streaming support for memory-enhanced chat
 * Calls the backend directly for streaming (bypasses Next.js API route)
 */
export const sendChatMessageStream = async (
  sessionId: string,
  message: string,
  onChunk: (chunk: string) => void,
): Promise<ApiResponse> => {
  try {
    const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";
    const headers = getAuthHeaders();
    headers['Accept'] = 'text/event-stream';

    // Use memory-enhanced endpoint which supports streaming
    const response = await fetch(
      `${BACKEND_API_URL}/memory-enhanced-chat?stream=true`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          message,
          sessionId,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Failed to send message');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'chunk' && data.content) {
              fullResponse += data.content;
              onChunk(data.content);
            } else if (data.type === 'complete') {
              return {
                message: data.content || fullResponse,
                response: data.content || fullResponse,
                analysis: data.analysis,
                metadata: data.metadata,
              };
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    return {
      message: fullResponse,
      response: fullResponse,
    };
  } catch (error: any) {
    logger.error('Error sending streaming message', error);
    throw error;
  }
};

export const sendChatMessage = async (
  sessionId: string,
  message: string
): Promise<ApiResponse> => {
  try {
    logger.debug(`Sending message to session ${sessionId}`);
    const response = await fetchWithRetry(
      `${API_BASE}/sessions/${sessionId}/messages`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ message }),
      },
      1,
      30000
    );

    if (!response.ok) {
      const error = await parseJsonSafely(response);
      logger.error("Failed to send message", error);
      throw new Error(error.error || "Failed to send message");
    }

    const data = await parseJsonSafely(response);
    logger.debug("Message sent successfully", data);
    return data;
  } catch (error) {
    logger.error("Error sending chat message", error);
    throw error;
  }
};

export const getChatHistory = async (
  sessionId: string
): Promise<ChatMessage[]> => {
  try {
    logger.debug(`Fetching chat history for session ${sessionId}`);
    const response = await fetchWithRetry(
      `${API_BASE}/sessions/${sessionId}/history`,
      {
        headers: getAuthHeaders(),
      },
      1,
      20000
    );

    if (!response.ok) {
      const error = await parseJsonSafely(response);
      logger.error("Failed to fetch chat history", error);
      throw new Error(error.error || "Failed to fetch chat history");
    }

    const data = await parseJsonSafely(response);
    logger.debug("Received chat history", data);

    // Handle both direct array and wrapped response formats
    let messages = data;
    if (data && data.history && Array.isArray(data.history)) {
      messages = data.history;
    } else if (!Array.isArray(data)) {
      logger.error("Invalid chat history format", undefined, data);
      throw new Error("Invalid chat history format");
    }

    // Ensure each message has the correct format
    return messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      metadata: msg.metadata,
    }));
  } catch (error) {
    logger.error("Error fetching chat history", error);
    throw error;
  }
};

export const getAllChatSessions = async (): Promise<ChatSession[]> => {
  try {
    logger.debug("Fetching all chat sessions...");
    const response = await fetchWithRetry(`${API_BASE}/sessions`, {
      headers: getAuthHeaders(),
    }, 1, 15000);

    if (!response.ok) {
      const error = await parseJsonSafely(response);
      logger.error("Failed to fetch chat sessions", error);
      throw new Error(error.error || "Failed to fetch chat sessions");
    }

    const data = await parseJsonSafely(response);
    logger.debug("Received chat sessions data:", data);

    // Ensure data is an array - backend returns { success, sessions }
    const sessions = Array.isArray(data) ? data : (data.sessions || []);
    
    logger.debug(`Found ${sessions.length} total sessions`);
    
    // Filter out sessions with no messages
    // Backend returns messageCount, not the full messages array in the list
    const sessionsWithMessages = sessions.filter((session: any) => {
      const hasMessages = (session.messageCount && session.messageCount > 0) || 
                         (session.messages && session.messages.length > 0);
      return hasMessages;
    });
    
    logger.debug(`Filtered to ${sessionsWithMessages.length} sessions with messages`);
    
    return sessionsWithMessages.map((session: any) => {
      // Ensure dates are valid - backend sends startTime, not createdAt
      const createdAt = new Date(session.startTime || session.createdAt || Date.now());
      const updatedAt = new Date(session.updatedAt || session.startTime || Date.now());

      // Backend only sends messageCount and lastMessage in list view, not full messages
      const messages = session.messages || (session.lastMessage ? [session.lastMessage] : []);

      return {
        sessionId: session.sessionId || session.id,
        title: session.title || undefined,
        createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
        updatedAt: isNaN(updatedAt.getTime()) ? new Date() : updatedAt,
        messages: messages.map((msg: any) => ({
          role: msg.role || 'user',
          content: msg.content || '',
          timestamp: new Date(msg.timestamp || Date.now()),
          metadata: msg.metadata || {},
        })),
      };
    });
  } catch (error) {
    logger.error("Error fetching chat sessions", error);
    return []; // Return empty array instead of throwing
  }
};

export const completeChatSession = async (sessionId: string): Promise<ApiResponse> => {
  try {
    logger.debug(`Completing chat session ${sessionId}`);
    const response = await fetchWithRetry(
      `${API_BASE}/sessions/${sessionId}/complete`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      },
      1,
      20000
    );

    if (!response.ok) {
      const error = await parseJsonSafely(response);
      logger.error("Failed to complete chat session", error);
      throw new Error(error.error || "Failed to complete chat session");
    }

    const data = await parseJsonSafely(response);
    logger.debug("Chat session completed successfully", data);
    return data;
  } catch (error) {
    logger.error("Error completing chat session", error);
    throw error;
  }
};

export const deleteChatSession = async (sessionId: string): Promise<ApiResponse> => {
  try {
    logger.debug(`Deleting chat session ${sessionId}`);
    const response = await fetchWithRetry(
      `${API_BASE}/sessions/${sessionId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      },
      1,
      10000
    );

    if (!response.ok) {
      const error = await parseJsonSafely(response);
      logger.error("Failed to delete chat session", error);
      throw new Error(error.error || "Failed to delete chat session");
    }

    const data = await parseJsonSafely(response);
    logger.debug("Chat session deleted successfully", data);
    return data;
  } catch (error) {
    logger.error("Error deleting chat session", error);
    throw error;
  }
};
