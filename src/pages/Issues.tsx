import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { Issue, IssueResponse } from '@/types';
import { toast } from 'sonner';
import { Plus, MapPin, Clock, User, MessageSquare, AlertCircle } from 'lucide-react';

export default function Issues() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    location: '',
    photo: '',
  });
  const [responseMessage, setResponseMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = () => {
    const storedIssues = JSON.parse(localStorage.getItem('civic_connect_issues') || '[]');
    setIssues(storedIssues);
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const issue: Issue = {
      id: Date.now().toString(),
      ...newIssue,
      status: 'open',
      citizenId: user.id,
      citizenName: user.name,
      createdAt: new Date().toISOString(),
      responses: [],
    };

    const updatedIssues = [...issues, issue];
    setIssues(updatedIssues);
    localStorage.setItem('civic_connect_issues', JSON.stringify(updatedIssues));
    
    setNewIssue({ title: '', description: '', location: '', photo: '' });
    toast.success('Issue reported successfully!');
  };

  const handleAddResponse = (issueId: string) => {
    if (!user || !responseMessage.trim()) return;

    const response: IssueResponse = {
      id: Date.now().toString(),
      issueId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      message: responseMessage,
      createdAt: new Date().toISOString(),
    };

    const updatedIssues = issues.map(issue => 
      issue.id === issueId 
        ? { ...issue, responses: [...issue.responses, response] }
        : issue
    );

    setIssues(updatedIssues);
    localStorage.setItem('civic_connect_issues', JSON.stringify(updatedIssues));
    setResponseMessage('');
    toast.success('Response added successfully!');
  };

  const handleStatusChange = (issueId: string, newStatus: 'open' | 'in-progress' | 'resolved') => {
    if (user?.role !== 'politician' && user?.role !== 'admin') return;

    const updatedIssues = issues.map(issue =>
      issue.id === issueId ? { ...issue, status: newStatus } : issue
    );

    setIssues(updatedIssues);
    localStorage.setItem('civic_connect_issues', JSON.stringify(updatedIssues));
    toast.success('Issue status updated!');
  };

  const filteredIssues = issues.filter(issue => {
    if (statusFilter === 'all') return true;
    return issue.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Issues</h1>
          <p className="text-gray-600">Report and track community issues</p>
        </div>
        
        {user?.role === 'citizen' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Report New Issue</DialogTitle>
                <DialogDescription>
                  Help improve your community by reporting issues
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateIssue} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the issue"
                    value={newIssue.description}
                    onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Where is this issue located?"
                    value={newIssue.location}
                    onChange={(e) => setNewIssue({ ...newIssue, location: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo">Photo URL (Optional)</Label>
                  <Input
                    id="photo"
                    placeholder="Link to a photo of the issue"
                    value={newIssue.photo}
                    onChange={(e) => setNewIssue({ ...newIssue, photo: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Submit Issue
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <Label>Filter by status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Issues</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredIssues.map((issue) => (
          <Card key={issue.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader onClick={() => setSelectedIssue(issue)}>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{issue.title}</CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {issue.citizenName}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {issue.location}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status.replace('-', ' ')}
                  </Badge>
                  {issue.responses.length > 0 && (
                    <Badge variant="outline">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {issue.responses.length}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 line-clamp-2">{issue.description}</p>
              {issue.photo && (
                <img
                  src={issue.photo}
                  alt="Issue"
                  className="mt-2 rounded-md max-h-32 object-cover"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Issue Detail Dialog */}
      {selectedIssue && (
        <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle>{selectedIssue.title}</DialogTitle>
                  <DialogDescription className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {selectedIssue.citizenName}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {selectedIssue.location}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(selectedIssue.createdAt).toLocaleDateString()}
                    </span>
                  </DialogDescription>
                </div>
                <Badge className={getStatusColor(selectedIssue.status)}>
                  {selectedIssue.status.replace('-', ' ')}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{selectedIssue.description}</p>
              </div>

              {selectedIssue.photo && (
                <div>
                  <h4 className="font-medium mb-2">Photo</h4>
                  <img
                    src={selectedIssue.photo}
                    alt="Issue"
                    className="rounded-md max-h-64 object-cover"
                  />
                </div>
              )}

              {(user?.role === 'politician' || user?.role === 'admin') && (
                <div>
                  <Label>Update Status:</Label>
                  <Select
                    value={selectedIssue.status}
                    onValueChange={(value: 'open' | 'in-progress' | 'resolved') =>
                      handleStatusChange(selectedIssue.id, value)
                    }
                  >
                    <SelectTrigger className="w-40 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Responses ({selectedIssue.responses.length})</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedIssue.responses.map((response) => (
                    <div key={response.id} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">
                          {response.userName} ({response.userRole})
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(response.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{response.message}</p>
                    </div>
                  ))}
                </div>

                {(user?.role === 'politician' || user?.role === 'admin' || user?.role === 'moderator') && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder="Add a response..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                    />
                    <Button
                      onClick={() => handleAddResponse(selectedIssue.id)}
                      disabled={!responseMessage.trim()}
                    >
                      Add Response
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {filteredIssues.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No issues found</p>
            {user?.role === 'citizen' && (
              <p className="text-sm text-gray-400 mt-2">
                Be the first to report an issue in your community
              </p>
            )}
          </CardContent>
        </Card>
      )}
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