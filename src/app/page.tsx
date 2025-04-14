// app/page.tsx
import { createClient } from '@/utils/supabase/server';
import HomePage from '@/components/home/Home';
import LogInPage from '@/components/login/Login';

export default async function IndexPage() {
  const supabase = await createClient();
  
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return user ? <HomePage user={user} /> : <LogInPage />;
}