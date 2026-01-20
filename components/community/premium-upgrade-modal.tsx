'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Crown, Users, MessageSquare, Heart, Sparkles, Lock } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  description: string;
}

export function PremiumUpgradeModal({ isOpen, onClose, feature, description }: PremiumUpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const premiumFeatures = [
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Create Posts",
      description: "Share your thoughts and experiences with the community"
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Comment & React",
      description: "Engage with others through supportive comments and reactions"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "AI Reflections",
      description: "Get personalized AI insights on your posts and mood"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Join Challenges",
      description: "Participate in community wellness challenges"
    }
  ];

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // Redirect to pricing page
      window.location.href = '/pricing';
    } catch (error) {
      toast.error('Failed to redirect to pricing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 mx-auto">
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <CardTitle className="text-xl">Premium Required</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="absolute right-4 top-4"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Feature Description */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{feature}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>

                {/* Premium Features */}
                <div className="space-y-3">
                  <h3 className="font-medium text-center">Unlock with Premium:</h3>
                  {premiumFeatures.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="text-primary">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">$7.99</div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">$89.99</div>
                      <div className="text-sm text-muted-foreground">per year</div>
                      <Badge variant="secondary" className="text-xs">Save $6.89</Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    onClick={handleUpgrade}
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {isLoading ? 'Redirecting...' : 'Upgrade to Premium'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="w-full"
                  >
                    Maybe Later
                  </Button>
                </div>

                {/* Benefits */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Join thousands of users who are already improving their mental wellness with Premium features
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
