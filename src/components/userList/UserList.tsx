'use client';

import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface HomePageProps {
  user: User;
}

// Define a type for the username object
type UsernameObject = {
  [profileId: string]: string; // key = profile_id, value = username
};

function UserList({ user }: HomePageProps) {
  const supabase = createClient();
  const [userList, setUserList] = useState<UsernameObject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('profile_id, username')
          .neq('profile_id', user.id); 

        if (error) throw error;

        // Convert array of users into an object
        const usernames: UsernameObject = {};
        data?.forEach((user) => {
          usernames[user.profile_id] = user.username;
        });

        setUserList(usernames);
      } catch (err) {
        console.error('Error loading profiles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);


  return (
    <div>
        <h2 className='font-bold text-xl'>User List</h2>
      {loading ? (
        <p>Loading...</p>
      ) : userList && Object.keys(userList).length > 0 ? (
        <ul className="list-disc pl-5">
          {Object.entries(userList).map(([profileId, username]) => (
            <li key={profileId}>{username}</li>
           
          ))}
        </ul>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
}

export default UserList;
