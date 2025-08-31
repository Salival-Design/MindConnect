import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  // For demo purposes, using static user ID
  const userId = "demo-user";

  const { data: sessions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/users", userId, "sessions"],
    enabled: !!userId,
  });

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-page">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-brain text-white text-sm" />
            </div>
            <span className="font-bold text-xl text-foreground">MindConnect</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" data-testid="link-home">
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-dashboard-title">
            Your Dashboard
          </h1>
          <p className="text-muted-foreground" data-testid="text-dashboard-description">
            Manage your consultation sessions and view your mental health journey
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <i className="fas fa-calendar-plus text-primary" />
                <span>Schedule Session</span>
              </CardTitle>
              <CardDescription>
                Book a new consultation with a licensed therapist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" data-testid="button-schedule-session">
                Schedule Consultation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <i className="fas fa-phone text-secondary" />
                <span>Emergency Support</span>
              </CardTitle>
              <CardDescription>
                24/7 crisis support and emergency mental health services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white" data-testid="button-emergency-support">
                <i className="fas fa-phone-alt mr-2" />
                Crisis Helpline
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <i className="fas fa-file-medical text-accent" />
                <span>Health Records</span>
              </CardTitle>
              <CardDescription>
                View your consultation history and progress notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-health-records">
                View Records
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>
              Your latest consultation sessions and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="ml-2 text-muted-foreground">Loading sessions...</span>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8" data-testid="empty-sessions">
                <i className="fas fa-calendar-times text-muted-foreground text-4xl mb-4" />
                <p className="text-muted-foreground">No consultation sessions yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Schedule your first session to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4" data-testid="sessions-list">
                {sessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                    data-testid={`session-${session.id}`}
                  >
                    <div>
                      <h4 className="font-medium text-foreground">
                        Session with Dr. {session.therapistName || "Therapist"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {session.startTime ? new Date(session.startTime).toLocaleDateString() : "Scheduled"}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={
                          session.status === "completed" ? "default" :
                          session.status === "active" ? "secondary" :
                          session.status === "cancelled" ? "destructive" :
                          "outline"
                        }
                        data-testid={`session-status-${session.id}`}
                      >
                        {session.status}
                      </Badge>
                      
                      {session.status === "scheduled" && (
                        <Link href={`/consultation/${session.roomId}`}>
                          <Button size="sm" data-testid={`button-join-${session.id}`}>
                            Join
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
