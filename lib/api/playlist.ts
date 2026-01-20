const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || 'https://hope-backend-2.onrender.com';

export const playlistAPI = {
  getUserPlaylists: async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        return { success: false, error: 'No authentication token' };
      }

      const response = await fetch(`${API_BASE}/playlists`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return { success: false, error: 'Failed to fetch playlists' };
    }
  },

  createPlaylist: async (data: any) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        return { success: false, error: 'No authentication token' };
      }

      const response = await fetch(`${API_BASE}/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error creating playlist:', error);
      return { success: false, error: 'Failed to create playlist' };
    }
  },

  getPlaylist: async (id: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        return { success: false, error: 'No authentication token' };
      }

      const response = await fetch(`${API_BASE}/playlists/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching playlist:', error);
      return { success: false, error: 'Failed to fetch playlist' };
    }
  }
};
