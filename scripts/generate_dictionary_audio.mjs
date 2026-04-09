import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace this with your valid API key or set it in your environment
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAg-g9Y80yXjjUp0zE_L5wvLbTD88ZMLf4";
const WS_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

// We will use Charon, which is a deep male voice.
const VOICE_NAME = "Charon"; 
const MODEL = "models/gemini-2.5-flash-native-audio-latest";

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function generateAudioForPhrase(id, phrase) {
    return new Promise((resolve) => {
        const ws = new WebSocket(WS_URL);

        let audioReceived = false;
        let audioBuffer = Buffer.alloc(0);

        ws.onopen = () => {
            console.log(`[WS] Opened connection for ${id}`);
            const setupMessage = {
                setup: {
                    model: MODEL,
                    generationConfig: {
                        responseModalities: ["AUDIO"],
                        speechConfig: {
                            voiceConfig: {
                                prebuiltVoiceConfig: {
                                    voiceName: VOICE_NAME
                                }
                            }
                        }
                    }
                }
            };
            ws.send(JSON.stringify(setupMessage));
        };

        ws.onclose = (event) => {
            console.log(`[WS] Closed connection for ${id} - code: ${event.code}`);
            resolve(false);
        };

        ws.onmessage = async (event) => {
            let msg;
            try {
                let data = event.data;
                if (data instanceof Blob) data = await data.text();
                else if (data instanceof ArrayBuffer) data = Buffer.from(data).toString('utf-8');
                msg = JSON.parse(data.toString());
            } catch (e) { return; }

            if (msg.setupComplete) {
                console.log(`[WS] Setup complete for ${id}, sending prompt...`);
                // Instruction for clear, normal speed reading
                const prompt = `Please read the following phrase clearly and at a normal speed for a language learner. Here is the phrase: "${phrase}"`;
                const clientContent = {
                    clientContent: {
                        turns: [{ role: "user", parts: [{ text: prompt }] }],
                        turnComplete: true
                    }
                };
                ws.send(JSON.stringify(clientContent));
            } else if (msg.serverContent) {
                const parts = msg.serverContent.modelTurn?.parts || [];
                for (const part of parts) {
                    if (part.inlineData) {
                        const buffer = Buffer.from(part.inlineData.data, 'base64');
                        audioBuffer = Buffer.concat([audioBuffer, buffer]);
                        audioReceived = true;
                    }
                }
                if (msg.serverContent.turnComplete) {
                    if (audioReceived) {
                        try {
                            // Prepend 400ms of strict silence (400ms * 24000hz * 2 bytes = 19200 bytes)
                            // This ensures the browser doesn't cut off the very first word.
                            const silence = Buffer.alloc(19200);
                            audioBuffer = Buffer.concat([silence, audioBuffer]);

                            const header = Buffer.alloc(44);
                            header.write('RIFF', 0);
                            header.writeUInt32LE(36 + audioBuffer.length, 4);
                            header.write('WAVE', 8);
                            header.write('fmt ', 12);
                            header.writeUInt32LE(16, 16); 
                            header.writeUInt16LE(1, 20); 
                            header.writeUInt16LE(1, 22);
                            header.writeUInt32LE(24000, 24);
                            header.writeUInt32LE(48000, 28);
                            header.writeUInt16LE(2, 32);
                            header.writeUInt16LE(16, 34);
                            header.write('data', 36);
                            header.writeUInt32LE(audioBuffer.length, 40);
                            
                            const finalWavBuffer = Buffer.concat([header, audioBuffer]);
                            const outDir = path.join(__dirname, '..', 'public', 'audio', 'dictionary');
                            if (!fs.existsSync(outDir)) {
                                fs.mkdirSync(outDir, { recursive: true });
                            }
                            const filePath = path.join(outDir, `${id}.wav`);
                            fs.writeFileSync(filePath, finalWavBuffer);
                            console.log(`[SUCCESS] Generated audio for ${id}: ${phrase}`);
                        } catch (e) {
                            console.error(`[ERROR] Saving WAV for ${id}:`, e);
                        }
                    } else {
                        console.log(`[WARNING] No audio received for ${id}`);
                    }
                    ws.close();
                    resolve(true); // completed
                }
            } else if (msg.error) {
                console.error(`[API ERROR for ${id}]:`, msg.error.message || msg.error);
                ws.close();
                resolve(false); // error
            }
        };

        ws.onerror = (err) => {
            console.error(`[WS ERROR for ${id}]:`, err.message || err);
            resolve(false);
        };
    });
}

async function run() {
    const dictDir = path.join(__dirname, '..', 'src', 'data', 'dictionary');
    const outDir = path.join(__dirname, '..', 'public', 'audio', 'dictionary');
    if (!fs.existsSync(dictDir)) {
        console.error("Could not find dictionary folder at:", dictDir);
        process.exit(1);
    }

    const files = fs.readdirSync(dictDir).filter(f => f.endsWith('.ts'));
    let totalEntries = [];

    // Extract entries from all files
    for (const file of files) {
        const filePath = path.join(dictDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const regex = /id:\s*['"]([^'"]+)['"],\s*english:\s*['"]([^'"]+)['"]/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            totalEntries.push({ id: match[1], phrase: match[2], file });
        }
    }

    console.log(`Found ${totalEntries.length} dictionary entries across ${files.length} files.`);
    console.log(`Beginning audio generation across all categories using WebSocket...`);

    // Generate voices carefully to respect free tier limits (around 3.5 per min)
    for (const entry of totalEntries) {
        const filePath = path.join(outDir, `${entry.id}.wav`);
        if (fs.existsSync(filePath)) {
            console.log(`[SKIPPING] Audio for ${entry.id} already exists.`);
            continue;
        }

        console.log(`\n[${entry.file}] Generating audio for ${entry.id}...`);
        await generateAudioForPhrase(entry.id, entry.phrase);
        
        console.log(`Waiting 16 seconds to respect rate limits...`);
        await delay(16000); 
    }
    
    console.log("All audio generation requests completed!");
}

run();
