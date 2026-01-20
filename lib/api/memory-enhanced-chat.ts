// Backend Integration for Memory-Enhanced Therapy Chat
// This integrates with your existing backend API

import { userMemoryManager } from "@/lib/memory/user-memory";

async function fetchWithRetry(url: string, options: RequestInit, retries = 1, timeoutMs = 25000): Promise<Response> {
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

export interface MemoryEnhancedChatRequest {
  message: string;
  sessionId: string;
  userId: string;
  context: string;
  suggestions: string[];
  userMemory: any;
  conversation?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface MemoryEnhancedChatResponse {
  response: string;
  insights: string[];
  techniques: string[];
  breakthroughs: string[];
  moodAnalysis?: {
    current: number;
    trend: string;
    triggers: string[];
  };
  personalizedSuggestions: string[];
}

// Send message to backend with memory context
export async function sendMemoryEnhancedMessage(
  message: string,
  sessionId: string,
  userId: string,
  conversation?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<MemoryEnhancedChatResponse> {
  try {
    // Get user memory context
    const userMemory = await userMemoryManager.loadUserMemory(userId);
    // Capture key facts from the live message so they persist across chats
    userMemoryManager.captureFactsFromMessage(message);
    await userMemoryManager.saveUserMemory();
    const context = userMemoryManager.getTherapyContext();
    const suggestions = userMemoryManager.getTherapySuggestions();

    const compactMemory = {
      facts: userMemory.facts?.slice(-30) ?? [],
      summaries: userMemory.summaries?.slice(-6) ?? [],
      profile: userMemory.profile,
      recentMood: userMemory.moodPatterns.slice(-3)
    };

    // Prepare request payload
    const requestPayload: MemoryEnhancedChatRequest = {
      message,
      sessionId,
      userId,
      context,
      suggestions,
      userMemory: compactMemory,
      ...(conversation && conversation.length > 0 && { conversation })
    };

    // Send to your backend
    const response = await fetchWithRetry('/api/chat/memory-enhanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(requestPayload)
    }, 1, 30000);

    if (!response.ok) {
      const err = await parseJsonSafely(response);
      throw new Error(err?.error || `HTTP ${response.status}`);
    }

    const data = await parseJsonSafely(response);
    
    // Update user memory with this therapy session
    await userMemoryManager.addTherapySession({
      date: new Date(),
      topics: extractTopics(message),
      techniques: data.techniques || [],
      breakthroughs: data.breakthroughs || [],
      concerns: extractConcerns(message),
      goals: [],
      mood: data.moodAnalysis?.current || 3,
      summary: `Discussed: ${extractTopics(message).join(', ')}`
    });

    return data;
  } catch (error) {
    console.error('Error sending memory-enhanced message:', error);
    // Only fallback if network/timeout (no valid response received)
    if (error instanceof Error && (error.name === 'AbortError' || /fetch|Network|Failed to fetch|timeout/i.test(error.message))) {
      return await generateLocalResponse(message, userId);
    }
    // If backend returned a structured error, surface it
    throw error;
  }
}

// Fallback local response generation
async function generateLocalResponse(
  message: string, 
  userId: string
): Promise<MemoryEnhancedChatResponse> {
  const userMemory = await userMemoryManager.loadUserMemory(userId);
  userMemoryManager.captureFactsFromMessage(message);
  await userMemoryManager.saveUserMemory();
  const context = userMemoryManager.getTherapyContext();
  const suggestions = userMemoryManager.getTherapySuggestions();

  const lowerMessage = message.toLowerCase();
  let response = "";
  let insights: string[] = [];
  let techniques: string[] = [];
  let breakthroughs: string[] = [];
  let personalizedSuggestions: string[] = [];

  // Check if user mentioned something from their journal
  if (userMemory.journalEntries.length > 0) {
    const recentEntry = userMemory.journalEntries[userMemory.journalEntries.length - 1];
    if (lowerMessage.includes('mood') || lowerMessage.includes('feeling')) {
      response += `I notice from your recent journal entry that you've been feeling ${recentEntry.emotionalState} (mood: ${recentEntry.mood}/6). `;
      insights.push(`Referenced recent journal mood: ${recentEntry.mood}/6`);
    }
  }

  // Check meditation history
  if (userMemory.meditationHistory.length > 0) {
    const recentMeditation = userMemory.meditationHistory[userMemory.meditationHistory.length - 1];
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety')) {
      response += `I see you've been practicing ${recentMeditation.type} meditation recently. `;
      if (recentMeditation.effectiveness > 0.7) {
        response += `It seems to be working well for you (effectiveness: ${Math.round(recentMeditation.effectiveness * 100)}%). `;
        techniques.push(recentMeditation.type);
      }
    }
  }

  // Add personalized suggestions
  if (suggestions.length > 0) {
    response += suggestions[0] + " ";
    personalizedSuggestions = suggestions;
  }

  // Generate contextual response based on message content
  if (lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
    response += "Let's work through this anxiety together. I'd like to try a grounding technique with you. Can you tell me 5 things you can see around you right now?";
    techniques.push("grounding technique");
  } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
    response += "I hear that you're feeling down. This is a difficult time, and I want you to know that your feelings are valid. Let's explore what might be contributing to these feelings.";
    techniques.push("validation and exploration");
  } else if (lowerMessage.includes('grateful') || lowerMessage.includes('thankful')) {
    response += "I love that you're practicing gratitude! This is such a powerful tool for mental well-being. What specifically are you feeling grateful for today?";
    techniques.push("gratitude practice");
    breakthroughs.push("Positive mindset shift");
  } else {
    response += "Thank you for sharing that with me. I'm here to listen and support you. Can you tell me more about how this is affecting you?";
  }

  // Add memory-based insights
  if (userMemory.insights.length > 0) {
    const recentInsight = userMemory.insights[userMemory.insights.length - 1];
    if (recentInsight.type === 'concern') {
      response += ` I've noticed this theme coming up in our conversations. Let's explore this pattern together.`;
      insights.push(`Pattern recognition: ${recentInsight.content}`);
    }
  }

  return {
    response,
    insights,
    techniques,
    breakthroughs,
    moodAnalysis: {
      current: userMemory.moodPatterns[userMemory.moodPatterns.length - 1]?.mood || 3,
      trend: getMoodTrend(userMemory),
      triggers: extractTopics(message)
    },
    personalizedSuggestions
  };
}

// Helper functions
function extractTopics(text: string): string[] {
  const topics = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('work') || lowerText.includes('job')) topics.push('work');
  if (lowerText.includes('relationship') || lowerText.includes('partner')) topics.push('relationships');
  if (lowerText.includes('anxiety') || lowerText.includes('worried')) topics.push('anxiety');
  if (lowerText.includes('depression') || lowerText.includes('sad')) topics.push('depression');
  if (lowerText.includes('sleep')) topics.push('sleep');
  if (lowerText.includes('health')) topics.push('health');
  
  return topics;
}

function extractConcerns(text: string): string[] {
  const concerns = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('worried') || lowerText.includes('concerned')) concerns.push('worry');
  if (lowerText.includes('stressed') || lowerText.includes('overwhelmed')) concerns.push('stress');
  if (lowerText.includes('lonely') || lowerText.includes('isolated')) concerns.push('loneliness');
  
  return concerns;
}

function getMoodTrend(userMemory: any): string {
  if (!userMemory.moodPatterns || userMemory.moodPatterns.length < 2) {
    return 'Insufficient data for mood trend analysis';
  }

  const recent = userMemory.moodPatterns.slice(-7);
  const older = userMemory.moodPatterns.slice(-14, -7);

  if (recent.length === 0 || older.length === 0) {
    return 'Insufficient data for mood trend analysis';
  }

  const recentAvg = recent.reduce((sum: number, p: any) => sum + p.mood, 0) / recent.length;
  const olderAvg = older.reduce((sum: number, p: any) => sum + p.mood, 0) / older.length;

  if (recentAvg > olderAvg + 0.5) {
    return 'Mood is improving over the past week';
  } else if (recentAvg < olderAvg - 0.5) {
    return 'Mood has declined over the past week';
  } else {
    return 'Mood has been relatively stable';
  }
}
