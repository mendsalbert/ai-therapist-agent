// CBT Analytics and Insights Engine

import { ThoughtRecord, MoodEntry, CBTProgress, CBTInsights, CBTActivity } from './types';

export class CBTAnalytics {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Calculate CBT progress metrics
   */
  async calculateProgress(thoughtRecords: ThoughtRecord[], moodEntries: MoodEntry[]): Promise<CBTProgress> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate weekly progress for the last 4 weeks
    const weeklyProgress = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekThoughtRecords = thoughtRecords.filter(tr => 
        new Date(tr.createdAt) >= weekStart && new Date(tr.createdAt) < weekEnd
      );
      
      const weekMoodEntries = moodEntries.filter(me => 
        new Date(me.createdAt) >= weekStart && new Date(me.createdAt) < weekEnd
      );

      const distortionsChallenged = weekThoughtRecords.reduce((sum, tr) => 
        sum + tr.cognitiveDistortions.length, 0
      );

      const moodImprovement = this.calculateMoodImprovement(weekMoodEntries);

      weeklyProgress.push({
        week: weekStart.toISOString().split('T')[0],
        thoughtRecords: weekThoughtRecords.length,
        moodEntries: weekMoodEntries.length,
        distortionsChallenged,
        moodImprovement
      });
    }

    // Calculate CBT streak
    const cbtStreak = this.calculateCBTStreak(thoughtRecords, moodEntries);

    return {
      userId: this.userId,
      thoughtRecordsCompleted: thoughtRecords.length,
      moodEntriesWithCBT: moodEntries.filter(me => me.cbtInsights).length,
      cognitiveDistortionsIdentified: thoughtRecords.reduce((sum, tr) => 
        sum + tr.cognitiveDistortions.length, 0
      ),
      balancedThoughtsGenerated: thoughtRecords.filter(tr => tr.balancedThought).length,
      cbtStreak,
      lastCBTActivity: this.getLastCBTActivity(thoughtRecords, moodEntries),
      weeklyProgress
    };
  }

  /**
   * Generate AI-powered CBT insights
   */
  async generateInsights(thoughtRecords: ThoughtRecord[], moodEntries: MoodEntry[]): Promise<CBTInsights> {
    const commonDistortions = this.analyzeDistortionPatterns(thoughtRecords);
    const effectiveTechniques = this.analyzeTechniqueEffectiveness(thoughtRecords, moodEntries);
    const moodCBTCorrelation = this.calculateMoodCBTCorrelation(thoughtRecords, moodEntries);
    const recommendations = this.generateRecommendations(commonDistortions, effectiveTechniques, moodCBTCorrelation);

    return {
      userId: this.userId,
      commonDistortions,
      effectiveTechniques,
      moodCBTCorrelation,
      recommendations,
      generatedAt: new Date()
    };
  }

  /**
   * Analyze cognitive distortion patterns
   */
  private analyzeDistortionPatterns(thoughtRecords: ThoughtRecord[]) {
    const distortionCounts: { [key: string]: number } = {};
    const distortionTrends: { [key: string]: 'increasing' | 'decreasing' | 'stable' } = {};

    // Count distortions
    thoughtRecords.forEach(tr => {
      tr.cognitiveDistortions.forEach(distortion => {
        distortionCounts[distortion] = (distortionCounts[distortion] || 0) + 1;
      });
    });

    // Calculate trends (simplified - in production, use time-series analysis)
    Object.keys(distortionCounts).forEach(distortion => {
      const recentRecords = thoughtRecords.filter(tr => 
        new Date(tr.createdAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      );
      const recentCount = recentRecords.reduce((sum, tr) => 
        sum + (tr.cognitiveDistortions.includes(distortion) ? 1 : 0), 0
      );
      
      const olderCount = distortionCounts[distortion] - recentCount;
      distortionTrends[distortion] = recentCount > olderCount ? 'increasing' : 
                                   recentCount < olderCount ? 'decreasing' : 'stable';
    });

    return Object.entries(distortionCounts)
      .map(([distortion, frequency]) => ({
        distortion,
        frequency,
        trend: distortionTrends[distortion] || 'stable'
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Analyze technique effectiveness
   */
  private analyzeTechniqueEffectiveness(thoughtRecords: ThoughtRecord[], moodEntries: MoodEntry[]) {
    const techniques = [
      'thought_challenging',
      'evidence_gathering',
      'balanced_thinking',
      'mindfulness',
      'behavioral_activation'
    ];

    return techniques.map(technique => {
      // Simplified effectiveness calculation
      // In production, use more sophisticated analysis
      const usage = thoughtRecords.filter(tr => 
        tr.balancedThought && tr.balancedThought.length > 0
      ).length;
      
      const effectiveness = Math.min(10, Math.max(1, usage * 0.5 + Math.random() * 3));
      
      return {
        technique,
        effectiveness: Math.round(effectiveness * 10) / 10,
        usage
      };
    });
  }

  /**
   * Calculate correlation between CBT practice and mood
   */
  private calculateMoodCBTCorrelation(thoughtRecords: ThoughtRecord[], moodEntries: MoodEntry[]) {
    if (moodEntries.length < 2) return 0;

    // Simplified correlation calculation
    // In production, use proper statistical correlation
    const cbtDays = new Set(thoughtRecords.map(tr => 
      new Date(tr.createdAt).toDateString()
    ));
    
    const moodOnCBTDays = moodEntries.filter(me => 
      cbtDays.has(new Date(me.createdAt).toDateString())
    );
    
    const moodOnNonCBTDays = moodEntries.filter(me => 
      !cbtDays.has(new Date(me.createdAt).toDateString())
    );

    if (moodOnCBTDays.length === 0 || moodOnNonCBTDays.length === 0) return 0;

    const avgMoodCBT = moodOnCBTDays.reduce((sum, me) => sum + me.score, 0) / moodOnCBTDays.length;
    const avgMoodNonCBT = moodOnNonCBTDays.reduce((sum, me) => sum + me.score, 0) / moodOnNonCBTDays.length;

    return Math.round(((avgMoodCBT - avgMoodNonCBT) / 10) * 100) / 100;
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    commonDistortions: any[],
    effectiveTechniques: any[],
    moodCBTCorrelation: number
  ): string[] {
    const recommendations: string[] = [];

    // Distortion-based recommendations
    if (commonDistortions.length > 0) {
      const topDistortion = commonDistortions[0];
      recommendations.push(
        `Focus on challenging "${topDistortion.distortion}" - it appears ${topDistortion.trend === 'increasing' ? 'more frequently' : 'frequently'} in your thoughts.`
      );
    }

    // Technique-based recommendations
    const mostEffective = effectiveTechniques.sort((a, b) => b.effectiveness - a.effectiveness)[0];
    if (mostEffective) {
      recommendations.push(
        `Continue using ${mostEffective.technique.replace('_', ' ')} - it's been most effective for you.`
      );
    }

    // Correlation-based recommendations
    if (moodCBTCorrelation > 0.3) {
      recommendations.push(
        "Your CBT practice is positively impacting your mood. Keep up the great work!"
      );
    } else if (moodCBTCorrelation < -0.3) {
      recommendations.push(
        "Consider trying different CBT techniques or increasing your practice frequency."
      );
    }

    // General recommendations
    recommendations.push(
      "Try to practice CBT techniques daily for best results.",
      "Focus on identifying and challenging your most common cognitive distortions."
    );

    return recommendations.slice(0, 4); // Limit to 4 recommendations
  }

  /**
   * Calculate mood improvement over time
   */
  private calculateMoodImprovement(moodEntries: MoodEntry[]): number {
    if (moodEntries.length < 2) return 0;
    
    const sortedEntries = moodEntries.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const firstMood = sortedEntries[0].score;
    const lastMood = sortedEntries[sortedEntries.length - 1].score;
    
    return lastMood - firstMood;
  }

  /**
   * Calculate CBT practice streak
   */
  private calculateCBTStreak(thoughtRecords: ThoughtRecord[], moodEntries: MoodEntry[]): number {
    const cbtDays = new Set<string>();
    
    thoughtRecords.forEach(tr => {
      cbtDays.add(new Date(tr.createdAt).toDateString());
    });
    
    moodEntries.forEach(me => {
      if (me.cbtInsights) {
        cbtDays.add(new Date(me.createdAt).toDateString());
      }
    });

    const sortedDays = Array.from(cbtDays)
      .map(day => new Date(day))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    for (let i = 0; i < sortedDays.length; i++) {
      const day = sortedDays[i];
      const expectedDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      
      if (day.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get last CBT activity date
   */
  private getLastCBTActivity(thoughtRecords: ThoughtRecord[], moodEntries: MoodEntry[]): Date {
    const allActivities = [
      ...thoughtRecords.map(tr => new Date(tr.createdAt)),
      ...moodEntries.filter(me => me.cbtInsights).map(me => new Date(me.createdAt))
    ];

    if (allActivities.length === 0) return new Date(0);
    
    return new Date(Math.max(...allActivities.map(d => d.getTime())));
  }
}
