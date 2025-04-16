import { redirect } from 'next/navigation';
import NavBar from '@/components/navbar/NavBar';
import { createClient } from '@/utils/supabase/server';
import SecretMessage from '@/components/secret-message/SecretMessage';
import UserSecretMessage from '@/components/UserSecretMessage/UserSecretMessage';
import ChangeMessage from '@/components/changeMessage/ChangeMessage';

export default async function SecretPage2() {
  const supabase = await createClient();
  
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect('/');
  }

  return (
    <div>
      Secret Page 2
      <header className="bg-gray-100 p-4 mb-4 rounded">
        <NavBar user={user} />
      </header>
      <SecretMessage/>
      <UserSecretMessage user={user}/>
      <ChangeMessage user={user}/>
    </div>
  );
}
