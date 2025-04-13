// components/home/Home.tsx
'use client';

import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface HomePageProps {
  user: User;
}

export default function HomePage({ user }: HomePageProps) {
  const supabase = createClient();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('profile_id', user.id)
          .single();

        setUsername(profile?.username || user.email || 'User');
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // this prevents redirect problems (Life saver!!)
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    
    if (confirmed) {
      try {
        // First, call your API to delete the account
        const response = await fetch('/api/delete-account', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete account');
        }
        
        // Sign out after successful deletion
        await supabase.auth.signOut();
        window.location.href = '/';
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete your account. Please try again.');
      }
    }
  };

  if (loading) return <p className="p-4">Loading profile...</p>;

  return (
    <div className="p-4">
      <header className="bg-gray-100 p-4 mb-4 rounded">
        <nav className="flex justify-between items-center">
          <div>
            <a href="/" className="mr-4">Home</a>
            <a href="/page1" className="mr-4">Page 1</a>
            <a href="/page2" className="mr-4">Page 2</a>
            <a href="/page3" className="mr-4">Page 3</a>
          </div>
          <div>
            <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded mr-2">Log Out</button>
            <button onClick={handleDeleteAccount} className="bg-red-100 text-red-700 px-3 py-1 rounded">Delete Account</button>
          </div>
        </nav>
      </header>
      
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl mb-4">Welcome, {username}!</h1>
        <p>You are now logged in successfully.</p>
      </div>
    </div>
  );
}