import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase.from('books').select('*').limit(1);
  const { data: rpData, error: rpError } = await supabase.from('reading_progress').select('*').limit(1);
  return NextResponse.json({ 
    booksTableError: error,
    booksColumns: data && data.length > 0 ? Object.keys(data[0]) : [],
    rpTableError: rpError,
    rpColumns: rpData && rpData.length > 0 ? Object.keys(rpData[0]) : []
  });
}
