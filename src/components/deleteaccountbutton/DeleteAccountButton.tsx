'use client'
import React from 'react'
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface ProfileProps {
    user: User;
  }

function DeleteAccountButton({ user }: ProfileProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
        
        if (confirmed) {
          try {
            setLoading(true);
            
            // Call the RESTful API endpoint with user ID
            const response = await fetch(`/api/users/${user.id}`, { 
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              console.error('Non-JSON response received:', await response.text());
              throw new Error('Server returned an invalid response format');
            }
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to delete account');
            }
            
            // Sign out after successful deletion
            await supabase.auth.signOut();
            window.location.href = '/';
          } catch (error) {
            console.error('Error deleting account:', error);
            alert(`Failed to delete your account: ${error instanceof Error ? error.message : String(error)}`);
          } finally {
            setLoading(false);
          }
        }
      };
  return (
    <button onClick={handleDeleteAccount} className="bg-red-100 text-red-700 px-3 py-1 rounded">Delete Account</button>
  )
}

export default DeleteAccountButton
