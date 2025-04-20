import type { Metadata } from 'next';
import '../globals.css';
import NavBar from '@/components/navbar/NavBar';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';



export const metadata: Metadata = {
  title: 'Secret Page',
  description: 'A secret page project',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect('/');
  }
  return (
    <>
      <header className="bg-white p-5 mb-[25px] box-border">
        <NavBar user={user} />
      </header>
      <main>{children}</main>
    </>
  );
}
