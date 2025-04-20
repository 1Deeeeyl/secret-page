import { createClient, protect } from '@/utils/supabase/server';
// import { NextResponse } from 'next/server';

async function handleDelete(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await protect();
    const { userId } = await params;

    if (user.id !== userId) {
      throw 'You can only delete your own account';
    }

    const supabase = await createClient(); //No argument uses anon key

    // Delete in friends table
    const { error: friendsDeleteError } = await supabase
      .from('friends')
      .delete()
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    // Delete in secret_messages table
    const { error: secretMessagesDeleteError } = await supabase
      .from('secret_messages')
      .delete()
      .eq('profile_id', userId);

      // Delete in profiles table
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('profile_id', userId);

    if (profileDeleteError || secretMessagesDeleteError || friendsDeleteError) {
      console.error(
        'Error deleting profile data:',
        profileDeleteError || secretMessagesDeleteError || friendsDeleteError
      );
      throw 'You can only delete your own account';
    }

    // Service role key for admin level data manipulation
    const supabaseAdmin = await createClient(true); // true = use service role key api
    
    // Delete the user root data
    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error('Error deleting user:', authDeleteError);
      return 
    }

    return 
  } catch (error) {
    console.error('Error during account deletion:', error);
    return 
  }
  
}

export {handleDelete}