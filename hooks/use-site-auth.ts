'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-browser';
import type { Provider } from '@supabase/supabase-js';

export function useSiteAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string, redirectUrl: string = '/') => {
    setIsLoading(true);
    setError(null);
    try {
      const client = await createBrowserClient();
      if (!client) throw new Error('Supabase is not configured.');

      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string, redirectUrl: string = '/') => {
    setIsLoading(true);
    setError(null);
    try {
      const client = await createBrowserClient();
      if (!client) throw new Error('Supabase is not configured.');

      const { error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) throw error;
      
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithProvider = async (provider: Provider, redirectUrl: string = '/') => {
    setIsLoading(true);
    setError(null);
    try {
      const client = await createBrowserClient();
      if (!client) throw new Error('Supabase is not configured.');

      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${redirectUrl}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, redirectUrl: string = '/reset-password') => {
    setIsLoading(true);
    setError(null);
    try {
      const client = await createBrowserClient();
      if (!client) throw new Error('Supabase is not configured.');

      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${redirectUrl}`,
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string, redirectUrl: string = '/') => {
    setIsLoading(true);
    setError(null);
    try {
      const client = await createBrowserClient();
      if (!client) throw new Error('Supabase is not configured.');

      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (redirectUrl: string = '/') => {
    setIsLoading(true);
    try {
      const client = await createBrowserClient();
      if (client) {
        await client.auth.signOut();
      }
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('Logout failed', err);
      window.location.href = redirectUrl;
    }
  };

  return {
    login,
    register,
    loginWithProvider,
    resetPassword,
    updatePassword,
    logout,
    isLoading,
    error,
    setError,
  };
}
