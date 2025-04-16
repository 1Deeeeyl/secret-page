
'use client';

import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import NavBar from '../navbar/NavBar';

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

        

        setUsername(profile?.username);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user.id]);


  

  if (loading) return <p className="p-4">Loading profile...</p>;

  return (
    <div className="p-4">
      <header className="bg-gray-100 p-4 mb-4 rounded">
        <NavBar user={user}/>
      </header>
      
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl mb-4">Welcome, {username}!</h1>
      </div>

    </div>
  );
}