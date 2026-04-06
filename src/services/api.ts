/**
 * Direct Gemini API Service - no backend required
 */

const API_KEY = 'AIzaSyA7TBpXsSBczcegG6PfBR-efjD6Cwi7vVs';
const GEMINI_MODEL = 'gemini-2.5-flash';

interface ChatMessage {
    role: string;
    parts: Array<{ text: string }>;
}

async function fetchFromGemini(endpoint: string, payload: any) {
    // Attempt 1: Raw key
    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:${endpoint}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    let data = await response.json();

    // Attempt 2: Prevent missing AIzaSy problem
    if (!response.ok && response.status === 400 && data.error?.message?.includes('API key not valid')) {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:${endpoint}?key=AIzaSy${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        data = await response.json();
    }

    if (!response.ok) {
        throw new Error(data.error?.message || 'Unknown API Error: ' + JSON.stringify(data));
    }

    return data;
}


export async function sendChatMessage(message: string, systemPrompt: string, history: ChatMessage[] = []) {
    try {
        const mappedHistory = history.map(msg => ({
            role: (msg.role === 'ai' || msg.role === 'model') ? 'model' : 'user',
            parts: msg.parts
        }));

        while (mappedHistory.length > 0 && mappedHistory[0].role === 'model') {
            mappedHistory.shift();
        }

        const contents = [...mappedHistory, { role: 'user', parts: [{ text: message }] }];

        const data = await fetchFromGemini('generateContent', {
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: contents
        });

        return {
            response: data.candidates[0].content.parts[0].text,
            success: true
        };
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return { response: '', success: false, error: error.message };
    }
}

export async function evalChatMessage(message: string) {
    try {
        const prompt = `Evaluate this sentence for Kurdish grammar and vocabulary: "${message}". 
        Return ONLY valid JSON like this: {"rating": 5, "correction": "your explanation"}. If perfect, rating is 5.`;

        const data = await fetchFromGemini('generateContent', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const textResponse = data.candidates[0].content.parts[0].text;
        const cleaned = textResponse.replace(/^```json/g, '').replace(/```$/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return {
            rating: parsed.rating,
            correction: parsed.correction,
            success: true
        };
    } catch (error: any) {
        console.error('Eval API Error:', error);
        return { success: false, error: error.message };
    }
}

// Since Gemini STT requires uploading a file or sending inline data
export async function requestSTT(audioBase64: string, mimeType: string = 'audio/webm') {
    try {
        const data = await fetchFromGemini('generateContent', {
            contents: [{
                parts: [
                    { text: "Accurately transcribe this audio. Respond ONLY with the transcript without any quotes, intro, or markdown. If silence, respond with nothing." },
                    { inlineData: { mimeType: mimeType, data: audioBase64 } } // FIXED parameter payload logic!
                ]
            }]
        });

        const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return {
            transcript: transcript.trim(),
            success: !!transcript.trim()
        };
    } catch (error: any) {
        console.error('STT API Error:', error);
        return { transcript: '', success: false, error: error.message };
    }
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
export function playBase64Audio(_base64Audio: string, _mimeType: string = 'audio/mp3'): Promise<void> {
    stopBase64Audio();
    return new Promise((resolve) => resolve()); // Disable TTS for now if we don't have direct api route logic
}
export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            // ensure it's standard base64 for gemini to parse
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
export async function requestMultiTTS(_texts: string[], _options: any) { return { audioContent: '', mimeType: '', success: false }; }
export async function requestTTS(_text: string, _options: any) { return { audioContent: '', success: false }; }
export async function requestGeminiVoice(_text: string, _options: any) { return { audioContent: '', mimeType: '', success: false }; }

