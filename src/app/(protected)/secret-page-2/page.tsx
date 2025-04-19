import { redirect } from 'next/navigation';
import NavBar from '@/components/navbar/NavBar';
import { createClient } from '@/utils/supabase/server';
import SecretMessage from '@/components/secret-message/SecretMessage';
import UserSecretMessage from '@/components/UserSecretMessage/UserSecretMessage';
import ChangeMessage from '@/components/changeMessage/ChangeMessage';
import type { Metadata } from 'next';
import Container from '@/components/container/Container';

export const metadata: Metadata = {
  title: 'Secret Page 2',
  description: 'Page 2 of the secret website',
};

export default async function SecretPage2() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect('/');
  }

  return (
    <Container>
      <section className="bg-white p-5 rounded-md  mb-[25px]">
        <h1 className="font-bold text-5xl">Secret Page 2</h1>
        <SecretMessage />
        <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-5 md:gap-0">
          <UserSecretMessage user={user} />
          <ChangeMessage user={user} />
        </div>
      </section>
    </Container>
  );
}
