'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSiteAuth } from '@/hooks/use-site-auth';

interface AuthForgotPasswordProps {
  redirectUrl?: string;
}

export default function AuthForgotPassword({ 
  redirectUrl = '/reset-password',
}: AuthForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword, isLoading, error } = useSiteAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(email, redirectUrl);
    if (!error) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto p-6 text-center border rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
        <p className="text-sm text-gray-600">
          We have sent a password reset link to <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input 
            id="email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            placeholder="name@example.com"
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Sending link...' : 'Send reset link'}
        </Button>
      </form>
    </div>
  );
}
