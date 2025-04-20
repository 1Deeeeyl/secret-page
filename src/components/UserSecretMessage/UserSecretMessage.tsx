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
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const { data, error } = await supabase
          .from('secret_messages')
          .select('message')
          .eq('profile_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading message:', error);
          setSecretMessage('Error loading message.');
          setHasData(false);
        } else if (data) {
          setSecretMessage(data.message || ''); 
          setHasData(true);
        } else {
          
          setSecretMessage('User has not set a secret message.');
          setHasData(false);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setSecretMessage('Error loading message.');
        setHasData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();

    const channel = supabase
      .channel('user-secret-message')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'secret_messages',
          filter: `profile_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setSecretMessage('User has not set a secret message.');
            setHasData(false);
          } else {
            const newMessage = payload.new?.message ?? '';
            setSecretMessage(newMessage);
            setHasData(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  return (
    <div>
      <p>
        The secret message is:&nbsp;
        {loading ? (
          <span className="font-bold text-gray-500">Loading...</span>
        ) : (
          <span
            className={`font-extrabold ${
              hasData ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {secretMessage === ''
              ? 'None'
              : secretMessage}{' '}
          </span>
        )}
      </p>
    </div>
  );
}

export default UserSecretMessage;
