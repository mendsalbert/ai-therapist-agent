'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, MessageSquare, Leaf, Users, Plus, Sparkles, Lock } from 'lucide-react';
import { CommunityChallenges } from '@/components/community/community-challenges';
import { CommunityPrompts } from '@/components/community/community-prompts';
import { PremiumUpgradeModal } from '@/components/community/premium-upgrade-modal';
import { useSession } from '@/lib/contexts/session-context';

interface CommunitySpace {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface CommunityPost {
  _id: string;
  userId: {
    _id: string;
    username: string;
  };
  spaceId: string;
  content: string;
  mood?: string;
  isAnonymous: boolean;
  reactions: {
    heart: string[];
    support: string[];
    growth: string[];
  };
  comments: any[];
  aiReflection?: string;
  createdAt: string;
}

interface CommunityStats {
  totalPosts: number;
  totalComments: number;
  activeUsers: number;
  totalSpaces: number;
}

export default function CommunityPage() {
  const { isAuthenticated, userTier } = useSession();
  const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    mood: '',
    isAnonymous: false
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadCommunityData();
  }, []);

  useEffect(() => {
    if (selectedSpace) {
      loadSpacePosts(selectedSpace);
    }
  }, [selectedSpace]);

  const loadCommunityData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const [spacesRes, statsRes] = await Promise.all([
        fetch('/api/community/spaces', { headers }),
        fetch('/api/community/stats', { headers })
      ]);

      const spacesData = await spacesRes.json();
      const statsData = await statsRes.json();

      if (spacesData.success) {
        setSpaces(spacesData.spaces || []);
        if (spacesData.spaces && spacesData.spaces.length > 0) {
          setSelectedSpace(spacesData.spaces[0]._id);
        }
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error loading community data:', error);
      // Optionally show user feedback here if a toast implementation is available, otherwise safely ignore
      // e.g., if (typeof toast !== "undefined") toast.error('Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const loadSpacePosts = async (spaceId: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/community/spaces/${spaceId}/posts`, { headers });
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      // Optionally show user feedback here if a toast implementation is available, otherwise safely ignore
      // e.g., if (typeof toast !== "undefined") toast.error('Failed to load posts');
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      // Optionally show user feedback here if a toast implementation is available, otherwise safely ignore
      // e.g., if (typeof toast !== "undefined") toast.error('Please enter some content');
      return;
    }

    if (userTier === 'free') {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          spaceId: selectedSpace,
          ...newPost
        })
      });

      const data = await response.json();

      if (data.success) {
        // Optionally show user feedback here if a toast implementation is available, otherwise safely ignore
        // e.g., if (typeof toast !== "undefined") toast.success('Post created successfully!');
        setNewPost({ content: '', mood: '', isAnonymous: false });
        setShowCreatePost(false);
        loadSpacePosts(selectedSpace);
      } else {
        // Optionally show user feedback here if a toast implementation is available, otherwise safely ignore
        // e.g., if (typeof toast !== "undefined") toast.error(data.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      // Optionally show user feedback here if a toast implementation is available, otherwise safely ignore
      // e.g., if (typeof toast !== "undefined") toast.error('Failed to create post');
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reactionType })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { ...post, reactions: data.reactions }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  const getReactionCount = (reactions: any, type: string) => {
    return reactions[type]?.length || 0;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Community Support
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Connect, share, and grow together in a safe, supportive space
          </p>
          
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-primary">{stats.totalPosts}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-primary">{stats.totalComments}</div>
                  <div className="text-sm text-muted-foreground">Comments</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-primary">{stats.activeUsers}</div>
                  <div className="text-sm text-muted-foreground">Members</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-primary">{stats.totalSpaces}</div>
                  <div className="text-sm text-muted-foreground">Spaces</div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Spaces Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Community Spaces
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {spaces.map((space) => (
                  <Button
                    key={space._id}
                    variant={selectedSpace === space._id ? "default" : "ghost"}
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => setSelectedSpace(space._id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{space.icon}</span>
                      <div>
                        <div className="font-medium">{space.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {space.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Create Post */}
            {isAuthenticated && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  {!showCreatePost ? (
                    <Button 
                      onClick={() => setShowCreatePost(true)}
                      className="w-full"
                      disabled={userTier === 'free'}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {userTier === 'free' ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Premium Required to Post
                        </>
                      ) : (
                        'Share Your Thoughts'
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Share your thoughts, experiences, or reflections..."
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        className="min-h-[100px]"
                        maxLength={500}
                      />
                      
                      <div className="flex gap-4">
                        <Select value={newPost.mood} onValueChange={(value) => setNewPost({ ...newPost, mood: value })}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select mood (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grateful">🙏 Grateful</SelectItem>
                            <SelectItem value="hopeful">✨ Hopeful</SelectItem>
                            <SelectItem value="calm">🕊️ Calm</SelectItem>
                            <SelectItem value="proud">🌟 Proud</SelectItem>
                            <SelectItem value="peaceful">🌙 Peaceful</SelectItem>
                            <SelectItem value="motivated">🚀 Motivated</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="outline"
                          onClick={() => setNewPost({ ...newPost, isAnonymous: !newPost.isAnonymous })}
                        >
                          {newPost.isAnonymous ? 'Anonymous' : 'Public'}
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={handleCreatePost}>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Share Post
                        </Button>
                        <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-muted-foreground">
                      No posts yet in this space. Be the first to share!
                    </div>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {post.isAnonymous ? '?' : post.userId.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">
                                {post.isAnonymous ? 'Anonymous' : post.userId.username}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatTimeAgo(post.createdAt)}
                              </div>
                            </div>
                          </div>
                          {post.mood && (
                            <Badge variant="secondary">
                              {post.mood === 'grateful' && '🙏 Grateful'}
                              {post.mood === 'hopeful' && '✨ Hopeful'}
                              {post.mood === 'calm' && '🕊️ Calm'}
                              {post.mood === 'proud' && '🌟 Proud'}
                              {post.mood === 'peaceful' && '🌙 Peaceful'}
                              {post.mood === 'motivated' && '🚀 Motivated'}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {post.content}
                        </p>
                        
                        {post.aiReflection && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-r">
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-blue-600 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-blue-800">AI Reflection</div>
                                <div className="text-sm text-blue-700">{post.aiReflection}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReaction(post._id, 'heart')}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            {getReactionCount(post.reactions, 'heart')}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReaction(post._id, 'support')}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {getReactionCount(post.reactions, 'support')}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReaction(post._id, 'growth')}
                            className="text-green-500 hover:text-green-600"
                          >
                            <Leaf className="w-4 h-4 mr-1" />
                            {getReactionCount(post.reactions, 'growth')}
                          </Button>
                          
                          <div className="text-sm text-muted-foreground ml-auto">
                            {post.comments.length} comments
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Additional Community Features */}
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <CommunityChallenges userTier={userTier} />
          <CommunityPrompts userTier={userTier} />
        </div>
      </div>

      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Create Posts"
        description="Premium users can create posts, comment on others' posts, and participate in community challenges."
      />
    </div>
  );
}

