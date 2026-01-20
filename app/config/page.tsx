"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Database, Wifi, Key, Globe } from "lucide-react";

export default function ConfigPage() {
  const [backendUrl, setBackendUrl] = useState(
    process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || 'http://localhost:8000'
  );

  const handleSaveConfig = () => {
    // In a real app, you'd save this to localStorage or a config file
    console.log('Saving backend URL:', backendUrl);
    // For now, we'll just update the environment variable in memory
    if (typeof window !== 'undefined') {
      localStorage.setItem('backendUrl', backendUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Settings className="w-8 h-8" />
            Configuration
          </h1>
          <p className="text-muted-foreground">
            Configure your frontend to connect with the Hope backend
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Backend Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Backend Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backend-url">Backend API URL</Label>
                <Input
                  id="backend-url"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                />
                <p className="text-xs text-muted-foreground">
                  URL where your Hope backend is running
                </p>
              </div>

              <div className="space-y-2">
                <Label>Current Environment</Label>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    <Globe className="w-3 h-3 mr-1" />
                    {process.env.NODE_ENV || 'development'}
                  </Badge>
                  <Badge variant="outline">
                    <Key className="w-3 h-3 mr-1" />
                    {process.env.NEXTAUTH_URL ? 'Auth Configured' : 'No Auth'}
                  </Badge>
                </div>
              </div>

              <Button onClick={handleSaveConfig} className="w-full">
                Save Configuration
              </Button>
            </CardContent>
          </Card>

          {/* Connection Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Backend Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <Badge variant="secondary">Backend connection testing removed</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Backend connectivity is handled automatically
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Environment Variables Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Create .env.local file in your project root:</h4>
              <pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
{`# Backend API Configuration
BACKEND_API_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000

# NextAuth Configuration  
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here

# Production URLs (update when deployed)
# BACKEND_API_URL=https://your-backend-render-url.onrender.com
# NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-render-url.onrender.com
# Example for the new frontend domain:
# NEXT_PUBLIC_SITE_URL=https://hopementalhealthsupport.xyz
# BACKEND_API_URL=https://hope-backend-2.onrender.com`}
              </pre>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold">Next Steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Clone your backend repository: <code className="bg-muted px-1 rounded">git clone git@github.com:Kelvinsaleh/Hope-backend.git</code></li>
                <li>Set up your backend environment variables and database</li>
                <li>Start your backend server (usually on port 8000)</li>
                <li>Update the backend URL above to match your backend</li>
                <li>Test the connection using the test button</li>
                <li>Deploy backend to Render and frontend to Vercel</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints Info */}
        <Card>
          <CardHeader>
            <CardTitle>Expected Backend API Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">Authentication</h4>
                <div className="space-y-1 text-sm">
                  <div><code className="bg-muted px-1 rounded">POST /auth/login</code></div>
                  <div><code className="bg-muted px-1 rounded">POST /auth/register</code></div>
                  <div><code className="bg-muted px-1 rounded">POST /auth/logout</code></div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Chat & Memory</h4>
                <div className="space-y-1 text-sm">
                  <div><code className="bg-muted px-1 rounded">POST /chat/sessions</code></div>
                  <div><code className="bg-muted px-1 rounded">GET /chat/sessions</code></div>
                  <div><code className="bg-muted px-1 rounded">POST /chat/memory-enhanced</code></div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Journal</h4>
                <div className="space-y-1 text-sm">
                  <div><code className="bg-muted px-1 rounded">GET /journal/entries</code></div>
                  <div><code className="bg-muted px-1 rounded">POST /journal/entries</code></div>
                  <div><code className="bg-muted px-1 rounded">PUT /journal/entries/:id</code></div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Meditation</h4>
                <div className="space-y-1 text-sm">
                  <div><code className="bg-muted px-1 rounded">GET /meditation/sessions</code></div>
                  <div><code className="bg-muted px-1 rounded">POST /meditation/sessions</code></div>
                  <div><code className="bg-muted px-1 rounded">PUT /meditation/sessions/:id</code></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
