import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Brain, LogIn, Play, Shield, Video, UserCheck } from "lucide-react";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const { toast } = useToast();

  const createDemoRoomMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/demo-room", {});
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = `/consultation/${data.roomId}`;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create demo room",
        variant: "destructive",
      });
    },
  });

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      window.location.href = `/consultation/${roomId}`;
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="home-page">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">MindConnect</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" data-testid="link-dashboard">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="text-hero-title">
            Secure Mental Health Consultations
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-hero-description">
            HIPAA-compliant video consultations with licensed psychologists. 
            Secure, private, and professional healthcare from the comfort of your home.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Join Existing Session */}
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LogIn className="w-4 h-4 text-primary" />
                <span>Join Session</span>
              </CardTitle>
              <CardDescription>
                Enter your consultation room ID to join an existing session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="roomId">Room ID</Label>
                <Input
                  id="roomId"
                  placeholder="Enter room ID (e.g., HC-2024-001)"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  data-testid="input-room-id"
                />
              </div>
              <Button 
                onClick={handleJoinRoom}
                disabled={!roomId.trim()}
                className="w-full"
                data-testid="button-join-room"
              >
                Join Consultation
              </Button>
            </CardContent>
          </Card>

          {/* Start Demo Session */}
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="w-4 h-4 text-secondary" />
                <span>Demo Session</span>
              </CardTitle>
              <CardDescription>
                Start a demo consultation to test the platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Demo includes:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Video conferencing</li>
                  <li>Real-time chat</li>
                  <li>Session management</li>
                  <li>Security features</li>
                </ul>
              </div>
              <Button 
                onClick={() => createDemoRoomMutation.mutate()}
                disabled={createDemoRoomMutation.isPending}
                className="w-full bg-secondary hover:bg-secondary/90"
                data-testid="button-start-demo"
              >
                {createDemoRoomMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Start Demo Session"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Professional Healthcare Platform
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">HIPAA Compliant</h3>
              <p className="text-muted-foreground">
                End-to-end encryption and secure data handling for patient privacy
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">HD Video Quality</h3>
              <p className="text-muted-foreground">
                Crystal clear video consultations with professional audio quality
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Licensed Professionals</h3>
              <p className="text-muted-foreground">
                Connect with qualified mental health professionals in Queensland
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
