'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, MessageSquare } from 'lucide-react';
import { PostComments } from '@/components/community/post-comments';
import { useSession } from '@/lib/contexts/session-context';
import Image from 'next/image';
import { SimpleLightbox } from '@/components/ui/simple-lightbox';

interface CommunityPost {
  _id: string;
  userId?: {
    _id?: string;
    username?: string;
    name?: string;
  };
  content: string;
  mood?: string;
  isAnonymous: boolean;
  images?: string[];
  reactions?: {
    heart?: string[];
    support?: string[];
    growth?: string[];
  };
  comments?: any[];
  aiReflection?: string;
  createdAt?: string;
}

function formatTimeAgo(dateString?: string) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export default function CommunityPostPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, userTier } = useSession();
  const postId = params.postId as string;

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/community/posts/${postId}`);
        const data = await res.json();
        if (data.success && data.post) {
          setPost(data.post as CommunityPost);
          return;
        }
        setError(data.error || 'Post not found');
      } catch (e) {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    if (postId) {
      load();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  if (!post || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'This post may have been removed.'}
            </p>
            <Button onClick={() => router.push('/community')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const username = post.isAnonymous
    ? 'Anonymous'
    : post.userId?.username?.trim() ||
      post.userId?.name?.trim() ||
      'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/community')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                <span className="text-lg font-medium">
                  {post.isAnonymous ? '?' : username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium">{username}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(post.createdAt)}
                </div>
              </div>
            </div>

            <p className="mb-4 leading-relaxed text-[15px] text-gray-700 dark:text-gray-300">
              {post.content}
            </p>

            {post.images && post.images.length > 0 && (
              <div className="mb-4 space-y-3">
                {post.images.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative cursor-pointer group rounded-lg overflow-hidden bg-muted/40 dark:bg-muted/20"
                    onClick={() => {
                      setLightboxImages(post.images ?? []);
                      setLightboxIndex(index);
                      setLightboxOpen(true);
                    }}
                  >
                    <Image
                      src={imageUrl}
                      alt={`Post image ${index + 1}`}
                      width={1200}
                      height={800}
                      className="w-full h-auto group-hover:brightness-[0.98] transition"
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {post.aiReflection && (
              <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-400 dark:border-blue-600 p-3 rounded-r mb-4">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  AI Reflection
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {post.aiReflection}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pt-3 border-t">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {post.comments?.length || 0} comments
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <PostComments
              postId={postId}
              userTier={userTier}
              isAuthenticated={isAuthenticated}
              onCommentAdded={() => {}}
            />
          </CardContent>
        </Card>
      </div>

      {lightboxOpen && (
        <SimpleLightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() =>
            setLightboxIndex(
              (lightboxIndex + lightboxImages.length - 1) %
                lightboxImages.length
            )
          }
          onNext={() =>
            setLightboxIndex((lightboxIndex + 1) % lightboxImages.length)
          }
        />
      )}
    </div>
  );
}
