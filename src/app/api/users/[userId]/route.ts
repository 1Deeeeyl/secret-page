// app/api/users/[userId]/route.ts
import { createClient, protect } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify the user is authenticated
    const user = await protect();
    const userId = params.userId;

    // Security check: Only allow users to delete their own account
    if (user.id !== userId) {
      return NextResponse.json(
        { message: 'Unauthorized: You can only delete your own account' },
        { status: 403 }
      );
    }
    const supabase = await createClient();
    // // 1. First delete user data from profiles table
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('profile_id', userId);

    if (profileDeleteError) {
      console.error('Error deleting profile data:', profileDeleteError);
      return NextResponse.json(
        { message: 'Failed to delete user profile data' },
        { status: 500 }
      );
    }
    // Create admin client with service role for all operations
    const supabaseAdmin = await createClient(true); // true = use service role
    // 2. Delete the user authentication data using admin API
    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      return NextResponse.json(
        { message: `Failed to delete account: ${authDeleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Account successfully deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Server error during account deletion:', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Server error during account deletion',
      },
      {
        status:
          error instanceof Error && error.message === 'Not authorized'
            ? 401
            : 500,
      }
    );
  }
}
