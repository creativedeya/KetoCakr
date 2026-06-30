// ===========================================================
// FILE: mobile/store/useAuthStore.ts
// STEP 3: Real Supabase auth
// ===========================================================
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: any | null;
  profile: any | null;
  isLoading: boolean;
  error: string | null;
  
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: false,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Check for existing session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({ 
          user: session.user, 
          profile: profileData,
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      console.error('Initialize error:', error);
      set({ 
        error: error.message || 'Грешка при инициализация',
        isLoading: false 
      });
    }
  },



 signIn: async (email: string, password: string) => {
  try {
    set({ isLoading: true, error: null });
    
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });


    if (error) throw error;

    if (data.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      set({ 
        user: data.user, 
        profile: profileData,
        isLoading: false 
      });
    }
  } catch (error: any) {
    
    set({ 
      error: error.message || 'Грешка при вход',
      isLoading: false 
    });
    throw error;
  }
},

 signUp: async (email: string, password: string, fullName: string) => {
  try {
    set({ isLoading: true, error: null });
    
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });


    if (error) throw error;
    
    set({ isLoading: false });
    return data;
  } catch (error: any) {
    
    set({ 
      error: error.message || 'Грешка при регистрация',
      isLoading: false 
    });
    throw error;
  }
},
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      await supabase.auth.signOut();
      set({ user: null, profile: null, isLoading: false });
    } catch (error: any) {
      console.error('Sign out error:', error);
      set({ 
        error: error.message || 'Грешка при изход',
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));
