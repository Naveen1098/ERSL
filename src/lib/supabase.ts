import { createClient } from '@supabase/supabase-js';
import type { User } from '../types';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && key);
export const supabase = supabaseConfigured ? createClient(url!, key!) : null;

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member' | 'pending';
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) return null;
  return data as Profile;
}

export function profileToUser(p: Profile): User {
  return {
    id: p.id,
    name: p.name || p.email,
    email: p.email,
    role: p.role === 'admin' ? 'Admin' : 'Researcher',
    department: 'Environmental Remote Sensing Laboratory',
  };
}
