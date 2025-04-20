import { redirect } from 'next/navigation';
import NavBar from '@/components/navbar/NavBar';
import { createClient } from '@/utils/supabase/server';
import SecretMessage from '@/components/secret-message/SecretMessage';
import UserSecretMessage from '@/components/UserSecretMessage/UserSecretMessage';
import ChangeMessage from '@/components/changeMessage/ChangeMessage';
import UserList from '@/components/userList/UserList';
import FriendRequestList from '@/components/friendRequestList/FriendRequestList';
import type { Metadata } from 'next';
import Container from '@/components/container/Container';

export const metadata: Metadata = {
  title: 'Secret Page 3',
  description: 'Page 3 of the secret website',
};

async function Page() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect('/');
  }

  return (
    <>
      <Container>
        <section className='bg-white p-5 rounded-md  mb-[25px]'>
          <h1 className='font-bold text-5xl'>Secret Page 3</h1>
          <SecretMessage />
          <div className='w-full flex flex-col md:flex-row md:justify-between md:items-center gap-5 md:gap-0'>
            <UserSecretMessage user={user} />
            <ChangeMessage user={user} />
          </div>
        </section>
        <div className="flex flex-col gap-5 xl:flex-row">
          <section className="order-2 xl:order1 xl:w-2/4">
            <UserList user={user} />
          </section>
          <section className="order-1 xl:w-2/4 xl:order-2">
            <FriendRequestList user={user} />
          </section>
        </div>
      </Container>
    </>
  );
}

export default Page