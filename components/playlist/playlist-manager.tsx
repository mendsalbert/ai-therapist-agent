"use client";

import { useState, useEffect } from 'react';
import { useAudioPlayer } from '@/lib/contexts/audio-player-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Play, 
  Trash2, 
  Edit, 
  Copy, 
  Heart,
  Users,
  Music,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface Playlist {
  _id: string;
  name: string;
  description?: string;
  meditations: any[];
  isPublic: boolean;
  plays: number;
  likes: number;
  createdAt: string;
  userId: string;
}

export function PlaylistManager() {
  const { 
    playlist, 
    savedPlaylists, 
    loadSavedPlaylists, 
    savePlaylistToMongoDB, 
    loadPlaylistFromMongoDB,
    playPlaylist 
  } = useAudioPlayer();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [newPlaylistPublic, setNewPlaylistPublic] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      await loadSavedPlaylists();
      setPlaylists(savedPlaylists);
    } catch (error) {
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error('Playlist name is required');
      return;
    }

    if (playlist.length === 0) {
      toast.error('Add some meditations to your queue first');
      return;
    }

    try {
      const newPlaylist = await savePlaylistToMongoDB(
        newPlaylistName,
        newPlaylistDescription,
        newPlaylistPublic
      );

      if (newPlaylist) {
        setNewPlaylistName('');
        setNewPlaylistDescription('');
        setNewPlaylistPublic(false);
        setShowCreateDialog(false);
        await loadPlaylists();
        toast.success('Playlist created successfully!');
      }
    } catch (error) {
      toast.error('Failed to create playlist');
    }
  };

  const handlePlayPlaylist = async (playlistId: string) => {
    try {
      await loadPlaylistFromMongoDB(playlistId);
    } catch (error) {
      toast.error('Failed to load playlist');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (meditations: any[]) => {
    const totalSeconds = meditations.reduce((acc, med) => acc + (med.duration || 0), 0);
    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Playlists</h2>
          <p className="text-muted-foreground">Manage your meditation playlists</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button disabled={playlist.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Create Playlist
              {playlist.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {playlist.length}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Meditation Playlist"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="A relaxing collection of meditations..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={newPlaylistPublic}
                  onCheckedChange={setNewPlaylistPublic}
                />
                <Label htmlFor="public">Make this playlist public</Label>
              </div>
              <div className="text-sm text-muted-foreground">
                This playlist contains {playlist.length} meditations
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePlaylist}>
                  Create Playlist
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Queue */}
      {playlist.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Current Queue</h3>
            <Badge variant="outline">{playlist.length} tracks</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Ready to save as a playlist
          </div>
        </Card>
      )}

      {/* Playlists Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <Card className="p-8 text-center">
          <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No playlists yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first playlist by adding meditations to your queue
          </p>
          <Button onClick={() => setShowCreateDialog(true)} disabled={playlist.length === 0}>
            <Plus className="w-4 h-4 mr-2" />
            Create Playlist
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <Card key={playlist._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{playlist.name}</h3>
                  {playlist.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {playlist.description}
                    </p>
                  )}
                </div>
                {playlist.isPublic && (
                  <Badge variant="outline" className="ml-2">
                    <Users className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Music className="w-3 h-3" />
                  {playlist.meditations.length}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(playlist.meditations)}
                </div>
                <div className="flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  {playlist.plays}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {formatDate(playlist.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePlayPlaylist(playlist._id)}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Play
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}