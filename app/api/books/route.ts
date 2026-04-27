import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any;
    
    // 1. If session is missing, this returns 401
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      // 2. MUST match the new camelCase column name in Supabase
      .eq('userId', session.user.id) 
      // 3. MUST match the new camelCase column name
      .order('createdAt', { ascending: false });

    if (error) {
      // Check your VS Code terminal to see this specific error message
      console.error('Supabase GET Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. Ensure frontend gets the array it expects with spoofed readingProgress
    const formattedBooks = books?.map(b => ({ 
      ...b, 
      _id: b.id, 
      readingProgress: { currentPage: b.currentPage || 0 } 
    })) || [];

    return NextResponse.json(formattedBooks);
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any;
    
    // DEBUG LOG: Check your VS Code terminal for this!
    console.log("POST Request Session:", session);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in again' }, { status: 401 });
    }

    const body = await request.json();
    const { title, author, description, coverImage, fileUrl, totalPages, genre } = body;

    if (!title || !author || !fileUrl) {
      return NextResponse.json(
        { error: 'Title, author, and file URL are required' },
        { status: 400 }
      );
    }

    const { data: newBook, error } = await supabase
      .from('books')
      .insert([
        {
          title,
          author,
          description: description || null,
          coverImage: coverImage || null,
          fileUrl,
          totalPages: totalPages ? parseInt(totalPages.toString(), 10) : 0,
          genre: genre || [],
          status: 'to-read',
          userId: session.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase books POST error:', error);
      return NextResponse.json({ error: error.message || 'Failed to insert book' }, { status: 500 });
    }

    const formattedNewBook = { ...newBook, _id: newBook.id };
    return NextResponse.json(formattedNewBook, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/books:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}