// Vercel Serverless Function - API Key is secure on server side
import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
    runtime: 'edge',
};

interface ChatRequest {
    message: string;
    systemPrompt: string;
    history?: Array<{ role: string; parts: Array<{ text: string }> }>;
}

export default async function handler(request: Request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { message, systemPrompt, history = [] }: ChatRequest = await request.json();

        // API key is stored securely in environment variables on the server
        const apiKey = process.env.GOOGLE_AI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Model fallback chain: primary -> secondary
        const models = [
            "gemini-3.1-flash-lite-preview",  // Primary
            "gemini-2.5-flash-lite",           // Secondary fallback
        ];

        let lastError: any = null;

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: systemPrompt
                });

                const chat = model.startChat({
                    history,
                    generationConfig: {
                        maxOutputTokens: 1000,
                    },
                });
                const result = await chat.sendMessage(message);
                const responseText = result.response.text();

                return new Response(JSON.stringify({
                    response: responseText,
                    success: true
                }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            } catch (modelError: any) {
                console.warn(`Model ${modelName} failed:`, modelError.message);
                lastError = modelError;
                // Continue to next model in the fallback chain
            }
        }

        // All models failed
        throw lastError;

    } catch (error: any) {
        console.error('Gemini API Error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to process request',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
