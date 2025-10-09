import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { Issue, Update, IssueResponse } from '@/types';
import { toast } from 'sonner';
import { AlertTriangle, Trash2, MessageSquare, Flag } from 'lucide-react';

export default function Moderate() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  useEffect(() => {
    if (user?.role !== 'moderator') return;
    loadData();
  }, [user]);

  const loadData = () => {
    const storedIssues = JSON.parse(localStorage.getItem('civic_connect_issues') || '[]');
    const storedUpdates = JSON.parse(localStorage.getItem('civic_connect_updates') || '[]');
    
    setIssues(storedIssues);
    setUpdates(storedUpdates);
  };

  const handleDeleteIssue = (issueId: string) => {
    const updatedIssues = issues.filter(i => i.id !== issueId);
    setIssues(updatedIssues);
    localStorage.setItem('civic_connect_issues', JSON.stringify(updatedIssues));
    toast.success('Issue removed successfully');
  };

  const handleDeleteUpdate = (updateId: string) => {
    const updatedUpdates = updates.filter(u => u.id !== updateId);
    setUpdates(updatedUpdates);
    localStorage.setItem('civic_connect_updates', JSON.stringify(updatedUpdates));
    toast.success('Update removed successfully');
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
    setSelectedItemId('');
    toast.success('Response added successfully');
  };

  if (user?.role !== 'moderator') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Access denied. Moderator privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
        <p className="text-gray-600">Review and moderate platform content</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues to Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issues.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Updates to Review</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{updates.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Issues Moderation */}
      <Card>
        <CardHeader>
          <CardTitle>Reported Issues</CardTitle>
          <CardDescription>Review citizen-reported issues for inappropriate content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-lg">{issue.title}</h4>
                    <p className="text-sm text-gray-600">
                      by {issue.citizenName} • {new Date(issue.createdAt).toLocaleDateString()} • {issue.location}
                    </p>
                  </div>
                  <div className="flex space-x-2">
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
                
                <p className="text-gray-700">{issue.description}</p>
                
                {issue.photo && (
                  <img
                    src={issue.photo}
                    alt="Issue"
                    className="rounded-md max-h-48 object-cover"
                  />
                )}

                {issue.responses.length > 0 && (
                  <div className="border-t pt-3">
                    <h5 className="font-medium text-sm mb-2">
                      Responses ({issue.responses.length})
                    </h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {issue.responses.map((response) => (
                        <div key={response.id} className="bg-gray-50 p-2 rounded text-sm">
                          <div className="font-medium">
                            {response.userName} ({response.userRole})
                          </div>
                          <p>{response.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-3">
                  {selectedItemId === issue.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add a moderation response..."
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddResponse(issue.id)}
                          disabled={!responseMessage.trim()}
                        >
                          Post Response
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedItemId('')}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedItemId(issue.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Add Response
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {issues.length === 0 && (
              <p className="text-gray-500 text-center py-8">No issues to moderate</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Updates Moderation */}
      <Card>
        <CardHeader>
          <CardTitle>Posted Updates</CardTitle>
          <CardDescription>Review politician updates and announcements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-lg">{update.title}</h4>
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
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{update.content}</p>
                </div>
              </div>
            ))}
            {updates.length === 0 && (
              <p className="text-gray-500 text-center py-8">No updates to moderate</p>
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