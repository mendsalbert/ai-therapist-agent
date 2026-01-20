// Backend Service Layer for Hope Backend Integration
// This service handles all communication with your backend API

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  isAuthError?: boolean;
  isNetworkError?: boolean;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  token?: string;
}

export interface LoginResponse {
  user?: User;
  token?: string;
  requiresVerification?: boolean;
  userId?: string;
  message?: string;
}

export interface RegisterResponse {
  user?: User;
  token?: string;
  requiresVerification?: boolean;
  userId?: string;
  message?: string;
}

class BackendService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = BACKEND_BASE_URL;
    this.loadAuthToken();
  }

  private loadAuthToken(): void {
    if (typeof window !== 'undefined') {
      const persistedToken =
        localStorage.getItem('token') ||
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken') ||
        null;
      this.authToken = persistedToken;
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    let token = this.authToken;
    if (typeof window !== 'undefined') {
      token =
        token ||
        localStorage.getItem('token') ||
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken') ||
        null;
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  public async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`Making request to: ${url}`);
      console.log(`Backend URL: ${this.baseURL}`);
      console.log(`Full URL: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: AbortSignal.timeout(45000), // Increased to 45 seconds for Render cold starts
      });

      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorText = `HTTP ${response.status}`;
        let isAuthError = false;
        
        try {
          const data = await response.json();
          if (data?.error) {
            errorText = data.error;
            // Check if this is specifically an authentication error
            isAuthError = response.status === 401 || 
                         data.error.toLowerCase().includes('invalid') ||
                         data.error.toLowerCase().includes('credential') ||
                         data.error.toLowerCase().includes('unauthorized');
          } else if (data?.message) {
            errorText = data.message;
          }
        } catch (e) {
          errorText = response.statusText || errorText;
          isAuthError = response.status === 401;
        }
        
        return {
          success: false,
          error: errorText,
          isAuthError, // Add flag to distinguish auth errors
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      let errorMessage = 'Network error';
      let isNetworkError = false;
      
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError' || error.message.includes('timed out')) {
          errorMessage = 'Server is taking too long (may be starting up). Please try again in 30 seconds.';
          isNetworkError = true;
        } else if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the server. This might be a temporary issue. Please try again in a moment.';
          isNetworkError = true;
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Server configuration issue. Please try again.';
          isNetworkError = false;
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        isNetworkError, // Add flag to distinguish network errors
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    console.log("Backend service: Attempting login for email:", email);
    const response = await this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    console.log("Backend service: Login response:", response);

    // Only store token if login was successful and user is verified
    if (response.success && response.data && response.data.token && !response.data.requiresVerification) {
      console.log("Backend service: Login successful, storing token");
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('authToken', response.data.token);
        this.authToken = response.data.token;
      }
    } else if (response.data?.requiresVerification) {
      console.log("Backend service: Email verification required");
    } else {
      console.log("Backend service: Login failed:", response.error);
    }

    return response;
  }

  async register(userData: { name: string; email: string; password: string }): Promise<ApiResponse<RegisterResponse>> {
    const response = await this.makeRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Only store token if verification is not required (backwards compatibility)
    if (response.success && response.data && response.data.token && !response.data.requiresVerification) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('authToken', response.data.token);
        this.authToken = response.data.token;
      }
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.makeRequest('/auth/logout', {
      method: 'POST',
    });

    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      this.authToken = null;
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/me');
  }

  // Journal methods (needed for memory-enhanced chat integration)
  async createJournalEntry(entryData: any): Promise<ApiResponse> {
    return this.makeRequest('/journal', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  }

  async getJournalEntries(limit: number = 100): Promise<ApiResponse> {
    const response = await this.makeRequest(`/journal?limit=${limit}`);
    
    console.log('getJournalEntries raw response:', response);
    console.log('response.data type:', typeof response.data);
    console.log('response.data:', response.data);
    
    // Normalize response format
    // Backend returns { success, entries, pagination }
    if (response.success && response.data) {
      const data = response.data as any;
      console.log('Extracted data:', data);
      console.log('data.entries:', data.entries);
      
      // If backend returns nested structure, extract entries
      if (data.entries && Array.isArray(data.entries)) {
        console.log('Returning entries array:', data.entries.length);
        return {
          success: true,
          data: data.entries
        };
      }
      
      // If data itself is an array of entries
      if (Array.isArray(data)) {
        console.log('Data is array, returning directly');
        return {
          success: true,
          data: data
        };
      }
    }
    
    console.error('Could not extract entries from response');
    return response;
  }

  async updateJournalEntry(entryId: string, entryData: any): Promise<ApiResponse> {
    return this.makeRequest(`/journal/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    });
  }

  async deleteJournalEntry(entryId: string): Promise<ApiResponse> {
    return this.makeRequest(`/journal/${entryId}`, {
      method: 'DELETE',
    });
  }

  // Memory-enhanced chat method
  async sendMemoryEnhancedMessage(messageData: any): Promise<ApiResponse> {
    return this.makeRequest('/memory-enhanced-chat', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  /**
   * Send memory-enhanced message with streaming support
   * @param messageData - Message data to send
   * @param onChunk - Callback for each chunk received
   * @returns Promise that resolves when streaming is complete
   */
  async sendMemoryEnhancedMessageStream(
    messageData: any,
    onChunk: (chunk: string) => void
  ): Promise<ApiResponse> {
    return new Promise((resolve, reject) => {
      try {
        const url = `${this.baseURL}/memory-enhanced-chat?stream=true`;
        const token = this.authToken || 
          (typeof window !== 'undefined' ? 
            (localStorage.getItem('token') || localStorage.getItem('authToken')) : null);

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(messageData),
        })
          .then(async (response) => {
            if (!response.ok) {
              // Try to read error message
              try {
                const errorText = await response.text();
                const error = errorText ? JSON.parse(errorText) : { error: 'Request failed' };
                reject(new Error(error.error || 'Request failed'));
              } catch {
                reject(new Error(`Request failed with status ${response.status}`));
              }
              return;
            }

            const reader = response.body?.getReader();
            if (!reader) {
              reject(new Error('No response body'));
              return;
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
                      resolve({
                        success: true,
                        data: {
                          response: data.content || fullResponse,
                          isFailover: data.isFailover || false,
                        },
                      });
                      return;
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }

            // If we get here without a complete signal, resolve with what we have
            resolve({
              success: true,
              data: {
                response: fullResponse,
                isFailover: false,
              },
            });
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Memory management methods
  async getUserMemories(): Promise<ApiResponse<Array<{
    id: string;
    type: string;
    content: string;
    importance: number;
    tags: string[];
    context?: string;
    timestamp: string;
    createdAt: string;
  }>>> {
    return this.makeRequest('/memory-enhanced-chat/memories', {
      method: 'GET',
    });
  }

  async updateMemory(memoryId: string, updates: {
    content?: string;
    type?: string;
    importance?: number;
    tags?: string[];
    context?: string;
  }): Promise<ApiResponse> {
    return this.makeRequest(`/memory-enhanced-chat/memories/${memoryId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteMemory(memoryId: string): Promise<ApiResponse> {
    return this.makeRequest(`/memory-enhanced-chat/memories/${memoryId}`, {
      method: 'DELETE',
    });
  }

  // User Profile methods (needed for rescue pair matching)
  async createUserProfile(profileData: any): Promise<ApiResponse> {
    return this.makeRequest('/user/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async getUserProfile(): Promise<ApiResponse> {
    // Use local API route instead of direct backend call
    try {
      const token = this.authToken || 
        (typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('authToken') : null);

      if (!token) {
        return { success: false, error: 'No authentication token' };
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to fetch profile' };
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { success: false, error: 'Network error' };
    }
  }

  async updateUserProfile(profileData: any): Promise<ApiResponse> {
    // Use local API route instead of direct backend call
    try {
      const token = this.authToken || 
        (typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('authToken') : null);

      if (!token) {
        return { success: false, error: 'No authentication token' };
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData),
        signal: AbortSignal.timeout(45000) // Increased to 45 seconds for Render cold starts
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to update profile' };
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      
      let isNetworkError = false;
      let errorMessage = 'Network error';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError' || error.message.includes('timed out')) {
          errorMessage = 'Server is taking too long (may be starting up). Please try again in 30 seconds.';
          isNetworkError = true;
        } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to server';
          isNetworkError = true;
        } else {
          errorMessage = error.message;
        }
      }
      
      return { 
        success: false, 
        error: errorMessage,
        isNetworkError 
      };
    }
  }

  async updateUser(userData: { name?: string; email?: string }): Promise<ApiResponse> {
    // Use local API route instead of direct backend call
    try {
      const token = this.authToken || 
        (typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('authToken') : null);

      if (!token) {
        return { success: false, error: 'No authentication token' };
      }

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        signal: AbortSignal.timeout(45000) // Increased to 45 seconds for Render cold starts
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to update user' };
      }
    } catch (error) {
      console.error('Error updating user:', error);
      
      let isNetworkError = false;
      let errorMessage = 'Network error';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError' || error.message.includes('timed out')) {
          errorMessage = 'Server is taking too long (may be starting up). Please try again in 30 seconds.';
          isNetworkError = true;
        } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to server';
          isNetworkError = true;
        } else {
          errorMessage = error.message;
        }
      }
      
      return { 
        success: false, 
        error: errorMessage,
        isNetworkError 
      };
    }
  }

  // Rescue Pair methods - Updated to match backend API
  async getRescuePairList(): Promise<ApiResponse> {
    return this.makeRequest('/rescue-pairs');
  }

  async findMatches(preferences?: any): Promise<ApiResponse> {
    return this.makeRequest('/rescue-pairs/matches');
  }

  async acceptMatch(pairId: string): Promise<ApiResponse> {
    return this.makeRequest(`/rescue-pairs/${pairId}/accept`, {
      method: 'POST',
    });
  }

  async rejectMatch(pairId: string): Promise<ApiResponse> {
    return this.makeRequest(`/rescue-pairs/${pairId}/reject`, {
      method: 'POST',
    });
  }

  async createRescuePair(data: { targetUserId: string; preferences?: any }): Promise<ApiResponse> {
    return this.makeRequest('/rescue-pairs', {
      method: 'POST',
      body: JSON.stringify({ targetUserId: data.targetUserId }),
    });
  }

  async getRescuePairDetails(pairId: string): Promise<ApiResponse> {
    return this.makeRequest(`/rescue-pairs/${pairId}`);
  }

  async updateRescuePairStatus(pairId: string, status: string): Promise<ApiResponse> {
    return this.makeRequest(`/rescue-pairs/${pairId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest('/health');
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.healthCheck();
      return response.success;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  // Meditation methods (for admin and user access)
  async getMeditations(params?: { search?: string; category?: string; isPremium?: boolean; limit?: number; page?: number }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/meditations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.makeRequest(endpoint);
  }

  async getMeditation(meditationId: string): Promise<ApiResponse> {
    return this.makeRequest(`/meditations/${meditationId}`);
  }

  async createMeditation(meditationData: {
    title: string;
    description: string;
    duration: number;
    audioUrl: string;
    category: string;
    isPremium: boolean;
    tags: string[];
  }): Promise<ApiResponse> {
    return this.makeRequest('/meditations', {
      method: 'POST',
      body: JSON.stringify(meditationData),
    });
  }

  async uploadMeditationFile(file: File): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Get auth token directly
      let token = this.authToken;
      if (typeof window !== 'undefined') {
        token = token || localStorage.getItem('token') || localStorage.getItem('authToken') || null;
      }

      const response = await fetch(`${this.baseURL}/meditations/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
        signal: AbortSignal.timeout(120000)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { success: false, error: data.error || 'Upload failed' };
      }

      // expect { success, meditation } or { url }
      const url = data?.meditation?.audioUrl || data?.audioUrl || data?.url;
      return { success: true, data: { url } };
    } catch (error) {
      console.error('Direct upload error:', error);
      return { success: false, error: 'Failed to upload audio file' };
    }
  }

  async uploadMeditationWithMetadata(file: File, metadata: {
    title: string;
    description: string;
    duration: number;
    category: string;
    isPremium: boolean;
    tags: string[];
  }): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', metadata.title);
      formData.append('description', metadata.description);
      formData.append('duration', metadata.duration.toString());
      formData.append('category', metadata.category);
      formData.append('isPremium', metadata.isPremium.toString());
      formData.append('tags', JSON.stringify(metadata.tags));

      const token = this.authToken || 
        (typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('authToken') : null);

      const response = await fetch(`${this.baseURL}/meditations/upload`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData,
        signal: AbortSignal.timeout(180000)
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        return {
          success: true,
          data: result?.meditation || result?.data || result
        };
      } else {
        return { success: false, error: result?.error || 'Upload failed' };
      }
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'Failed to upload meditation' };
    }
  }

  async deleteMeditation(meditationId: string): Promise<ApiResponse> {
    return this.makeRequest(`/meditations/${meditationId}`, {
      method: 'DELETE',
    });
  }

  async updateMeditation(meditationId: string, meditationData: Partial<{
    title: string;
    description: string;
    duration: number;
    category: string;
    isPremium: boolean;
    tags: string[];
  }>): Promise<ApiResponse> {
    return this.makeRequest(`/meditations/${meditationId}`, {
      method: 'PUT',
      body: JSON.stringify(meditationData),
    });
  }

  // Subscription methods
  async getSubscriptionStatus(userId: string): Promise<ApiResponse> {
    return this.makeRequest(`/subscription/status?userId=${userId}`);
  }

  async startFreeTrial(): Promise<ApiResponse> {
    return this.makeRequest(`/subscription/start-trial`, {
      method: 'POST',
    });
  }

  // Rescue Pair / Matching methods - Additional methods for pricing features
  async getActiveMatches(): Promise<ApiResponse> {
    return this.makeRequest('/rescue-pairs/active');
  }

  async getChatSessions(): Promise<ApiResponse> {
    const response = await this.makeRequest('/chat/sessions');
    
    // Normalize response format
    // Backend returns { success, sessions }
    if (response.success && response.data) {
      const data = response.data as any;
      // If backend returns nested structure, extract sessions
      if (data.sessions) {
        return {
          success: true,
          data: data.sessions
        };
      }
    }
    
    return response;
  }

  async getMatchedChatHistory(matchId: string): Promise<ApiResponse> {
    return this.makeRequest(`/rescue-pairs/${matchId}/messages`);
  }

  async sendMatchedChatMessage(matchId: string, message: string): Promise<ApiResponse> {
    return this.makeRequest(`/rescue-pairs/${matchId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Video call methods for premium users
  async initiateVideoCall(matchId: string): Promise<ApiResponse> {
    return this.makeRequest(`/rescue-pairs/${matchId}/video-call`, {
      method: 'POST',
    });
  }

  async joinVideoCall(callId: string): Promise<ApiResponse> {
    return this.makeRequest(`/video-calls/${callId}/join`, {
      method: 'POST',
    });
  }

  // Safety and moderation methods
  async reportUser(userId: string, reason: string, details?: string): Promise<ApiResponse> {
    return this.makeRequest('/safety/report', {
      method: 'POST',
      body: JSON.stringify({ userId, reason, details }),
    });
  }

  async blockUser(userId: string): Promise<ApiResponse> {
    return this.makeRequest('/safety/block', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getBlockedUsers(): Promise<ApiResponse> {
    return this.makeRequest('/safety/blocked');
  }

  // Crisis support escalation
  async escalateToCrisisSupport(details: string): Promise<ApiResponse> {
    return this.makeRequest('/crisis/escalate', {
      method: 'POST',
      body: JSON.stringify({ details, timestamp: new Date().toISOString() }),
    });
  }

  // Meditation session methods
  async getMeditationSessions(): Promise<ApiResponse> {
    return this.makeRequest('/meditation-sessions');
  }

  async createMeditationSession(sessionData: any): Promise<ApiResponse> {
    return this.makeRequest('/meditation-sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  // Mood entries methods
  async getMoodEntries(): Promise<ApiResponse> {
    return this.makeRequest('/mood');
  }

  async createMoodEntry(moodData: any): Promise<ApiResponse> {
    return this.makeRequest('/mood', {
      method: 'POST',
      body: JSON.stringify(moodData),
    });
  }

  // Activity methods
  async createActivity(activityData: any): Promise<ApiResponse> {
    return this.makeRequest('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  // Chat message methods
  async sendChatMessage(sessionId: string, message: string): Promise<ApiResponse> {
    return this.makeRequest(`/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
}

export const backendService = new BackendService();
