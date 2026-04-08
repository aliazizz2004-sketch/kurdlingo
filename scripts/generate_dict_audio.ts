import fs from 'fs';
import path from 'path';
import { bookDictionaryData } from '../src/data/bookDictionaryData';

const API_KEY = "AIzaSyC0w0EluPaOMXOai6ohj5VJYi717n_zj90";
const MODEL = "gemini-2.5-flash-native-audio-latest";
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'audio', 'dictionary');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateAudio(text: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(`wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`);
        
        let audioReceived = false;
        let audioBuffer = Buffer.alloc(0);

        ws.onopen = () => {
            const setupMessage = {
                setup: {
                    model: `models/${MODEL}`,
                    generationConfig: {
                        responseModalities: ["AUDIO"],
                        speechConfig: {
                            voiceConfig: {
                                prebuiltVoiceConfig: {
                                    voiceName: "Charon"
                                }
                            }
                        }
                    }
                }
            };
            ws.send(JSON.stringify(setupMessage));
        };

        ws.onmessage = async (event) => {
            let msg;
            try {
                let data = event.data;
                if (data instanceof Blob) data = await data.text();
                else if (data instanceof ArrayBuffer) data = Buffer.from(data).toString('utf-8');
                msg = JSON.parse(data.toString());
            } catch (e) {
                return;
            }

            if (msg.setupComplete) {
                const prompt = `Read this English phrase fluidly and continuously. Speak at exactly 80% natural conversational speed (a bit noticeably slower than normal, but not broken word-by-word) so a language learner can easily follow along. Phrase: "${text}"`;
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
                            const silenceBuffer = Buffer.alloc(24000); // 0.5 seconds of absolute silence (24000 Hz * 2 bytes * 0.5)
                            const paddedAudio = Buffer.concat([silenceBuffer, audioBuffer]);

                            const numChannels = 1;
                            const sampleRate = 24000;
                            const bytesPerSample = 2; // 16-bit
                            const blockAlign = numChannels * bytesPerSample;
                            const byteRate = sampleRate * blockAlign;
                            const dataSize = paddedAudio.length;

                            const header = Buffer.alloc(44);
                            header.write('RIFF', 0);
                            header.writeUInt32LE(36 + dataSize, 4);
                            header.write('WAVE', 8);
                            header.write('fmt ', 12);
                            header.writeUInt32LE(16, 16); 
                            header.writeUInt16LE(1, 20); 
                            header.writeUInt16LE(numChannels, 22);
                            header.writeUInt32LE(sampleRate, 24);
                            header.writeUInt32LE(byteRate, 28);
                            header.writeUInt16LE(blockAlign, 32);
                            header.writeUInt16LE(bytesPerSample * 8, 34);
                            header.write('data', 36);
                            header.writeUInt32LE(dataSize, 40);

                            const finalWavBuffer = Buffer.concat([header, paddedAudio]);
                            
                            const outPath = path.join(OUTPUT_DIR, `${id}.wav`);
                            fs.writeFileSync(outPath, finalWavBuffer);
                            console.log(`Saved native audio for [${id}] - "${text}"`);
                        } catch (err) {
                            console.log(`Failed to process header for [${id}]`);
                        }
                        ws.close();
                        resolve();
                    } else {
                        console.log(`Failed to receive audio for [${id}]`);
                        ws.close();
                        reject(new Error("No audio returned."));
                    }
                }
            } else if (msg.error) {
                ws.close();
                reject(new Error(msg.error.message || "Unknown API error"));
            }
        };

        ws.onerror = (err) => {
            reject(err);
        };
        
        ws.onclose = () => {
             // Handle early closes
        };
    });
}

async function main() {
    let allEntries = [];
    for (const cat of bookDictionaryData) {
        for (const entry of cat.entries) {
            allEntries.push(entry);
        }
    }

    console.log(`Total entries: ${allEntries.length}. Generating 5 per minute...`);

    let index = 0;
    while (index < allEntries.length) {
        const batch = allEntries.slice(index, index + 5);
        console.log(`\nProcessing batch ${index/5 + 1} of ${Math.ceil(allEntries.length/5)}...`);
        
        let processedAny = false;
        for (const entry of batch) {
            const outPath = path.join(OUTPUT_DIR, `${entry.id}.wav`);
            if (fs.existsSync(outPath)) {
                console.log(`Skipping [${entry.id}] (${entry.english}), already exists.`);
                continue;
            }
            try {
                await generateAudio(entry.english, entry.id);
                processedAny = true;
            } catch (err: any) {
                console.error(`Error with [${entry.id}]:`, err.message || err);
            }
        }

        index += 5;
        if (index < allEntries.length && processedAny) {
            console.log("Waiting 60 seconds to respect rate limits...");
            await new Promise(r => setTimeout(r, 60000));
        } else if (!processedAny) {
            console.log("No new audio generated in this batch, moving right to the next...");
        }
    }
    
    console.log("All audio generation complete!");
}

main().catch(console.error);
