// CBT Service for Backend Integration

import { backendService } from './backend-service';

export interface CBTThoughtRecord {
  id?: string;
  situation: string;
  automaticThoughts: string;
  emotions: string[];
  emotionIntensity: number;
  evidenceFor: string;
  evidenceAgainst: string;
  balancedThought: string;
  cognitiveDistortions: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CBTMoodEntry {
  id?: string;
  score: number;
  triggers: string[];
  copingStrategies: string[];
  thoughts: string;
  situation: string;
  cbtInsights?: {
    cognitiveDistortions: string[];
    suggestedChallenges: string[];
    balancedThoughts: string[];
  };
  createdAt?: Date;
}

export interface CBTActivity {
  id?: string;
  type: 'thought_record' | 'mood_entry' | 'ai_cbt_session' | 'cbt_insight';
  data: any;
  effectiveness?: number;
  moodBefore?: number;
  moodAfter?: number;
  createdAt?: Date;
}

export interface CBTProgress {
  thoughtRecordsCompleted: number;
  moodEntriesWithCBT: number;
  cognitiveDistortionsIdentified: number;
  balancedThoughtsGenerated: number;
  cbtStreak: number;
  lastCBTActivity: Date;
  weeklyProgress: {
    week: string;
    thoughtRecords: number;
    moodEntries: number;
    distortionsChallenged: number;
    moodImprovement: number;
  }[];
}

export interface CBTInsights {
  commonDistortions: Array<{
    distortion: string;
    frequency: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  effectiveTechniques: Array<{
    technique: string;
    effectiveness: number;
    usage: number;
  }>;
  moodCBTCorrelation: number;
  recommendations: string[];
  generatedAt: Date;
}

export class CBTService {
  /**
   * Save a thought record
   */
  async saveThoughtRecord(thoughtRecord: CBTThoughtRecord) {
    return await backendService.makeRequest('/cbt/thought-records', {
      method: 'POST',
      body: JSON.stringify(thoughtRecord)
    });
  }

  /**
   * Get thought records
   */
  async getThoughtRecords(limit = 10, offset = 0) {
    return await backendService.makeRequest(`/cbt/thought-records?limit=${limit}&offset=${offset}`);
  }

  /**
   * Save a CBT-enhanced mood entry
   */
  async saveMoodEntry(moodEntry: CBTMoodEntry) {
    return await backendService.makeRequest('/cbt/mood-entries', {
      method: 'POST',
      body: JSON.stringify(moodEntry)
    });
  }

  /**
   * Get mood entries with CBT data
   */
  async getMoodEntries(limit = 10, offset = 0, period = '30days') {
    return await backendService.makeRequest(`/cbt/mood-entries?limit=${limit}&offset=${offset}&period=${period}`);
  }

  /**
   * Save CBT activity
   */
  async saveCBTActivity(activity: CBTActivity) {
    return await backendService.makeRequest('/cbt/activities', {
      method: 'POST',
      body: JSON.stringify(activity)
    });
  }

  /**
   * Get CBT activities
   */
  async getCBTActivities(limit = 10, offset = 0, type?: string) {
    let url = `/cbt/activities?limit=${limit}&offset=${offset}`;
    if (type) {
      url += `&type=${type}`;
    }
    return await backendService.makeRequest(url);
  }

  /**
   * Get CBT progress analytics
   */
  async getCBTProgress() {
    return await backendService.makeRequest('/cbt/progress');
  }

  /**
   * Get CBT insights
   */
  async getCBTInsights() {
    return await backendService.makeRequest('/cbt/insights');
  }

  /**
   * Get CBT analytics
   */
  async getCBTAnalytics(period = '30days') {
    return await backendService.makeRequest(`/cbt/analytics?period=${period}`);
  }

  /**
   * Generate CBT insights for text
   */
  async generateCBTInsights(text: string, type: 'thought_analysis' | 'mood_analysis' | 'general_insights', additionalData?: any) {
    return await backendService.makeRequest('/cbt/insights/generate', {
      method: 'POST',
      body: JSON.stringify({
        text,
        type,
        ...additionalData
      })
    });
  }

  /**
   * Track CBT session effectiveness
   */
  async trackCBTSession(sessionData: {
    type: string;
    duration: number;
    techniques: string[];
    moodBefore: number;
    moodAfter: number;
    effectiveness: number;
  }) {
    return await backendService.makeRequest('/cbt/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  }

  /**
   * Get CBT recommendations
   */
  async getCBTRecommendations() {
    return await backendService.makeRequest('/cbt/recommendations');
  }

  /**
   * Update CBT progress
   */
  async updateCBTProgress(progressData: Partial<CBTProgress>) {
    return await backendService.makeRequest('/cbt/progress', {
      method: 'PUT',
      body: JSON.stringify(progressData)
    });
  }
}

export const cbtService = new CBTService();
