// components/home/Home.tsx
'use client';

import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import DeleteAccountButton from '../deleteaccountbutton/DeleteAccountButton';

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

  // const handleDeleteAccount = async () => {
  //   const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    
  //   if (confirmed) {
  //     try {
  //       setLoading(true);
        
  //       // Call the RESTful API endpoint with user ID
  //       const response = await fetch(`/api/users/${user.id}`, { 
  //         method: 'DELETE',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         }
  //       });
        
  //       // Check if response is JSON
  //       const contentType = response.headers.get('content-type');
  //       if (!contentType || !contentType.includes('application/json')) {
  //         console.error('Non-JSON response received:', await response.text());
  //         throw new Error('Server returned an invalid response format');
  //       }
        
  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         throw new Error(errorData.message || 'Failed to delete account');
  //       }
        
  //       // Sign out after successful deletion
  //       await supabase.auth.signOut();
  //       window.location.href = '/';
  //     } catch (error) {
  //       console.error('Error deleting account:', error);
  //       alert(`Failed to delete your account: ${error instanceof Error ? error.message : String(error)}`);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };

  if (loading) return <p className="p-4">Loading profile...</p>;

  return (
    <div className="p-4">
      <header className="bg-gray-100 p-4 mb-4 rounded">
        <nav className="flex justify-between items-center">
          <div>
            <Link href="/" className='mr-4'>Home</Link>
            <Link href="/secret-page-1" className='mr-4'>Secret Page 1</Link>
            <Link href="/secret-page-2" className='mr-4'>Secret Page 2</Link>
            <Link href="/secret-page-3" className='mr-4'>Secret Page 3</Link>
          </div>
          <div>
            <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded mr-2">Log Out</button>
            <DeleteAccountButton user={user}/>
            {/* <button onClick={handleDeleteAccount} className="bg-red-100 text-red-700 px-3 py-1 rounded">Delete Account</button> */}
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