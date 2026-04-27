import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookId, currentPage, completed } = body;

    if (!bookId || currentPage === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prepare flat payload for specific Supabase schema tracking
    const updatePayload: any = {
      currentPage,
      updatedAt: new Date().toISOString()
    };

    if (completed) updatePayload.status = 'completed';

    // Update the books table flat columns
    const { data: updatedBook, error } = await supabase
      .from('books')
      .update(updatePayload)
      .eq('id', bookId)
      .eq('userId', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase Progress Update Error:', error.message);
      
      // Fallback: If "readingProgress" strict column fails due to schema migration rules, 
      // see if we can patch via a different approach or throw 500
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }

    return NextResponse.json({ currentPage, completed });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
