import Link from 'next/link';
import DeleteAccountButton from '../deleteaccountbutton/DeleteAccountButton';
import SignOutButton from '../signoutbutton/SignOutButton';
import { User } from '@supabase/supabase-js';


interface ProfileProps {
  user: User;
}

function NavBar({ user }: ProfileProps) {
  return (
    <nav className="flex justify-between items-center">
      <div>
        <Link href="/" className="mr-4">
          Home
        </Link>
        <Link href="/secret-page-1" className="mr-4">
          Secret Page 1
        </Link>
        <Link href="/secret-page-2" className="mr-4">
          Secret Page 2
        </Link>
        <Link href="/secret-page-3" className="mr-4">
          Secret Page 3
        </Link>
      </div>
      <div>
        <SignOutButton user={user} />
        <DeleteAccountButton user={user} />
      </div>
    </nav>
  );
}

export default NavBar;
