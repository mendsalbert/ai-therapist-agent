'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Trophy, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { PremiumUpgradeModal } from './premium-upgrade-modal';

interface CommunityChallenge {
  _id: string;
  title: string;
  description: string;
  spaceId?: {
    _id: string;
    name: string;
  };
  duration: number;
  participants?: string[];
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface CommunityChallengesProps {
  userTier: 'free' | 'premium';
}

export function CommunityChallenges({ userTier }: CommunityChallengesProps) {
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState({ feature: '', description: '' });

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/community/challenges', {
        headers
      });
      
      if (!response.ok) {
        console.error('Failed to load challenges:', response.status);
        setChallenges([]);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {

    try {
      const response = await fetch(`/api/community/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Successfully joined challenge!');
        loadChallenges(); // Refresh to show updated participant count
      } else {
        toast.error(data.error || 'Failed to join challenge');
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error('Failed to join challenge');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getProgressPercentage = (challenge: CommunityChallenge) => {
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);
    const now = new Date();
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Community Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {challenges.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active challenges at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back soon for new wellness challenges!
              </p>
            </div>
          ) : (
            challenges.map((challenge) => {
              const daysRemaining = getDaysRemaining(challenge.endDate);
              const progress = getProgressPercentage(challenge);
              const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
              const isParticipant = challenge.participants && userId ? challenge.participants.includes(userId) : false;

              return (
                <motion.div
                  key={challenge._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {challenge.description}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {challenge.spaceId?.name || 'General'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {challenge.participants?.length || 0} participants
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {daysRemaining} days left
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex gap-2">
                    {isParticipant ? (
                      <Button variant="outline" size="sm" disabled>
                        ✓ Joined
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleJoinChallenge(challenge._id)}
                      >
                        Join Challenge
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>

      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={selectedFeature.feature}
        description={selectedFeature.description}
      />
    </>
  );
}
