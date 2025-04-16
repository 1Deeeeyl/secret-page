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
  sender_username?: string; // Username of the request sender
};

function FriendRequestList({ user }: HomePageProps) {
  const supabase = createClient();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);

      // First, get all pending requests
      const { data: friendshipData, error: friendshipError } = await supabase
        .from('friends')
        .select('*')
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (friendshipError) throw friendshipError;

      if (!friendshipData || friendshipData.length === 0) {
        setRequests([]);
        return;
      }

      // Get all the usernames in a separate query
      const senderIds = friendshipData.map((request) => request.user_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('profile_id, username')
        .in('profile_id', senderIds);

      if (profilesError) throw profilesError;

      // Create a map of profile_id to username
      const usernameMap: { [key: string]: string } = {};
      profilesData?.forEach((profile) => {
        usernameMap[profile.profile_id] = profile.username;
      });

      // Combine the data
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

  const handleAccept = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ 
          status: 'accepted', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', requestId);
  
      if (error) throw error;
  
      // Refresh the list after accepting
      fetchFriendRequests();
    } catch (err: any) {
      console.error('Error accepting friend request:', err);
      setError(err.message || 'Failed to accept friend request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      // Refresh the list after rejecting
      fetchFriendRequests();
    } catch (err: any) {
      console.error('Error rejecting friend request:', err);
      setError(err.message || 'Failed to reject friend request');
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, [user.id]);

  if (loading) {
    return <div>Loading friend requests...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 w-full max-w-md">
      <h3 className="font-bold text-xl mb-4">Friend Requests</h3>

      {requests.length === 0 ? (
        <p className="text-gray-500">No pending friend requests</p>
      ) : (
        <ul className="list-none flex flex-col gap-3 w-full">
          {requests.map((request) => (
            <li
              key={request.id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-md shadow-sm"
            >
              <p className="font-medium">{request.sender_username}</p>
              <span className="flex gap-2">
                <button
                  onClick={() => handleAccept(request.id)}
                  className="bg-cyan-500 text-white px-3 py-2 rounded hover:bg-cyan-600 transition"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
                >
                  Reject
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
