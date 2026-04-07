import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ data: [] });
}

export async function POST() {
  return NextResponse.json({ message: 'Supabase backend not attached yet' }, { status: 501 });
}

export async function PUT() {
  return NextResponse.json({ message: 'Supabase backend not attached yet' }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Supabase backend not attached yet' }, { status: 501 });
}
