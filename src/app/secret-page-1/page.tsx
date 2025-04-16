import { redirect } from 'next/navigation';
import NavBar from '@/components/navbar/NavBar';
import { createClient } from '@/utils/supabase/server';
import SecretMessage from '@/components/secret-message/SecretMessage';
import UserSecretMessage from '@/components/UserSecretMessage/UserSecretMessage';

export default async function SecretPage1() {
  const supabase = await createClient();
    
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
  
    if (!user) {
      redirect('/');
    }
  
  return (
    <div>
      Secret Page 1
      <header className="bg-gray-100 p-4 mb-4 rounded">
        <NavBar user={user} />
      </header>
      <SecretMessage/>
      <UserSecretMessage user={user}/>

    </div>
  )
}

