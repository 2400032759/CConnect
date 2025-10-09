import { useState, useEffect } from 'react';
import { User } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('civic_connect_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const users = JSON.parse(localStorage.getItem('civic_connect_users') || '[]');
      const credentials = JSON.parse(localStorage.getItem('civic_connect_credentials') || '{}');
      
      const foundUser = users.find((u: User) => u.email === email);
      if (!foundUser) {
        return null;
      }

      const hashedPassword = await hashPassword(password);
      const storedPassword = credentials[foundUser.id];
      
      if (storedPassword && storedPassword === hashedPassword) {
        localStorage.setItem('civic_connect_user', JSON.stringify(foundUser));
        setUser(foundUser);
        return foundUser;
      }
      
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  const register = async (name: string, email: string, password: string, role: 'citizen' | 'politician'): Promise<User | null> => {
    try {
      const users = JSON.parse(localStorage.getItem('civic_connect_users') || '[]');
      const credentials = JSON.parse(localStorage.getItem('civic_connect_credentials') || '{}');
      
      // Check if email already exists
      const existingUser = users.find((u: User) => u.email === email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Validate password
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      };
      
      const hashedPassword = await hashPassword(password);
      
      users.push(newUser);
      credentials[newUser.id] = hashedPassword;
      
      localStorage.setItem('civic_connect_users', JSON.stringify(users));
      localStorage.setItem('civic_connect_credentials', JSON.stringify(credentials));
      localStorage.setItem('civic_connect_user', JSON.stringify(newUser));
      
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('civic_connect_user');
    setUser(null);
  };

  // Initialize with demo data if no users exist
  useEffect(() => {
    const initializeDemoData = async () => {
      const users = localStorage.getItem('civic_connect_users');
      const credentials = localStorage.getItem('civic_connect_credentials');
      
      if (!users || !credentials) {
        const demoUsers: User[] = [
          {
            id: '1',
            name: 'Admin User',
            email: 'admin@civic.com',
            role: 'admin',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'John Citizen',
            email: 'citizen@civic.com',
            role: 'citizen',
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Mayor Smith',
            email: 'politician@civic.com',
            role: 'politician',
            createdAt: new Date().toISOString(),
          },
          {
            id: '4',
            name: 'Moderator',
            email: 'moderator@civic.com',
            role: 'moderator',
            createdAt: new Date().toISOString(),
          },
        ];

        // Create demo credentials (password: "demo123" for all demo accounts)
        const demoPassword = "demo123";
        const hashedDemo = await hashPassword(demoPassword);
        const demoCredentials = {
          '1': hashedDemo,
          '2': hashedDemo,
          '3': hashedDemo,
          '4': hashedDemo,
        };

        localStorage.setItem('civic_connect_users', JSON.stringify(demoUsers));
        localStorage.setItem('civic_connect_credentials', JSON.stringify(demoCredentials));
      }
    };

    initializeDemoData();
  }, []);

  return { user, isLoading, login, register, logout };
};