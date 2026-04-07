import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Next.js 15+ requires awaiting route params
    const resolvedParams = await params;
    const bookId = resolvedParams.id;
    
    // Verify ownership and existence
    const { data: existingBook } = await supabase
      .from('books')
      .select('userId')
      .eq('id', bookId)
      .single();

    if (!existingBook || existingBook.userId !== session.user.id) {
      return NextResponse.json({ error: 'Book not found or unauthorized' }, { status: 404 });
    }

    // Delete the book record from Supabase
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)
      .eq('userId', session.user.id);

    if (error) {
      console.error('Supabase Delete Error:', error.message);
      return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Next.js 15+ requires awaiting route params
    const resolvedParams = await params;
    const bookId = resolvedParams.id;
    
    const body = await request.json();
    const { status } = body;

    // Update the book's status in Supabase
    const { data: updatedBook, error } = await supabase
      .from('books')
      .update({ status, updatedAt: new Date().toISOString() })
      .eq('id', bookId)
      .eq('userId', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase Update Error:', error.message);
      return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
    }

    // Map id back to _id for frontend compatibility
    return NextResponse.json({ ...updatedBook, ...{ _id: updatedBook.id } });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Next.js 15+ requires awaiting route params
    const resolvedParams = await params;
    const bookId = resolvedParams.id;

    const { data: book, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('userId', session.user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ ...book, ...{ _id: book.id } });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
