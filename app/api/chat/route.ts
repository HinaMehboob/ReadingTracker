import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const systemMessage = {
      role: 'system',
      content: "You are an intelligent Reading Assistant embedded inside a sleek book tracking web app. Users will ask you for word definitions, paragraph summaries, and text explanations. Keep your answers concise, helpful, and friendly. Use short paragraphs and bold text for readability."
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API Error:", data);
      return NextResponse.json({ error: data.error?.message || 'Failed to communicate with AI provider' }, { status: response.status });
    }

    const aiMessage = data.choices?.[0]?.message?.content;
    
    if (!aiMessage) {
        throw new Error("No text returned from Groq");
    }

    return NextResponse.json({ 
      role: 'assistant', 
      content: aiMessage 
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
