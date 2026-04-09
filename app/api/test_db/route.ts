import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@gmail.com',
    password: 'password123',
    options: {
      data: {
        name: 'Test'
      }
    }
  });

  return NextResponse.json({ 
    data,
    error
  });
}
