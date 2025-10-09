import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Issue, Update, User } from '@/types';
import { AlertCircle, Megaphone, Users, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    totalUpdates: 0,
    totalUsers: 0,
    myIssues: 0,
    myUpdates: 0,
  });

  useEffect(() => {
    const issues: Issue[] = JSON.parse(localStorage.getItem('civic_connect_issues') || '[]');
    const updates: Update[] = JSON.parse(localStorage.getItem('civic_connect_updates') || '[]');
    const users: User[] = JSON.parse(localStorage.getItem('civic_connect_users') || '[]');

    const openIssues = issues.filter(issue => issue.status === 'open').length;
    const resolvedIssues = issues.filter(issue => issue.status === 'resolved').length;
    const myIssues = issues.filter(issue => issue.citizenId === user?.id).length;
    const myUpdates = updates.filter(update => update.politicianId === user?.id).length;

    setStats({
      totalIssues: issues.length,
      openIssues,
      resolvedIssues,
      totalUpdates: updates.length,
      totalUsers: users.length,
      myIssues,
      myUpdates,
    });
  }, [user?.id]);

  const renderAdminDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalIssues}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.openIssues}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Updates</CardTitle>
          <Megaphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUpdates}</div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCitizenDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">My Issues</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.myIssues}</div>
          <p className="text-xs text-muted-foreground">Issues you've reported</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.openIssues}</div>
          <p className="text-xs text-muted-foreground">Community issues pending</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Updates</CardTitle>
          <Megaphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUpdates}</div>
          <p className="text-xs text-muted-foreground">From representatives</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderPoliticianDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">My Updates</CardTitle>
          <Megaphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.myUpdates}</div>
          <p className="text-xs text-muted-foreground">Updates you've posted</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalIssues}</div>
          <p className="text-xs text-muted-foreground">Reported by citizens</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.openIssues}</div>
          <p className="text-xs text-muted-foreground">Need attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.resolvedIssues}</div>
          <p className="text-xs text-muted-foreground">Successfully resolved</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderModeratorDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalIssues}</div>
          <p className="text-xs text-muted-foreground">To moderate</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Updates</CardTitle>
          <Megaphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUpdates}</div>
          <p className="text-xs text-muted-foreground">To review</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">Platform users</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Namaste, {user?.name}</p>
      </div>

      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'citizen' && renderCitizenDashboard()}
      {user?.role === 'politician' && renderPoliticianDashboard()}
      {user?.role === 'moderator' && renderModeratorDashboard()}

      <Card className="mt-6">
  <CardHeader>
    <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
    <CardDescription className="text-gray-600">
      {user?.role === 'citizen' && 'Engage with your community by reporting issues or checking updates.'}
      {user?.role === 'politician' && 'Post updates, announcements, and respond to citizen concerns.'}
      {user?.role === 'admin' && 'Manage users, monitor issues, and oversee platform activities.'}
      {user?.role === 'moderator' && 'Review and moderate content to maintain platform quality.'}
    </CardDescription>
  </CardHeader>

  <CardContent>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      
      {/* Citizen Quick Actions */}
      {user?.role === 'citizen' && (
        <>
          <button className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 shadow-md rounded-xl transition transform hover:-translate-y-1 hover:scale-105">
            <span className="text-2xl font-bold text-blue-600">+</span>
            <span className="text-sm font-medium text-blue-700">Post Issue</span>
          </button>

          <button className="flex flex-col items-center justify-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 shadow-md rounded-xl transition transform hover:-translate-y-1 hover:scale-105">
            <Users className="text-purple-600 h-6 w-6" />
            <span className="text-sm font-medium text-purple-700">View Issues</span>
          </button>

          <button className="flex flex-col items-center justify-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 shadow-md rounded-xl transition transform hover:-translate-y-1 hover:scale-105">
            <CheckCircle className="text-orange-600 h-6 w-6" />
            <span className="text-sm font-medium text-orange-700">View Updates</span>
          </button>
        </>
      )}

      {/* Politician Quick Actions */}
      {user?.role === 'politician' && (
        <>
          <button className="flex flex-col items-center justify-center gap-2 p-4 bg-green-50 hover:bg-green-100 shadow-md rounded-xl transition transform hover:-translate-y-1 hover:scale-105">
            <Megaphone className="text-green-600 h-6 w-6" />
            <span className="text-sm font-medium text-green-700 text-center">Post Update</span>
          </button>

          <button className="flex flex-col items-center justify-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 shadow-md rounded-xl transition transform hover:-translate-y-1 hover:scale-105">
            <Users className="text-purple-600 h-6 w-6" />
            <span className="text-sm font-medium text-purple-700 text-center">View Issues</span>
          </button>
        </>
      )}

      {/* Admin / Moderator Quick Actions */}
      {(user?.role === 'admin' || user?.role === 'moderator') && (
        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 shadow-md rounded-xl transition transform hover:-translate-y-1 hover:scale-105">
          <AlertCircle className="text-purple-600 h-6 w-6" />
          <span className="text-sm font-medium text-purple-700 text-center">Monitor & Moderate Content</span>
        </button>
      )}

    </div>
  </CardContent>
</Card>

<footer className="fixed bottom-0 left-0 w-full bg-white/70 backdrop-blur-md shadow-md border-t border-gray-200">
  <div className="max-w-7xl mx-auto px-6 py-3 text-center text-sm text-gray-700">
    <p className="font-medium">
      Developed by <span className="text-blue-600">Vishwas</span> & <span className="text-green-600">Vignesh</span> 
      &nbsp;- All Rights Reserved © {new Date().getFullYear()}
    </p>
  </div>
</footer>
    </div>
  );
}
