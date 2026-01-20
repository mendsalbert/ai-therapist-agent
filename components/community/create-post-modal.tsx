'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image as ImageIcon, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface CommunitySpace {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface CreatePostModalProps {
  spaces: CommunitySpace[];
  userTier: 'free' | 'premium';
  isAuthenticated: boolean;
  onPostCreated?: () => void;
}

export function CreatePostModal({ spaces, userTier, isAuthenticated, onPostCreated }: CreatePostModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [selectedSpace, setSelectedSpace] = useState('');
  const [mood, setMood] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moods = [
    { value: 'grateful', label: '🙏 Grateful' },
    { value: 'hopeful', label: '✨ Hopeful' },
    { value: 'calm', label: '🕊️ Calm' },
    { value: 'proud', label: '🌟 Proud' },
    { value: 'peaceful', label: '🌙 Peaceful' },
    { value: 'motivated', label: '🚀 Motivated' },
    { value: 'anxious', label: '😰 Anxious' },
    { value: 'sad', label: '😔 Sad' },
    { value: 'happy', label: '😊 Happy' },
    { value: 'excited', label: '🎉 Excited' }
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024; // 5MB limit
    });

    if (validFiles.length !== files.length) {
      toast.error('Some files were skipped. Only JPEG, PNG, GIF, and WebP images under 5MB are allowed.');
    }

    // Enforce max 6 images total
    setSelectedImages(prev => {
      const remaining = 6 - prev.length;
      const toAdd = validFiles.slice(0, Math.max(0, remaining));
      if (validFiles.length > toAdd.length) {
        toast.error('You can upload up to 6 images per post.');
      }
      return [...prev, ...toAdd];
    });
    
    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => {
      const remaining = 6 - prev.length;
      const toAdd = newPreviews.slice(0, Math.max(0, remaining));
      return [...prev, ...toAdd];
    });
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
      formData.append('postId', 'temp'); // Will be updated after post creation

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

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter some content for your post');
      return;
    }

    // Enforce 2000-character limit
    const contentLength = content.trim().length;
    if (contentLength > 2000) {
      toast.error(`Your post is ${contentLength} characters. Maximum allowed is 2000 characters. Please shorten it.`);
      return;
    }

    if (!selectedSpace) {
      toast.error('Please select a community space');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please log in to create posts');
      return;
    }

    // Post creation is free for all users
    setIsSubmitting(true);
    
    try {
      // Upload images first (max 6 enforced in selection)
      const imageUrls = await uploadImages();

      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          spaceId: selectedSpace,
          content,
          mood: mood || undefined,
          isAnonymous,
          images: imageUrls
        })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `Server error (${response.status})` };
        }
        
        console.error('Post creation error:', errorData);
        
        // Show error message from backend
        const errorMessage = errorData.error || errorData.message || `Failed to create post (${response.status})`;
        const errorDetails = errorData.details ? `: ${errorData.details}` : '';
        toast.error(`${errorMessage}${errorDetails}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Post created successfully!');
        setIsOpen(false);
        setContent('');
        setSelectedSpace('');
        setMood('');
        setIsAnonymous(false);
        setSelectedImages([]);
        setImagePreviews([]);
        if (onPostCreated) onPostCreated();
      } else {
        toast.error(data.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      toast.error(`Failed to create post: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setContent('');
    setSelectedSpace('');
    setMood('');
    setIsAnonymous(false);
    setSelectedImages([]);
    setImagePreviews([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Space Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Community Space *</label>
            <Select value={selectedSpace} onValueChange={setSelectedSpace}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a space to post in" />
              </SelectTrigger>
              <SelectContent>
                {spaces.map((space) => (
                  <SelectItem key={space._id} value={space._id}>
                    <div className="flex items-center gap-2">
                      <span>{space.icon}</span>
                      <span>{space.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">What's on your mind? *</label>
            <Textarea
              placeholder="Share your thoughts, experiences, or ask for support..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
              maxLength={2000}
            />
            <div className={`text-xs text-right ${content.trim().length > 2000 ? 'text-red-500 font-semibold' : content.trim().length > 1800 ? 'text-orange-500' : 'text-muted-foreground'}`}>
              {content.trim().length}/2000 characters
            </div>
          </div>

          {/* Mood Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Mood (Optional)</label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger>
                <SelectValue placeholder="How are you feeling?" />
              </SelectTrigger>
              <SelectContent>
                {moods.map((moodOption) => (
                  <SelectItem key={moodOption.value} value={moodOption.value}>
                    {moodOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Images (Optional)</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id="post-images"
                />
                <label
                  htmlFor="post-images"
                  className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-primary border border-dashed border-muted-foreground rounded-lg px-3 py-2 w-full justify-center"
                >
                  <ImageIcon className="w-4 h-4" />
                  Add images ({selectedImages.length}/6)
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
                        width={120}
                        height={120}
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
            <p className="text-xs text-muted-foreground">
              Supported formats: JPEG, PNG, GIF, WebP. Max 5MB per image.
            </p>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="post-anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <label htmlFor="post-anonymous" className="text-sm text-muted-foreground">
              Post anonymously
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim() || !selectedSpace}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
