/**
 * API Service - Routes all requests through Vercel serverless functions
 * API keys are kept secure on the server side, never exposed to the client.
 */

interface ChatMessage {
    role: string;
    parts: Array<{ text: string }>;
}

interface ChatResponse {
    response: string;
    success: boolean;
    error?: string;
}

interface TTSResponse {
    audioContent: string;
    success: boolean;
    error?: string;
}

interface GeminiVoiceResponse {
    audioContent: string;
    mimeType: string;
    success: boolean;
    error?: string;
}

interface STTResponse {
    transcript: string;
    success: boolean;
    error?: string;
}

/**
 * Send a chat message through the secure server-side API proxy
 */
export async function sendChatMessage(
    message: string,
    systemPrompt: string,
    history: ChatMessage[] = []
): Promise<ChatResponse> {
    try {
        // Filter out leading model messages - Gemini requires first message to be 'user'
        const mappedHistory = history.map(msg => ({
            role: (msg.role === 'ai' || msg.role === 'model') ? 'model' : 'user',
            parts: msg.parts
        }));
        // Remove leading model messages
        while (mappedHistory.length > 0 && mappedHistory[0].role === 'model') {
            mappedHistory.shift();
        }

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                systemPrompt,
                history: mappedHistory
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.details || 'Chat request failed');
        }

        return {
            response: data.response,
            success: true
        };
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return {
            response: '',
            success: false,
            error: error.message || 'Failed to generate response'
        };
    }
}

/**
 * Request Google Cloud text-to-speech through the secure API proxy
 */
export async function requestTTS(
    text: string,
    options: {
        languageCode?: string;
        voiceName?: string;
        ssmlGender?: string;
    } = {}
): Promise<TTSResponse> {
    try {
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                languageCode: options.languageCode || 'en-US',
                voiceName: options.voiceName || 'en-US-Studio-O',
                ssmlGender: options.ssmlGender || 'FEMALE'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'TTS request failed');
        }

        return {
            audioContent: data.audioContent,
            success: true
        };
    } catch (error: any) {
        console.error('TTS API Error:', error);
        return {
            audioContent: '',
            success: false,
            error: error.message
        };
    }
}

/**
 * Request Gemini Voice TTS through the secure API proxy
 * Uses Gemini's native voice generation capabilities
 */
export async function requestGeminiVoice(
    text: string,
    voice?: {
        aiName: string;
        gender: string;
        tone: string;
    }
): Promise<GeminiVoiceResponse> {
    try {
        const response = await fetch('/api/gemini-voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Gemini Voice request failed');
        }

        return {
            audioContent: data.audioContent,
            mimeType: data.mimeType || 'audio/wav',
            success: true
        };
    } catch (error: any) {
        console.error('Gemini Voice API Error:', error);
        return {
            audioContent: '',
            mimeType: '',
            success: false,
            error: error.message
        };
    }
}

/**
 * Request speech-to-text transcription through the secure API proxy
 */
export async function requestSTT(
    audioBase64: string,
    mimeType: string = 'audio/wav'
): Promise<STTResponse> {
    try {
        const response = await fetch('/api/stt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64, mimeType })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'STT request failed');
        }

        return {
            transcript: data.transcript,
            success: true
        };
    } catch (error: any) {
        console.error('STT API Error:', error);
        return {
            transcript: '',
            success: false,
            error: error.message
        };
    }
}

/**
 * Convert raw PCM base64 data to a WAV blob
 * Gemini TTS returns raw s16le PCM at 24kHz mono
 */
function pcmToWavBlob(base64Pcm: string, sampleRate: number = 24000, numChannels: number = 1, bitsPerSample: number = 16): Blob {
    const binaryStr = atob(base64Pcm);
    const pcmBytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        pcmBytes[i] = binaryStr.charCodeAt(i);
    }

    const dataLength = pcmBytes.length;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const headerSize = 44;
    const buffer = new ArrayBuffer(headerSize + dataLength);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // chunk size
    view.setUint16(20, 1, true);  // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    // Copy PCM data
    new Uint8Array(buffer, headerSize).set(pcmBytes);

    return new Blob([buffer], { type: 'audio/wav' });
}

let currentAudio: HTMLAudioElement | null = null;
let currentResolve: (() => void) | null = null;

export function stopBase64Audio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    if (currentResolve) {
        currentResolve();
        currentResolve = null;
    }
}

/**
 * Play audio from base64 string
 * Handles raw PCM from Gemini TTS by converting to WAV
 */
export function playBase64Audio(base64Audio: string, mimeType: string = 'audio/mp3'): Promise<void> {
    stopBase64Audio();
    return new Promise((resolve, reject) => {
        currentResolve = resolve;
        try {
            let audioUrl: string;

            // Gemini TTS returns raw PCM data - convert to WAV for browser playback
            if (mimeType === 'audio/L16' || mimeType === 'audio/pcm' || mimeType.includes('raw')) {
                const wavBlob = pcmToWavBlob(base64Audio);
                audioUrl = URL.createObjectURL(wavBlob);
            } else {
                // Try WAV conversion as default for Gemini TTS responses
                // since the mimeType may not always accurately indicate raw PCM
                try {
                    const wavBlob = pcmToWavBlob(base64Audio);
                    audioUrl = URL.createObjectURL(wavBlob);
                } catch {
                    audioUrl = `data:${mimeType};base64,${base64Audio}`;
                }
            }

            const audio = new Audio(audioUrl);
            currentAudio = audio;

            audio.onended = () => {
                if (audioUrl.startsWith('blob:')) URL.revokeObjectURL(audioUrl);
                if (currentAudio === audio) {
                    currentAudio = null;
                    currentResolve = null;
                }
                resolve();
            };
            audio.onerror = (e) => {
                // If WAV conversion failed to play, try direct data URI as fallback
                if (audioUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(audioUrl);
                    const fallbackAudio = new Audio(`data:${mimeType};base64,${base64Audio}`);
                    currentAudio = fallbackAudio;
                    fallbackAudio.onended = () => {
                        if (currentAudio === fallbackAudio) {
                            currentAudio = null;
                            currentResolve = null;
                        }
                        resolve();
                    };
                    fallbackAudio.onerror = (e2) => reject(e2);
                    fallbackAudio.play().catch(reject);
                } else {
                    reject(e);
                }
            };
            audio.play().catch(reject);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Convert blob to base64 string
 */
export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
