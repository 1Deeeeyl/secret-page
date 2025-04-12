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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'http://localhost:3000/verify-email',
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        setError('Sign up failed.');
        setLoading(false);
        return;
      }

      await supabase.auth.signInWithPassword({ email, password });


      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          username,
        },
      ]);

      const { data: existingUsers, error: usernameError } = await supabase
        .from('profiles')
        .select('*')
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

      if (profileError) {
        setError(profileError.message);
      } else {
        router.push('/verify-email?from=signup');
      }
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
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {error && <div>{error}</div>}
    </div>
  );
};

export default SignUpPage;
