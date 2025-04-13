import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

export default async function PrivatePage() {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    redirect('/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username')
    .eq('profile_id', authData.user.id)
    .single();

  console.log('authData.user.id:', authData.user.id);
  console.log('Profile:', profile);
  console.log('Profile error:', profileError);

  const username = profile?.username;

  console.log(profile);
  return <p>Hello boss mali page mo</p>;
}
