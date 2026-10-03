import { createClient } from '@supabase/supabase-js';
import type { User } from '../types';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://qulkwrhajibaddvgjaht.supabase.co';
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || 'sb_publishable_AVEbmVPu3rFKrpD7IFVc2Q_Cn4tWdc6';

export const supabaseConfigured = Boolean(url && key);
export const supabase = supabaseConfigured ? createClient(url!, key!) : null;

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member' | 'pending';
}

export const ADMIN_EMAILS = [
  'hongxing.liu@ua.edu',
  'naveenpurushothaman1098@gmail.com',
  'npurushothaman@ua.edu',
];

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!error && data) {
      const email = (data.email || '').toLowerCase().trim();
      if (ADMIN_EMAILS.includes(email)) {
        data.role = 'admin';
      }
      return data as Profile;
    }
  } catch (e) {
    console.warn('Profile fetch notice:', e);
  }

  // Fallback: Resolve authenticated user directly from Supabase session
  try {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (user && user.id === userId) {
      const email = (user.email || '').toLowerCase().trim();
      const isAdmin = ADMIN_EMAILS.includes(email);
      const fallbackProfile: Profile = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'Lab Member'),
        role: isAdmin ? 'admin' : 'member',
      };
      // Auto-upsert into profiles in background if table exists
      try {
        supabase.from('profiles').upsert([fallbackProfile]).then(() => {}).catch(() => {});
      } catch {}
      return fallbackProfile;
    }
  } catch (e) {
    console.warn('Fallback profile error:', e);
  }

  return null;
}

export function profileToUser(p: Profile): User {
  const email = (p.email || '').toLowerCase().trim();
  const isAdmin = p.role === 'admin' || ADMIN_EMAILS.includes(email);
  return {
    id: p.id,
    name: p.name || (p.email ? p.email.split('@')[0] : 'Lab Member'),
    email: p.email || '',
    role: isAdmin ? 'Admin' : 'Researcher',
    department: 'Environmental Remote Sensing Laboratory',
  };
}
