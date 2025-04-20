'use client';

import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface HomePageProps {
  user: User;
}

type FriendRequest = {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  sender_username?: string;
};

function FriendRequestList({ user }: HomePageProps) {
  const supabase = createClient();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);

      const { data: friendshipData, error: friendshipError } = await supabase
        .from('friends')
        .select('*')
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (friendshipError) throw friendshipError;

      if (!friendshipData || friendshipData.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const senderIds = friendshipData.map((request) => request.user_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('profile_id, username')
        .in('profile_id', senderIds);

      if (profilesError) throw profilesError;

      const usernameMap: { [key: string]: string } = {};
      profilesData?.forEach((profile) => {
        usernameMap[profile.profile_id] = profile.username;
      });

      const combinedData = friendshipData.map((request) => ({
        ...request,
        sender_username: usernameMap[request.user_id] || 'Unknown User',
      }));

      setRequests(combinedData);
    } catch (err: any) {
      console.error('Error fetching friend requests:', err);
      setError(err.message || 'Failed to load friend requests');
    } finally {
      setLoading(false);
    }
  };

  // accept button
  const handleAccept = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err: any) {
      console.error('Error accepting friend request:', err);
      setError(err.message || 'Failed to accept friend request');
    }
  };

  // reject button
  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err: any) {
      console.error('Error rejecting friend request:', err);
      setError(err.message || 'Failed to reject friend request');
    }
  };

  useEffect(() => {
    fetchFriendRequests();

    // supabase realtime data fetching (supabase docs)
    const channel = supabase
      .channel('friend-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
          filter: `friend_id=eq.${user.id}`,
        },
        async (payload) => {
          if (
            payload.eventType === 'INSERT' &&
            payload.new.status === 'pending'
          ) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username')
              .eq('profile_id', payload.new.user_id)
              .single();

            const newRequest = {
              ...payload.new,
              sender_username: profileData?.username || 'Unknown User',
            } as FriendRequest;

            setRequests((prev) => [...prev, newRequest]);
          }

          // if row is either rejected or accepted
          if (payload.eventType === 'UPDATE') {
            if (payload.new.status !== 'pending') {
              setRequests((prev) =>
                prev.filter((req) => req.id !== payload.new.id)
              );
            }
          }
          
          // if row is deleted
          if (payload.eventType === 'DELETE') {
            setRequests((prev) =>
              prev.filter((req) => req.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  return (
    <div className="bg-white rounded-lg p-5">
      <h3 className="font-bold text-xl mb-4">Friend Requests</h3>

      {loading ? (
        <p className="text-gray-500">Loading friend requests...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500">No pending friend requests</p>
      ) : (
        <ul className="list-none flex flex-col gap-3 max-w-full">
          {requests.map((request) => (
            <li
              key={request.id}
              className="flex justify-between items-center p-3 rounded-md flex-row gap-30"
            >
              <p className="font-medium">{request.sender_username}</p>
              <span className="flex gap-2">
                <button
                  onClick={() => handleAccept(request.id)}
                  className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
                >
                  Decline
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FriendRequestList;
