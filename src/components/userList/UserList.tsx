'use client';

import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Modal from '../modal/Modal';

interface HomePageProps {
  user: User;
}

type UsernameObject = {
  [profileId: string]: string;
};

function UserList({ user }: HomePageProps) {
  const supabase = createClient();
  const [userList, setUserList] = useState<UsernameObject | null>(null);
  const [secretMessage, setSecretMessage] = useState<string | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    profileId: string;
    username: string;
  } | null>(null);

  const handleUserClick = (profileId: string, username: string) => {
    setSelectedUser({ profileId, username });
    setSecretMessage(null); 
    setFriendshipStatus(null);
    setOpen(true);

    checkFriendshipStatus(profileId);
  };

  const checkFriendshipStatus = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .or(
          `and(user_id.eq.${user.id},friend_id.eq.${profileId}),and(user_id.eq.${profileId},friend_id.eq.${user.id})`
        );

      if (error) {
        console.error('Error checking friendship status:', error);
        return;
      }

      if (!data || data.length === 0) {
        setFriendshipStatus('not_friends');
        return;
      }

      if (data.some((friendship) => friendship.status === 'accepted')) {
        setFriendshipStatus('accepted');
      } else if (data.some((friendship) => friendship.status === 'pending')) {
        setFriendshipStatus('pending');
      } else {
        setFriendshipStatus('rejected');
      }
    } catch (err) {
      console.error('Error checking friendship:', err);
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSecretMessage(null); 
  };

  const revealSecretMessage = async () => {
    if (!selectedUser) return;
  
    setMessageLoading(true);
  
    try {
      const { data: friendship, error: friendshipError } = await supabase
        .from('friends')
        .select('status')
        .or(
          `and(user_id.eq.${user.id},friend_id.eq.${selectedUser.profileId},status.eq.accepted),and(friend_id.eq.${user.id},user_id.eq.${selectedUser.profileId},status.eq.accepted)`
        )
        .single();
  
      const areFriends = !!friendship && friendship.status === 'accepted';
  
      if (!areFriends) {
        setSecretMessage('🔒 You must be friends with this user to see their secret message.');
        return;
      }
  
      const { data, error } = await supabase
        .from('secret_messages')
        .select('message')
        .eq('profile_id', selectedUser.profileId)
        .single();
  
      if (error) {
        if (error.code === 'PGRST116') {
          setSecretMessage('User has no secret message.');
          return;
        }
        throw error;
      }
  

      if (!data?.message || data.message.trim() === '') {
        setSecretMessage('User has no secret message.');
      } else {
        setSecretMessage(data.message);
      }
    } catch (err) {
      console.error('Error fetching secret message:', err);
      setSecretMessage('Error loading secret message');
    } finally {
      setMessageLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!selectedUser) return;

    setRequestLoading(true);

    try {
      const { data: existingSentRequest, error: checkSentError } =
        await supabase
          .from('friends')
          .select('*')
          .eq('user_id', user.id)
          .eq('friend_id', selectedUser.profileId)
          .single();

      if (checkSentError && checkSentError.code !== 'PGRST116') {
        console.error('Error checking sent friend request:', checkSentError);
        return;
      }

      const { data: existingReceivedRequest, error: checkReceivedError } =
        await supabase
          .from('friends')
          .select('*')
          .eq('user_id', selectedUser.profileId)
          .eq('friend_id', user.id)
          .single();

      if (checkReceivedError && checkReceivedError.code !== 'PGRST116') {
        console.error(
          'Error checking received friend request:',
          checkReceivedError
        );
        return;
      }

      if (existingSentRequest) {
        if (existingSentRequest.status === 'rejected') {
          const { error: updateError } = await supabase
            .from('friends')
            .update({ status: 'pending' })
            .eq('id', existingSentRequest.id);

          if (updateError) {
            console.error('Error updating friend request:', updateError);
            return;
          }
        }
      }
      else if (existingReceivedRequest) {
        if (existingReceivedRequest.status === 'rejected') {
          const { error: deleteError } = await supabase
            .from('friends')
            .delete()
            .eq('id', existingReceivedRequest.id);

          if (deleteError) {
            console.error('Error deleting old friend request:', deleteError);
            return;
          }

          const { error: insertError } = await supabase.from('friends').insert({
            user_id: user.id,
            friend_id: selectedUser.profileId,
            status: 'pending',
          });

          if (insertError) {
            console.error('Error inserting new friend request:', insertError);
            return;
          }
        }
      }
      else {
        const { error: insertError } = await supabase.from('friends').insert({
          user_id: user.id,
          friend_id: selectedUser.profileId,
          status: 'pending',
        });

        if (insertError) {
          console.error('Error inserting friend request:', insertError);
          return;
        }
      }

      setFriendshipStatus('pending');
    } catch (err) {
      console.error('Error sending friend request:', err);
    } finally {
      setRequestLoading(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('profile_id, username')
          .neq('profile_id', user.id);

        if (error) throw error;

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

    // supabase realtime docs
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('Profile change received:', payload);

          if (
            payload.eventType === 'INSERT' &&
            payload.new.profile_id !== user.id
          ) {
            setUserList((prev) => ({
              ...prev,
              [payload.new.profile_id]: payload.new.username,
            }));
          }

          if (
            payload.eventType === 'UPDATE' &&
            payload.new.profile_id !== user.id
          ) {
            setUserList((prev) => ({
              ...prev,
              [payload.new.profile_id]: payload.new.username,
            }));
          }

          if (
            payload.eventType === 'DELETE' &&
            payload.old.profile_id !== user.id
          ) {
            setUserList((prev) => {
              const updated = { ...prev };
              delete updated[payload.old.profile_id];
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Profile subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  const renderFriendUi = () => {
    if (!selectedUser) return null;

    switch (friendshipStatus) {
      case 'accepted':
        return (
          <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
            You are friends with {selectedUser.username}
          </div>
        );
      case 'pending':
        return (
          <div className="mt-4 p-2 bg-yellow-100 text-yellow-700 rounded">
            Friend request pending
          </div>
        );
      case 'rejected':
      case 'not_friends':
        return (
          <button
            onClick={sendFriendRequest}
            disabled={requestLoading}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            {requestLoading ? 'Sending...' : 'Add Friend'}
          </button>
        );
      default:
        return (
          <div className="mt-4 text-gray-500">Checking friend status...</div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg p-5">
      <h2 className="font-bold text-xl mb-[25px]">User List</h2>
      {loading ? (
        <p className="text-gray-500">Loading user list...</p>
      ) : userList && Object.keys(userList).length > 0 ? (
        <ul className="list-none flex flex-col gap-2 max-w-full px-6">
          {Object.entries(userList).map(([profileId, username]) => (
            <li
              className="border-b-1 py-2 px-10 flex flex-row justify-between border-zinc-300"
              key={profileId}
            >
              <h3 className="font-semibold">{username}</h3>
              <span
                onClick={() => handleUserClick(profileId, username)}
                className="font-light underline underline-offset-2 decoration-blue-500 text-blue-500 text-sm cursor-pointer"
              >
                View details
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found.</p>
      )}
      <Modal open={open} onClose={handleCloseModal}>
        {selectedUser && (
          <>
            <h3 className="text-xl font-bold">{selectedUser.username}</h3>
            {/* Secret message section */}
            <div className="mt-2">
              <h4 className="font-medium">Secret Message</h4>
              {secretMessage ? (
                <div className="bg-gray-100 p-3 rounded mt-2">
                  <p>{secretMessage}</p>
                </div>
              ) : (
                <p
                  className="font-light underline underline-offset-2 decoration-blue-500 text-blue-500 text-sm cursor-pointer mt-2"
                  onClick={revealSecretMessage}
                >
                  {messageLoading ? 'Loading...' : 'REVEAL SECRET MESSAGE'}
                </p>
              )}
            </div>

            {/* Friendship UI */}
            {renderFriendUi()}
          </>
        )}
      </Modal>
    </div>
  );
}

export default UserList;


