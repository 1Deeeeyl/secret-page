'use client';
import React from 'react';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface ProfileProps {
  user: User;
}

function SignOutButton({ user }: ProfileProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // this prevents redirect problems (Life saver!!)
    window.location.href = '/';
  };

  return (
    <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded mr-2">Log Out</button>
);
}

export default SignOutButton;
