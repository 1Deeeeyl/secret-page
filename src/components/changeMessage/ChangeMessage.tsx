'use client';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Modal from '../modal/Modal';

interface ProfileProps {
  user: User;
}

function ChangeMessage({ user }: ProfileProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [secretMessage, setSecretMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasExistingMessage, setHasExistingMessage] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const { data: message, error } = await supabase
          .from('secret_messages')
          .select('message')
          .eq('profile_id', user.id)
          .single();

        if (message) {
          // if message column is blank
          setSecretMessage(message.message ?? '');
          setHasExistingMessage(true);
        } else {
          // if message column is null(no row found)
          setSecretMessage('');
          setHasExistingMessage(false);
        }

        if (error) {
          console.error('Error fetching message:', error);
        }
      } catch (err) {
        console.error('Error loading message:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();

    // realtime data fetching (supabase docs)
    const channel = supabase
      .channel('realtime-secret-message')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'secret_messages',
          filter: `profile_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Realtime payload in ChangeMessage:', payload);
          if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'UPDATE'
          ) {
            const newMessage = payload.new?.message ?? '';
            setSecretMessage(newMessage);
            setHasExistingMessage(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, supabase]);

  const submitData = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      let result;
      // User has existing data
      if (hasExistingMessage) {
        result = await supabase
          .from('secret_messages')
          .update({
            message: secretMessage,
            updated_at: new Date().toISOString(),
          })
          .eq('profile_id', user.id);
      } else {
        // User has no existing data
        result = await supabase.from('secret_messages').insert({
          profile_id: user.id,
          message: secretMessage,
          updated_at: new Date().toISOString(),
        });
      }

      if (result.error) {
        console.error('There is an error:', result.error);
        throw result.error;
      }

      console.log('Operation successful:', result);
      setHasExistingMessage(true);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 2000); 
    } catch (err: any) {
      console.error('Error submitting message:', err);
      setError(err.message || 'Failed to save message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        className={`px-4 py-2 rounded w-fit disabled ${
          loading
            ? 'bg-gray-500 text-slate-100'
            : 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
        }`}
        onClick={() => setOpen(true)}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Edit Message'}
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col">
          <label htmlFor="secret-message" className="mb-1 font-medium">
            Your Secret Message
          </label>
          <textarea
            id="secret-message"
            value={secretMessage}
            onChange={(e) => {
              setSecretMessage(e.target.value);
              e.currentTarget.style.height = 'auto';
              e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); 
                submitData(); 
              }
            }}
            rows={1}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden transition-all mb-5"
            placeholder="Enter your secret message here!"
          />
        </div>

        <button
          className={`px-4 py-2 rounded ${
            submitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          onClick={submitData}
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Save Message'}
        </button>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mt-5">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-2 rounded mt-5">
            Message saved successfully!
          </div>
        )}
      </Modal>
    </>
  );
}

export default ChangeMessage;
