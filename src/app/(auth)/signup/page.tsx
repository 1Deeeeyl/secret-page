'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      // First check if username is already taken
      const { data: existingUsers, error: usernameError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);
  
      if (usernameError) {
        setError('Something went wrong while checking the username.');
        setLoading(false);
        return;
      }
  
      if (existingUsers && existingUsers.length > 0) {
        setError('Username is already taken.');
        setLoading(false);
        return;
      }
  
      // Then proceed with signup
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/confirm?next=/private',
          data: {
            username: username, // Store username in user metadata
          }
        },
      });
  
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
  
      if (!data.user) {
        setError('Sign up failed.');
        setLoading(false);
        return;
      }
  
      // User created successfully, redirect to verify email page
      router.push('/verify-email?from=signup');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSignUp}>
        <div>
          <input
            className="border-2"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>
        <div>
          <input
            className="border-2"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <div>
          <input
            className="border-2"
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      {error && <div>{error}</div>}
    </div>
  );
};

export default SignUpPage;
