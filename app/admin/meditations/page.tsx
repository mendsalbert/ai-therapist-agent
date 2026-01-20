"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/contexts/session-context";
import { backendService } from "@/lib/api/backend-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  Music, 
  Trash2, 
  Edit, 
  Play, 
  Pause, 
  Clock, 
  Tag,
  Crown,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAudioPlayer } from "@/lib/contexts/audio-player-context";

interface Meditation {
  _id: string;
  title: string;
  description: string;
  duration: number;
  audioUrl: string;
  category: string;
  isPremium: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminMeditationsPage() {
  const { user, isAuthenticated } = useSession();
  const router = useRouter();
  
  // Check admin access
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (user?.email !== 'knsalee@gmail.com') {
      router.push('/');
      toast.error('Access denied. Admin only.');
      return;
    }
  }, [isAuthenticated, user, router]);

  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingMeditation, setEditingMeditation] = useState<Meditation | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 0,
    category: "",
    isPremium: false,
    tags: "",
    audioFile: null as File | null,
    audioUrl: ""
  });

  const categories = [
    "mindfulness",
    "sleep",
    "anxiety",
    "stress-relief",
    "focus",
    "breathing",
    "body-scan",
    "loving-kindness",
    "walking",
    "nature"
  ];

  const loadMeditations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await backendService.getMeditations({
        search: searchTerm || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        limit: 50
      });

      if (response.success && response.data) {
        setMeditations(response.data.meditations || response.data);
      } else {
        toast.error("Failed to load meditations");
      }
    } catch (error) {
      console.error("Failed to load meditations:", error);
      toast.error("Failed to load meditations");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (user?.email === 'knsalee@gmail.com') {
      loadMeditations();
    }
  }, [user, loadMeditations]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setFormData(prev => ({ ...prev, audioFile: file }));
        
        // Auto-detect duration if possible
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        audio.addEventListener('loadedmetadata', () => {
          const durationMinutes = Math.ceil(audio.duration / 60);
          setFormData(prev => ({ ...prev, duration: durationMinutes }));
          URL.revokeObjectURL(audio.src);
        });
      } else {
        toast.error("Please select an audio file");
        e.target.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.audioFile && !editingMeditation) {
      toast.error("Please select an audio file");
      return;
    }

    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploadLoading(true);

    try {
      let response;
      
      if (editingMeditation) {
        // For editing existing meditation
        let audioUrl = formData.audioUrl;

        // Upload new file if selected
        if (formData.audioFile) {
          toast.info("Uploading new audio file...");
          const uploadResponse = await backendService.uploadMeditationFile(formData.audioFile);
          
          if (!uploadResponse.success) {
            throw new Error(uploadResponse.error || "Failed to upload audio file");
          }
          
          audioUrl = uploadResponse.data.url;
          toast.success("Audio file uploaded successfully!");
        }

        // Update meditation metadata
        const meditationData = {
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          audioUrl,
          category: formData.category,
          isPremium: formData.isPremium,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        response = await backendService.updateMeditation(editingMeditation._id, meditationData);
        toast.success("Meditation updated successfully!");
      } else {
        // For creating new meditation - upload file and metadata together
        toast.info("Uploading meditation with metadata...");
        
        const metadata = {
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          category: formData.category,
          isPremium: formData.isPremium,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        response = await backendService.uploadMeditationWithMetadata(formData.audioFile!, metadata);
        toast.success("Meditation uploaded successfully!");
      }

      if (response.success) {
        // Reset form
        setFormData({
          title: "",
          description: "",
          duration: 0,
          category: "",
          isPremium: false,
          tags: "",
          audioFile: null,
          audioUrl: ""
        });
        setShowUploadForm(false);
        setEditingMeditation(null);
        
        // Reload meditations
        await loadMeditations();
      } else {
        throw new Error(response.error || "Failed to save meditation");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload meditation");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEdit = (meditation: Meditation) => {
    setEditingMeditation(meditation);
    setFormData({
      title: meditation.title,
      description: meditation.description,
      duration: meditation.duration,
      category: meditation.category,
      isPremium: meditation.isPremium,
      tags: meditation.tags.join(', '),
      audioFile: null,
      audioUrl: meditation.audioUrl
    });
    setShowUploadForm(true);
  };

  const handleDelete = async (meditationId: string) => {
    if (!confirm("Are you sure you want to delete this meditation?")) {
      return;
    }

    try {
      const response = await backendService.deleteMeditation(meditationId);
      
      if (response.success) {
        toast.success("Meditation deleted successfully");
        await loadMeditations();
      } else {
        toast.error("Failed to delete meditation");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete meditation");
    }
  };

  const filteredMeditations = meditations.filter(meditation => {
    const matchesSearch = meditation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meditation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meditation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || meditation.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Use global audio player instead
  const { play, pause, currentTrack: globalCurrentTrack, isPlaying: globalIsPlaying } = useAudioPlayer();

  const handlePlay = async (meditationId: string) => {
    const meditation = meditations.find(m => m._id === meditationId);
    
    if (!meditation) {
      toast.error('Meditation not found');
      return;
    }

    // Check if meditation is premium-only
    if (meditation.isPremium) {
      toast.error("This meditation is a premium feature. Upgrade to access advanced meditations.");
      return;
    }

    // Check if audio URL is valid
    if (!meditation.audioUrl) {
      toast.error('Audio file not available');
      return;
    }

    // Use global player
    if (globalCurrentTrack?._id === meditationId && globalIsPlaying) {
      pause();
    } else {
      play({
        _id: meditation._id,
        title: meditation.title,
        audioUrl: meditation.audioUrl,
        category: meditation.category
      });
    }
  };

  // Redirect non-admin users
  if (!isAuthenticated || user?.email !== 'knsalee@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">This page is restricted to administrators only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Music className="w-8 h-8 text-primary" />
              Meditation Admin
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage meditation library - Upload to Vercel Blob, store metadata in MongoDB
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-sm">
              <Crown className="w-3 h-3 mr-1" />
              Admin Panel
            </Badge>
            <Button
              onClick={() => {
                setShowUploadForm(!showUploadForm);
                setEditingMeditation(null);
                setFormData({
                  title: "",
                  description: "",
                  duration: 0,
                  category: "",
                  isPremium: false,
                  tags: "",
                  audioFile: null,
                  audioUrl: ""
                });
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Meditation
            </Button>
          </div>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  {editingMeditation ? "Edit Meditation" : "Upload New Meditation"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Meditation title"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the meditation..."
                          rows={3}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="duration">Duration (minutes)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={formData.duration}
                            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                            placeholder="10"
                            min="1"
                            max="120"
                          />
                        </div>

                        <div>
                          <Label htmlFor="category">Category *</Label>
                          <Select 
                            value={formData.category} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="audioFile">Audio File {!editingMeditation && "*"}</Label>
                        <Input
                          id="audioFile"
                          type="file"
                          accept="audio/*"
                          onChange={handleFileChange}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                        />
                        {editingMeditation && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Leave empty to keep current audio file
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          value={formData.tags}
                          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="relaxation, sleep, anxiety"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isPremium"
                          checked={formData.isPremium}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPremium: checked }))}
                        />
                        <Label htmlFor="isPremium" className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-primary" />
                          Premium Content
                        </Label>
                      </div>

                      <div className="flex gap-3">
                        <Button type="submit" disabled={uploadLoading} className="flex-1">
                          {uploadLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {editingMeditation ? "Updating..." : "Uploading..."}
                            </>
                          ) : (
                            <>
                              {editingMeditation ? <Edit className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                              {editingMeditation ? "Update" : "Upload"}
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowUploadForm(false);
                            setEditingMeditation(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search meditations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={loadMeditations} variant="outline">
            Refresh
          </Button>
        </div>

        {/* Meditations List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredMeditations.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No meditations found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== "all" 
                ? "Try adjusting your search or filters" 
                : "Upload your first meditation to get started"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeditations.map((meditation) => (
              <motion.div
                key={meditation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{meditation.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{meditation.duration} min</span>
                          {meditation.isPremium && (
                            <Badge variant="default" className="text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {meditation.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {meditation.category.replace('-', ' ')}
                      </Badge>
                    </div>

                    {meditation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {meditation.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {meditation.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{meditation.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(meditation)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(meditation._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Created: {new Date(meditation.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 