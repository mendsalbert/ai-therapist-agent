'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, MessageSquare, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PremiumUpgradeModal } from './premium-upgrade-modal';

interface CommunityPrompt {
  _id: string;
  title: string;
  content: string;
  spaceId?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  responses?: string[];
  createdAt: string;
}

interface CommunityPromptsProps {
  userTier: 'free' | 'premium';
}

export function CommunityPrompts({ userTier }: CommunityPromptsProps) {
  const [prompts, setPrompts] = useState<CommunityPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<CommunityPrompt | null>(null);
  const [response, setResponse] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/community/prompts', {
        headers
      });
      
      if (!response.ok) {
        console.error('Failed to load prompts:', response.status);
        setPrompts([]);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setPrompts(data.prompts || []);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToPrompt = () => {

    if (!response.trim()) {
      toast.error('Please write a response');
      return;
    }

    // For now, just show success message
    // In a real implementation, this would create a post in the specific space
    toast.success('Response submitted! Thank you for sharing.');
    setResponse('');
    setSelectedPrompt(null);
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
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Daily Reflection Prompts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {prompts.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No prompts available at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back tomorrow for new reflection questions!
              </p>
            </div>
          ) : (
            prompts.map((prompt) => (
              <motion.div
                key={prompt._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{prompt.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {prompt.content}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {prompt.spaceId?.name || 'General'}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {prompt.responses?.length || 0} responses
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    {userTier === 'free' ? (
                      <>
                        <Lock className="w-4 h-4 mr-1" />
                        Premium Required
                      </>
                    ) : (
                      'Share Your Response'
                    )}
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Response Modal */}
      {selectedPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPrompt(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg mb-2">{selectedPrompt.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedPrompt.content}
            </p>
            
            <Textarea
              placeholder="Share your thoughts and reflections..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="min-h-[120px] mb-4"
              maxLength={500}
            />
            
            <div className="flex gap-2">
              <Button
                onClick={handleRespondToPrompt}
                className="flex-1"
              >
                <>
                  <Sparkles className="w-4 h-4 mr-1" />
                  Share Response
                </>
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedPrompt(null)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Premium modal removed - community is free */}
    </>
  );
}
