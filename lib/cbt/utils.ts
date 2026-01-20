// CBT Utility Functions

import { COGNITIVE_DISTORTIONS, EMOTIONS, COPING_STRATEGIES, CognitiveDistortion, Emotion, CopingStrategy } from './types';

/**
 * Detect cognitive distortions in text
 */
export function detectCognitiveDistortions(text: string): CognitiveDistortion[] {
  const detected: CognitiveDistortion[] = [];
  const lowerText = text.toLowerCase();

  // Simple keyword-based detection (in production, use NLP/ML)
  const distortionKeywords: { [key in CognitiveDistortion]: string[] } = {
    'All-or-nothing thinking': ['always', 'never', 'all', 'none', 'every', 'completely'],
    'Catastrophizing': ['disaster', 'terrible', 'awful', 'horrible', 'worst', 'ruined'],
    'Mind reading': ['they think', 'they believe', 'they feel', 'they know'],
    'Fortune telling': ['will never', 'will always', 'going to fail', 'will succeed'],
    'Should statements': ['should', 'must', 'have to', 'ought to', 'supposed to'],
    'Personalization': ['my fault', 'because of me', 'i caused', 'i made'],
    'Mental filter': ['only', 'just', 'nothing but', 'all bad'],
    'Disqualifying the positive': ['but', 'however', 'yes but', 'not really'],
    'Jumping to conclusions': ['obviously', 'clearly', 'of course', 'naturally'],
    'Magnification/Minimization': ['huge', 'tiny', 'massive', 'insignificant'],
    'Emotional reasoning': ['i feel', 'i sense', 'i know because'],
    'Labeling': ['i am', 'you are', 'they are', 'always a', 'never a']
  };

  Object.entries(distortionKeywords).forEach(([distortion, keywords]) => {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      detected.push(distortion as CognitiveDistortion);
    }
  });

  return detected;
}

/**
 * Generate thought challenging questions
 */
export function generateThoughtChallengingQuestions(thought: string, distortions: CognitiveDistortion[]): string[] {
  const questions: string[] = [];

  if (distortions.includes('All-or-nothing thinking')) {
    questions.push('Is this really all-or-nothing? What are the shades of gray?');
  }

  if (distortions.includes('Catastrophizing')) {
    questions.push('What\'s the worst that could realistically happen?');
    questions.push('What\'s the best that could happen?');
    questions.push('What\'s most likely to happen?');
  }

  if (distortions.includes('Mind reading')) {
    questions.push('What evidence do you have for this assumption?');
    questions.push('What other explanations could there be?');
  }

  if (distortions.includes('Fortune telling')) {
    questions.push('Can you really predict the future?');
    questions.push('What evidence do you have for this prediction?');
  }

  if (distortions.includes('Should statements')) {
    questions.push('What would you tell a friend in this situation?');
    questions.push('Are these expectations realistic?');
  }

  if (distortions.includes('Personalization')) {
    questions.push('What other factors might be involved?');
    questions.push('Is this really all about you?');
  }

  // General challenging questions
  questions.push('What evidence supports this thought?');
  questions.push('What evidence contradicts this thought?');
  questions.push('What would you tell a friend who had this thought?');
  questions.push('How would you think about this in 5 years?');

  return questions.slice(0, 5); // Limit to 5 questions
}

/**
 * Generate balanced thought suggestions
 */
export function generateBalancedThoughtSuggestions(
  originalThought: string,
  evidenceFor: string,
  evidenceAgainst: string,
  distortions: CognitiveDistortion[]
): string[] {
  const suggestions: string[] = [];

  // Evidence-based balanced thoughts
  if (evidenceFor && evidenceAgainst) {
    suggestions.push(`While ${evidenceFor}, it's also true that ${evidenceAgainst}.`);
  }

  // Distortion-specific balanced thoughts
  if (distortions.includes('All-or-nothing thinking')) {
    suggestions.push('There are many possibilities between the extremes.');
  }

  if (distortions.includes('Catastrophizing')) {
    suggestions.push('This situation is challenging but manageable.');
  }

  if (distortions.includes('Mind reading')) {
    suggestions.push('I can\'t know for certain what others are thinking.');
  }

  if (distortions.includes('Fortune telling')) {
    suggestions.push('I can\'t predict the future, but I can prepare for different outcomes.');
  }

  // General balanced thought templates
  suggestions.push('This is a difficult situation, but I can handle it.');
  suggestions.push('I\'m doing the best I can with the information I have.');
  suggestions.push('This feeling will pass, and I have tools to cope.');

  return suggestions.slice(0, 4); // Limit to 4 suggestions
}

/**
 * Suggest coping strategies based on mood and situation
 */
export function suggestCopingStrategies(
  mood: number,
  emotions: Emotion[],
  situation: string
): CopingStrategy[] {
  const strategies: CopingStrategy[] = [];

  // Mood-based suggestions
  if (mood <= 3) {
    strategies.push('Deep breathing', 'Progressive muscle relaxation', 'Mindfulness meditation');
  } else if (mood <= 6) {
    strategies.push('Physical exercise', 'Going for a walk', 'Listening to music');
  } else {
    strategies.push('Practicing gratitude', 'Talking to someone', 'Journaling');
  }

  // Emotion-based suggestions
  if (emotions.includes('Anxious') || emotions.includes('Fear')) {
    strategies.push('Deep breathing', 'Mindfulness meditation', 'Progressive muscle relaxation');
  }

  if (emotions.includes('Sad') || emotions.includes('Hopeless')) {
    strategies.push('Talking to someone', 'Physical exercise', 'Practicing gratitude');
  }

  if (emotions.includes('Angry') || emotions.includes('Frustrated')) {
    strategies.push('Physical exercise', 'Deep breathing', 'Going for a walk');
  }

  // Situation-based suggestions
  if (situation.toLowerCase().includes('work') || situation.toLowerCase().includes('job')) {
    strategies.push('Problem-solving', 'Deep breathing', 'Talking to someone');
  }

  if (situation.toLowerCase().includes('relationship') || situation.toLowerCase().includes('social')) {
    strategies.push('Talking to someone', 'Self-compassion', 'Mindfulness meditation');
  }

  // Remove duplicates and limit
  return [...new Set(strategies)].slice(0, 5);
}

/**
 * Calculate CBT effectiveness score
 */
export function calculateCBTEffectiveness(
  moodBefore: number,
  moodAfter: number,
  thoughtChallenging: boolean,
  balancedThought: boolean
): number {
  let score = 0;

  // Mood improvement
  const moodImprovement = moodAfter - moodBefore;
  score += Math.max(0, moodImprovement * 2); // Up to 20 points for mood improvement

  // Thought challenging
  if (thoughtChallenging) {
    score += 10;
  }

  // Balanced thought generation
  if (balancedThought) {
    score += 10;
  }

  // Cap at 40 points, convert to 1-10 scale
  return Math.min(10, Math.max(1, Math.round((score / 40) * 10)));
}

/**
 * Format CBT insights for display
 */
export function formatCBTInsights(insights: any): string[] {
  const formatted: string[] = [];

  if (insights.commonDistortions && insights.commonDistortions.length > 0) {
    const topDistortion = insights.commonDistortions[0];
    formatted.push(`Your most common cognitive distortion is "${topDistortion.distortion}" (${topDistortion.frequency} times).`);
  }

  if (insights.effectiveTechniques && insights.effectiveTechniques.length > 0) {
    const topTechnique = insights.effectiveTechniques[0];
    formatted.push(`Your most effective CBT technique is "${topTechnique.technique.replace('_', ' ')}" (${topTechnique.effectiveness}/10).`);
  }

  if (insights.moodCBTCorrelation !== undefined) {
    const correlation = insights.moodCBTCorrelation;
    if (correlation > 0.3) {
      formatted.push('Your CBT practice is positively impacting your mood!');
    } else if (correlation < -0.3) {
      formatted.push('Consider adjusting your CBT techniques for better mood impact.');
    }
  }

  return formatted;
}

/**
 * Validate CBT data
 */
export function validateCBTData(data: any, type: 'thought_record' | 'mood_entry'): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (type === 'thought_record') {
    if (!data.situation || data.situation.trim().length === 0) {
      errors.push('Situation is required');
    }
    if (!data.automaticThoughts || data.automaticThoughts.trim().length === 0) {
      errors.push('Automatic thoughts are required');
    }
    if (!data.emotions || data.emotions.length === 0) {
      errors.push('At least one emotion is required');
    }
    if (data.emotionIntensity < 1 || data.emotionIntensity > 10) {
      errors.push('Emotion intensity must be between 1 and 10');
    }
  }

  if (type === 'mood_entry') {
    if (data.score < 1 || data.score > 10) {
      errors.push('Mood score must be between 1 and 10');
    }
    if (!data.emotions || data.emotions.length === 0) {
      errors.push('At least one emotion is required');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
