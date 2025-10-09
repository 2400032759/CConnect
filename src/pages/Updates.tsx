import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { Update } from '@/types';
import { toast } from 'sonner';
import { Plus, User, Clock, Megaphone } from 'lucide-react';

export default function Updates() {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = () => {
    const storedUpdates = JSON.parse(localStorage.getItem('civic_connect_updates') || '[]');
    // Sort by creation date, newest first
    const sortedUpdates = storedUpdates.sort((a: Update, b: Update) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setUpdates(sortedUpdates);
  };

  const handleCreateUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'politician') return;

    const update: Update = {
      id: Date.now().toString(),
      ...newUpdate,
      politicianId: user.id,
      politicianName: user.name,
      createdAt: new Date().toISOString(),
    };

    const updatedUpdates = [update, ...updates];
    setUpdates(updatedUpdates);
    localStorage.setItem('civic_connect_updates', JSON.stringify(updatedUpdates));
    
    setNewUpdate({ title: '', content: '' });
    toast.success('Update posted successfully!');
  };

  const handleDeleteUpdate = (updateId: string) => {
    if (!user) return;
    
    const update = updates.find(u => u.id === updateId);
    if (!update) return;
    
    // Only allow deletion by the author, admin, or moderator
    if (update.politicianId !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
      toast.error('You can only delete your own updates');
      return;
    }

    const updatedUpdates = updates.filter(u => u.id !== updateId);
    setUpdates(updatedUpdates);
    localStorage.setItem('civic_connect_updates', JSON.stringify(updatedUpdates));
    toast.success('Update deleted successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Updates</h1>
          <p className="text-gray-600">Latest announcements from representatives</p>
        </div>
        
        {user?.role === 'politician' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post Update
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Post New Update</DialogTitle>
                <DialogDescription>
                  Share important information with citizens
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Update title"
                    value={newUpdate.title}
                    onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Update content and details"
                    value={newUpdate.content}
                    onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
                    rows={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Post Update
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {updates.map((update) => (
          <Card key={update.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-2">{update.title}</CardTitle>
                  <CardDescription className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {update.politicianName}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(update.createdAt).toLocaleDateString()} at{' '}
                      {new Date(update.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Megaphone className="h-5 w-5 text-blue-600" />
                  {(user?.id === update.politicianId || user?.role === 'admin' || user?.role === 'moderator') && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUpdate(update.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{update.content}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {updates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No updates available</p>
            {user?.role === 'politician' ? (
              <p className="text-sm text-gray-400 mt-2">
                Be the first to post an update for your constituents
              </p>
            ) : (
              <p className="text-sm text-gray-400 mt-2">
                Check back later for announcements from your representatives
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}