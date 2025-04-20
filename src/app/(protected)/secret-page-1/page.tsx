import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import SecretMessage from '@/components/secret-message/SecretMessage';
import type { Metadata } from 'next';
import Container from '@/components/container/Container';

export const metadata: Metadata = {
  title: 'Secret Page 1',
  description: 'Page 1 of the secret website',
};

async function Page() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect('/');
  }

  return (
    <Container>
      <section className="bg-white p-5 rounded-md  mb-[25px]">
        <h1 className="font-bold text-5xl">Secret Page 1</h1>
        <SecretMessage />
      </section>
    </Container>
  );
}

export default Page