'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Send, Reply, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Comment {
  _id: string;
  userId: {
    _id: string;
    username: string;
  };
  content: string;
  isAnonymous: boolean;
  images?: string[];
  createdAt: string;
  reactions?: {
    heart: string[];
    support: string[];
  };
  replies?: Comment[];
}

interface PostCommentsProps {
  postId: string;
  userTier: 'free' | 'premium';
  isAuthenticated: boolean;
  onCommentAdded?: () => void;
}

export function PostComments({ postId, userTier, isAuthenticated, onCommentAdded }: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      console.log('Loading comments for post:', postId);
      const response = await fetch(`/api/community/posts/${postId}/comments`);
      console.log('Comments response status:', response.status);
      const data = await response.json();
      console.log('Comments data:', data);
      
      if (data.success) {
        setComments(data.comments || []);
      } else {
        console.error('Failed to load comments:', data.error);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024; // 5MB limit
    });

    if (validFiles.length !== files.length) {
      toast.error('Some files were skipped. Only JPEG, PNG, GIF, and WebP images under 5MB are allowed.');
    }

    setSelectedImages(prev => [...prev, ...validFiles].slice(0, 3)); // Max 3 images
    
    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 3));
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    const uploadPromises = selectedImages.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('postId', postId);

      const response = await fetch('/api/community/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        return data.imageUrl;
      } else {
        throw new Error(data.error);
      }
    });

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
      return [];
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please log in to comment');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload images first
      const imageUrls = await uploadImages();

      console.log('Submitting comment:', { postId, content: comment, isAnonymous, images: imageUrls });
      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          postId,
          content: comment,
          isAnonymous,
          images: imageUrls
        })
      });

      console.log('Comment submission response status:', response.status);
      const data = await response.json();
      console.log('Comment submission data:', data);

      if (data.success) {
        toast.success('Comment posted!');
        setComment('');
        setIsAnonymous(false);
        setSelectedImages([]);
        setImagePreviews([]);
        setShowInput(false);
        loadComments(); // Reload comments
        if (onCommentAdded) onCommentAdded();
      } else {
        console.error('Comment submission failed:', data.error);
        toast.error(data.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload images first
      const imageUrls = await uploadImages();

      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          postId,
          content: replyContent,
          isAnonymous,
          parentCommentId,
          images: imageUrls
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Reply posted!');
        setReplyContent('');
        setIsAnonymous(false);
        setSelectedImages([]);
        setImagePreviews([]);
        setReplyingTo(null);
        loadComments(); // Reload comments
        if (onCommentAdded) onCommentAdded();
      } else {
        toast.error(data.error || 'Failed to post reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/community/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Comment deleted');
        loadComments(); // Reload comments
        if (onCommentAdded) onCommentAdded();
      } else {
        toast.error(data.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const currentUserId = localStorage.getItem('userId');
    const isOwner = comment.userId?._id === currentUserId;

    return (
      <div key={comment._id} className={`bg-muted/50 p-3 rounded-lg ${isReply ? 'ml-6 border-l-2 border-primary/20' : ''}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium">
                {comment.isAnonymous ? '?' : comment.userId?.username?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <span className="text-sm font-medium">
              {comment.isAnonymous
                ? 'Anonymous'
                : (comment.userId?.username && comment.userId.username.trim() !== '' ? comment.userId.username : 'User')}
            </span>
            {comment.isAnonymous && (
              <span className="text-xs text-muted-foreground">👤</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(comment.createdAt)}
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteComment(comment._id)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          {comment.content}
        </p>

        {/* Images */}
        {comment.images && comment.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            {comment.images.map((imageUrl, index) => (
              <div key={index} className="relative">
                <Image
                  src={imageUrl}
                  alt={`Comment image ${index + 1}`}
                  width={200}
                  height={200}
                  className="rounded-lg object-cover w-full h-32"
                />
              </div>
            ))}
          </div>
        )}

        {/* Reply button for top-level comments */}
        {!isReply && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyingTo(comment._id)}
            className="h-6 text-xs"
          >
            <Reply className="w-3 h-3 mr-1" />
            Reply
          </Button>
        )}

        {/* Reply form */}
        {replyingTo === comment._id && (
          <div className="mt-3 space-y-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[60px] text-sm"
              maxLength={300}
            />
            
            {/* Image upload for replies */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id={`reply-images-${comment._id}`}
                />
                <label
                  htmlFor={`reply-images-${comment._id}`}
                  className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-primary"
                >
                  <ImageIcon className="w-3 h-3" />
                  Add images ({selectedImages.length}/3)
                </label>
              </div>
              
              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        width={80}
                        height={80}
                        className="rounded object-cover w-full h-20"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Checkbox
                  id={`reply-anonymous-${comment._id}`}
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                />
                <label htmlFor={`reply-anonymous-${comment._id}`} className="text-xs text-muted-foreground">
                  Post anonymously
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSubmitReply(comment._id)}
                disabled={isSubmitting || !replyContent.trim()}
                className="flex-1"
              >
                <Send className="w-3 h-3 mr-1" />
                {isSubmitting ? 'Posting...' : 'Reply'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                  setSelectedImages([]);
                  setImagePreviews([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-2">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-16 bg-muted animate-pulse rounded"></div>
        <div className="h-16 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Comment Input */}
      {!showInput ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            if (!isAuthenticated) {
              toast.error('Please log in to comment');
              return;
            }
            setShowInput(true);
          }}
        >
          Add a comment...
        </Button>
      ) : (
        <div className="space-y-2">
          <Textarea
            placeholder="Share your thoughts..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px]"
            maxLength={300}
          />
          
          {/* Image upload */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="comment-images"
              />
              <label
                htmlFor="comment-images"
                className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-primary"
              >
                <ImageIcon className="w-4 h-4" />
                Add images ({selectedImages.length}/3)
              </label>
            </div>
            
            {/* Image previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      width={100}
                      height={100}
                      className="rounded object-cover w-full h-24"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Checkbox
                id="comment-anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              />
              <label htmlFor="comment-anonymous" className="text-sm text-muted-foreground">
                Post anonymously
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={isSubmitting || !comment.trim()}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowInput(false);
                setComment('');
                setIsAnonymous(false);
                setSelectedImages([]);
                setImagePreviews([]);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
}

