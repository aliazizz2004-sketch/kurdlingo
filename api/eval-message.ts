import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
    runtime: 'edge',
};

interface EvalRequest {
    message: string;
}

export default async function handler(request: Request) {
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

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { message }: EvalRequest = await request.json();
        const apiKey = process.env.GOOGLE_AI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const models = ["gemini-3.1-flash-lite-preview", "gemini-2.5-flash-lite"];
        
        let lastError: any = null;

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: `You are an English language tutor. A student has just sent this message in an English role-playing scenario. 
                    Evaluate their English phrasing, grammar, and naturalness. 
                    Return your evaluation as a valid JSON object EXACTLY like this:
                    {"rating": 10, "correction": "Perfect!"} or {"rating": 7, "correction": "Consider saying '...' instead."}
                    Keep the correction very short (max 1 sentence). DO NOT wrap the json in markdown tags (\`\`\`), just return the raw JSON.`
                });
                
                const result = await model.generateContent(message);
                let text = result.response.text();
                // strip out markdowns just in case
                text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

                const parsed = JSON.parse(text);
                
                return new Response(JSON.stringify({
                    rating: parsed.rating,
                    correction: parsed.correction,
                    success: true
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                });
            } catch (err: any) {
                lastError = err;
            }
        }
        throw lastError;

    } catch (error: any) {
        console.error('Gemini Eval API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to process request', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
