export type Role = 'Admin' | 'Researcher' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatarUrl?: string;
}

export interface ResearchTheme {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  image: string; // fallback to URL or stock name
}

export interface Project {
  id: string;
  title: string;
  agency: string;
  details: string;
  link?: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  type: 'Peer-Reviewed Article' | 'Conference' | 'Other';
  link?: string;
  abstract?: string;
  keywords?: string[];
}

export interface Software {
  id: string;
  title: string;
  description: string;
  link?: string;
  language: 'Python' | 'R' | 'JavaScript' | 'Other';
}

export interface DataLayer {
  id: string;
  name: string;
  description: string;
  availability: string;
  link?: string;
}

export interface Instrument {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  manualLink?: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  researchFocus: string;
  bio: string;
  email: string;
  scholar?: string;
  linkedin?: string;
  image: string;
  group?: 'member' | 'collaborator'; // defaults to 'member'
}

export interface BoxFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  updatedAt: string;
  updatedBy: string;
  parentId: string | null;
  downloadUrl?: string;
  tags?: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
}

export interface TeachingMaterial {
  id: string;
  title: string;
  course: string;
  description: string;
  link?: string;
  updatedAt: string;
}

