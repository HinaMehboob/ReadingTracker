import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import Book from "@/models/Book";
import UserUser from "@/models/User"; // Actually it's probably User, let me check the existing API route to see how we import User if at all. Wait, books are tracked by user email or ID.

export async function POST(req: Request) {
  try {
    // We typecast because NextAuth has mismatch types internally
    const session = await getServerSession(authOptions) as any;
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { book } = body;

    if (!book || !book.title) {
      return NextResponse.json({ error: "Invalid book data" }, { status: 400 });
    }

    await connectDB();

    const newBook = new Book({
      userId: session.user.id,
      title: book.title,
      author: book.author,
      description: book.description,
      totalPages: book.totalPages,
      currentPage: 0,
      status: "Want to Read",
      fileUrl: book.fileUrl,
      coverImage: book.coverImage,
      genre: book.genre || [],
      notes: []
    });

    await newBook.save();

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error("Explore book clone error:", error);
    return NextResponse.json({ error: "Failed to add book to collection" }, { status: 500 });
  }
}
