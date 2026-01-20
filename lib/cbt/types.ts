// CBT Data Models and Type Definitions

export interface ThoughtRecord {
  id: string;
  userId: string;
  situation: string;
  automaticThoughts: string;
  emotions: string[];
  emotionIntensity: number; // 1-10 scale
  evidenceFor: string;
  evidenceAgainst: string;
  balancedThought: string;
  cognitiveDistortions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodEntry {
  id: string;
  userId: string;
  score: number; // 1-10 scale
  emotions: string[];
  triggers: string[];
  copingStrategies: string[];
  thoughts: string;
  situation: string;
  cbtInsights?: {
    cognitiveDistortions: string[];
    suggestedChallenges: string[];
    balancedThoughts: string[];
  };
  createdAt: Date;
}

export interface CBTProgress {
  userId: string;
  thoughtRecordsCompleted: number;
  moodEntriesWithCBT: number;
  cognitiveDistortionsIdentified: number;
  balancedThoughtsGenerated: number;
  cbtStreak: number; // consecutive days of CBT practice
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
  userId: string;
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

export interface CBTTemplate {
  id: string;
  name: string;
  description: string;
  type: 'thought_record' | 'mood_tracking' | 'behavioral_activation';
  fields: CBTField[];
  isPremium: boolean;
}

export interface CBTField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'range' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface CBTActivity {
  id: string;
  userId: string;
  type: 'thought_record' | 'mood_entry' | 'ai_cbt_session' | 'cbt_insight';
  data: any;
  effectiveness?: number; // 1-10 scale
  moodBefore?: number;
  moodAfter?: number;
  createdAt: Date;
}

export const COGNITIVE_DISTORTIONS = [
  'All-or-nothing thinking',
  'Catastrophizing',
  'Mind reading',
  'Fortune telling',
  'Should statements',
  'Personalization',
  'Mental filter',
  'Disqualifying the positive',
  'Jumping to conclusions',
  'Magnification/Minimization',
  'Emotional reasoning',
  'Labeling'
] as const;

export const EMOTIONS = [
  'Anxious', 'Sad', 'Angry', 'Frustrated', 'Guilty', 'Shame', 'Fear', 'Worry',
  'Hopeless', 'Overwhelmed', 'Lonely', 'Rejected', 'Inadequate', 'Worthless',
  'Happy', 'Content', 'Excited', 'Proud', 'Grateful', 'Hopeful', 'Confident'
] as const;

export const COPING_STRATEGIES = [
  'Deep breathing',
  'Progressive muscle relaxation',
  'Mindfulness meditation',
  'Physical exercise',
  'Talking to someone',
  'Journaling',
  'Listening to music',
  'Going for a walk',
  'Practicing gratitude',
  'Challenging negative thoughts',
  'Problem-solving',
  'Self-compassion'
] as const;

export type CognitiveDistortion = typeof COGNITIVE_DISTORTIONS[number];
export type Emotion = typeof EMOTIONS[number];
export type CopingStrategy = typeof COPING_STRATEGIES[number];
