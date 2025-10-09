export type UserRole = 'admin' | 'citizen' | 'politician' | 'moderator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  location: string;
  photo?: string;
  status: 'open' | 'in-progress' | 'resolved';
  citizenId: string;
  citizenName: string;
  createdAt: string;
  responses: IssueResponse[];
}

export interface IssueResponse {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  createdAt: string;
}

export interface Update {
  id: string;
  title: string;
  content: string;
  politicianId: string;
  politicianName: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  title: string;
  content: string;
  citizenId: string;
  citizenName: string;
  createdAt: string;
  responses: FeedbackResponse[];
}

export interface FeedbackResponse {
  id: string;
  feedbackId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  createdAt: string;
}