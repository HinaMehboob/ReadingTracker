import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Register with Supabase native Auth (handles confirmation emails natively)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
    });

    if (error) {
      console.error('Supabase Auth error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create user in database.' },
        { status: 400 }
      );
    }

    // If email confirmation is enabled, user session won't be returned immediately
    return NextResponse.json({ 
      message: 'User created successfully. Please confirm your email.',
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
      } : null
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json(
      { error: 'Failed to finalize user registration.' },
      { status: 500 }
    );
  }
}

