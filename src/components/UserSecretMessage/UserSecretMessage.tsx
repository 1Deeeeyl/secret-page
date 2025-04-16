'use client';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface ProfileProps {
  user: User;
}
function UserSecretMessage({ user }: ProfileProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [secretMessage, setSecretMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const { data: message } = await supabase
          .from('secret_messages')
          .select('message')
          .eq('profile_id', user.id)
          .single();

        setSecretMessage(message?.message || 'User has no secret message.');
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();

    // Set up realtime subscription
    const channel = supabase
      .channel('user-secret-message')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'secret_messages',
          filter: `profile_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Realtime update in UserSecretMessage:', payload);
          if (payload.eventType === 'DELETE') {
            setSecretMessage('User has no secret message.');
          } else {
            // For INSERT or UPDATE events
            setSecretMessage(payload.new.message);
          }
        }
      )
      .subscribe();

    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, supabase]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>
        The secret message is:&nbsp;
        <span
          className={` font-extrabold ${
            secretMessage === 'User has no secret message.'
              ? 'text-red-500'
              : 'text-green-500'
          }`}
        >
          {secretMessage}
        </span>
      </p>
    </div>
  );
}

export default UserSecretMessage;
