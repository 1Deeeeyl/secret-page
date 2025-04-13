// app/page.tsx
import { createClient } from '@/utils/supabase/server';
import HomePage from '@/components/home/Home';
import LogInPage from '@/components/login/Login';

export default async function IndexPage() {
  const supabase = await createClient();
  
  // Get the user server-side
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  // Simple conditional rendering based on authentication status
  return user ? <HomePage user={user} /> : <LogInPage />;
}