import { requestSTT, blobToBase64 } from '../services/api';

export const transcribeWithGemini = async (audioBlob: Blob): Promise<string> => {
    try {
        const base64 = await blobToBase64(audioBlob);
        // Use webm for browser media recorder compatibility with Gemini
        const result = await requestSTT(base64, 'audio/webm');
        if (result.success) {
            return result.transcript;
        }
        throw new Error(result.error || "Unknown STT Error");
    } catch (e: any) {
        console.error("Gemini Transcription Error:", e);
        throw new Error(e.message || "Gemini direct API failed");
    }
};
