import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export const dynamic = 'force-dynamic';

const voiceConfig: Record<string, { code: string; name: string }> = {
  bg: { code: 'bg-BG', name: 'bg-BG-Standard-A' },
  en: { code: 'en-US', name: 'en-US-Standard-C' },
};

export async function POST(req: NextRequest) {
  try {
    const { text, language } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required and must be non-empty' }, { status: 400 });
    }

    if (!language || !['bg', 'en'].includes(language)) {
      return NextResponse.json({ error: 'Language must be "bg" or "en"' }, { status: 400 });
    }

    const credentialsJson = process.env.GOOGLE_CLOUD_TTS_CREDENTIALS_JSON;
    if (!credentialsJson) {
      console.error('[TTS] Missing GOOGLE_CLOUD_TTS_CREDENTIALS_JSON');
      return NextResponse.json({ error: 'TTS service not configured' }, { status: 500 });
    }

    const credentials = JSON.parse(credentialsJson);
    const client = new TextToSpeechClient({ credentials });
    const voice = voiceConfig[language];

    console.log('[TTS] Synthesizing:', { text: text.substring(0, 50), language, voice: voice.name });

    const [response] = await client.synthesizeSpeech({
      input: { text: text.trim() },
      voice: { languageCode: voice.code, name: voice.name },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: 0.9,
        pitch: 0,
      },
    } as any);

    const audioContent = response.audioContent;
    if (!audioContent) {
      throw new Error('No audio content received');
    }

    const base64Audio = Buffer.from(audioContent as Uint8Array).toString('base64');
    const durationSeconds = Math.ceil(text.length / 2.5);

    console.log('[TTS] Success:', { length: text.length, duration: durationSeconds });

    return NextResponse.json({
      success: true,
      audio: `data:audio/mp3;base64,${base64Audio}`,
      duration: durationSeconds,
    });
  } catch (error: any) {
    console.error('[TTS] Error:', error.message || error);
    return NextResponse.json(
      { error: `TTS synthesis failed: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
