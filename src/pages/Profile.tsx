import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PasswordStrength } from '@/components/PasswordStrength';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { User, Mail, Calendar, Shield, Key, Eye, EyeOff } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = {
      ...user,
      name: editForm.name,
      email: editForm.email,
    };

    // Update current user in localStorage
    localStorage.setItem('civic_connect_user', JSON.stringify(updatedUser));

    // Update user in users list
    const users: User[] = JSON.parse(localStorage.getItem('civic_connect_users') || '[]');
    const updatedUsers = users.map((u: User) => 
      u.id === user.id ? updatedUser : u
    );
    localStorage.setItem('civic_connect_users', JSON.stringify(updatedUsers));

    setIsEditing(false);
    toast.success('Profile updated successfully!');
    
    // Refresh the page to reflect changes
    window.location.reload();
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      // Verify current password
      const credentials = JSON.parse(localStorage.getItem('civic_connect_credentials') || '{}');
      const currentHashedPassword = await hashPassword(passwordForm.currentPassword);
      const storedPassword = credentials[user.id];

      if (!storedPassword || storedPassword !== currentHashedPassword) {
        toast.error('Current password is incorrect');
        return;
      }

      // Update password
      const newHashedPassword = await hashPassword(passwordForm.newPassword);
      credentials[user.id] = newHashedPassword;
      localStorage.setItem('civic_connect_credentials', JSON.stringify(credentials));

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'System administrator with full platform access';
      case 'citizen':
        return 'Community member who can report issues and provide feedback';
      case 'politician':
        return 'Elected representative who responds to citizen concerns';
      case 'moderator':
        return 'Content moderator who ensures platform quality';
      default:
        return 'Platform user';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'citizen':
        return 'bg-blue-100 text-blue-800';
      case 'politician':
        return 'bg-green-100 text-green-800';
      case 'moderator':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Personal Information</CardTitle>
              <CardDescription>Your account details and role information</CardDescription>
            </div>
            <Button
              variant={isEditing ? "secondary" : "outline"}
              onClick={() => {
                if (isEditing) {
                  setEditForm({ name: user.name, email: user.email });
                }
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Save Changes</Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">Full Name</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-500">Email Address</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {getRoleDescription(user.role)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">Member Since</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-2">Role Permissions</h4>
            <div className="space-y-2 text-sm">
              {user.role === 'citizen' && (
                <>
                  <p>✓ Report community issues</p>
                  <p>✓ View politician updates</p>
                  <p>✓ Track issue status</p>
                </>
              )}
              {user.role === 'politician' && (
                <>
                  <p>✓ Post public updates</p>
                  <p>✓ Respond to citizen issues</p>
                  <p>✓ Update issue status</p>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <p>✓ Manage all users</p>
                  <p>✓ View platform analytics</p>
                  <p>✓ Moderate all content</p>
                </>
              )}
              {user.role === 'moderator' && (
                <>
                  <p>✓ Moderate user content</p>
                  <p>✓ Remove inappropriate posts</p>
                  <p>✓ Respond to issues</p>
                </>
              )}
            </div>
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