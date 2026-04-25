'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSiteAuth } from '@/hooks/use-site-auth';

interface AuthLoginProps {
  redirectUrl?: string;
  showGoogle?: boolean;
  showGithub?: boolean;
}

export default function AuthLogin({ 
  redirectUrl = '/',
  showGoogle = true,
  showGithub = false,
}: AuthLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithProvider, isLoading, error } = useSiteAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password, redirectUrl);
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            placeholder="name@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {(showGoogle || showGithub) && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {showGithub && (
              <Button 
                variant="outline" 
                type="button"
                disabled={isLoading}
                onClick={() => loginWithProvider('github', redirectUrl)}
              >
                GitHub
              </Button>
            )}
            {showGoogle && (
              <Button 
                variant="outline" 
                type="button"
                disabled={isLoading}
                onClick={() => loginWithProvider('google', redirectUrl)}
                className={!showGithub ? "col-span-2" : ""}
              >
                Google
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
