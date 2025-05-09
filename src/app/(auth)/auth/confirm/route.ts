import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error && data.user) {
      await supabase.from('profiles').insert([
        {
          profile_id: data.user.id,
          username: data.user.user_metadata?.username,
        },
      ]);

      return Response.redirect(new URL('/', request.url));
    }
  }

  return Response.redirect(new URL('/error', request.url));
}
