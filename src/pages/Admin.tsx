import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { User, Issue, Update } from '@/types';
import { toast } from 'sonner';
import { Users, AlertCircle, Megaphone, Trash2, UserX } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    loadData();
  }, [user]);

  const loadData = () => {
    const storedUsers = JSON.parse(localStorage.getItem('civic_connect_users') || '[]');
    const storedIssues = JSON.parse(localStorage.getItem('civic_connect_issues') || '[]');
    const storedUpdates = JSON.parse(localStorage.getItem('civic_connect_updates') || '[]');
    
    setUsers(storedUsers);
    setIssues(storedIssues);
    setUpdates(storedUpdates);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === user?.id) {
      toast.error('Cannot delete your own account');
      return;
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('civic_connect_users', JSON.stringify(updatedUsers));
    
    // Also remove their issues and updates
    const updatedIssues = issues.filter(i => i.citizenId !== userId);
    const updatedUpdates = updates.filter(u => u.politicianId !== userId);
    
    setIssues(updatedIssues);
    setUpdates(updatedUpdates);
    localStorage.setItem('civic_connect_issues', JSON.stringify(updatedIssues));
    localStorage.setItem('civic_connect_updates', JSON.stringify(updatedUpdates));
    
    toast.success('User deleted successfully');
  };

  const handleChangeUserRole = (userId: string, newRole: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, role: newRole as User['role'] } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('civic_connect_users', JSON.stringify(updatedUsers));
    toast.success('User role updated successfully');
  };

  const handleDeleteIssue = (issueId: string) => {
    const updatedIssues = issues.filter(i => i.id !== issueId);
    setIssues(updatedIssues);
    localStorage.setItem('civic_connect_issues', JSON.stringify(updatedIssues));
    toast.success('Issue deleted successfully');
  };

  const handleDeleteUpdate = (updateId: string) => {
    const updatedUpdates = updates.filter(u => u.id !== updateId);
    setUpdates(updatedUpdates);
    localStorage.setItem('civic_connect_updates', JSON.stringify(updatedUpdates));
    toast.success('Update deleted successfully');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'citizen': return 'bg-blue-100 text-blue-800';
      case 'politician': return 'bg-green-100 text-green-800';
      case 'moderator': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users and platform content</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issues.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Updates</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{updates.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts and roles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(value) => handleChangeUserRole(u.id, value)}
                      disabled={u.id === user.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">Citizen</SelectItem>
                        <SelectItem value="politician">Politician</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === user.id}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Issue Management */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Issues</CardTitle>
          <CardDescription>Monitor and manage reported issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {issues.slice(0, 10).map((issue) => (
              <div key={issue.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <h4 className="font-medium">{issue.title}</h4>
                  <p className="text-sm text-gray-600">
                    by {issue.citizenName} • {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`${
                    issue.status === 'open' ? 'bg-red-100 text-red-800' :
                    issue.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {issue.status}
                  </Badge>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteIssue(issue.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {issues.length === 0 && (
              <p className="text-gray-500 text-center py-4">No issues reported yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Update Management */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
          <CardDescription>Monitor politician updates and announcements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {updates.slice(0, 10).map((update) => (
              <div key={update.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <h4 className="font-medium">{update.title}</h4>
                  <p className="text-sm text-gray-600">
                    by {update.politicianName} • {new Date(update.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteUpdate(update.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {updates.length === 0 && (
              <p className="text-gray-500 text-center py-4">No updates posted yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}