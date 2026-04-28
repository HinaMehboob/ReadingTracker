import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions) as any;
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { book } = body;

    if (!book || !book.title) {
      return NextResponse.json({ error: "Invalid book data" }, { status: 400 });
    }

    const { data: newBook, error } = await supabase
      .from('books')
      .insert([
        {
          title: book.title,
          author: book.author,
          description: book.description || null,
          coverImage: book.coverImage || null,
          fileUrl: book.fileUrl,
          totalPages: book.totalPages || 0,
          genre: book.genre || [],
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
    console.error("Explore book clone error:", error);
    return NextResponse.json({ error: "Failed to add book to collection" }, { status: 500 });
  }
}
