import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build message history for Claude
    const messages = (history || [])
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }))
      .concat([
        {
          role: 'user',
          content: message,
        },
      ]);

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      system: `Du bist ein unterstützender Quitter-Buddy - ein einfühlsamer Coach und Ärztlicher Berater in einer Person. Deine Rolle:

1. **Emotionale Unterstützung**: Sei verständnisvoll, ermutigung, niemals wertend
2. **Praktische Tipps**: Gib konkrete Strategien gegen Cravings (z.B. Atemübungen, Ablenkung, Bewegung)
3. **Medizinische Fakten**: Teile Informationen über Rauchentzug, gesundheitliche Vorteile, Dauer von Entzugssymptomen
4. **Motivation**: Feiere kleine Siege, erinnere an Gründen zu rauchen
5. **Grenzen**: Wenn medizinisch kritisch, empfehle einen echten Arzt zu kontaktieren

Sprache: Deutsch, locker aber respektvoll, kurz & prägnant (1-2 Absätze max).
Nutze gelegentlich Emojis für Wärme.
NIEMALS: Urteile nicht, mach dich nicht über Rückfälle lustig, sei kein Drill Sergeant.`,
      messages,
    });

    const reply =
      response.content[0].type === 'text'
        ? response.content[0].text
        : 'Fehler bei der Antwort';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
