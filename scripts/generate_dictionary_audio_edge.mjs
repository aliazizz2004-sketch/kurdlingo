import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EdgeTTS } from 'node-edge-tts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tts = new EdgeTTS({
    voice: 'en-US-ChristopherNeural',
    lang: 'en-US',
    outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
});

const dictDir = path.join(__dirname, '../src/data/dictionary');
const outputDir = path.join(__dirname, '../public/audio/dictionary');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Ensure rate limiting (Microsoft Edge TTS is robust, but adding a delay is safe)
const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function getDictionaryEntries() {
    const files = fs.readdirSync(dictDir).filter(f => f.endsWith('.ts'));
    let allEntries = [];

    for (const file of files) {
        const filePath = path.join(dictDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        const regex = /id:\s*['"]([^'"]+)['"],\s*english:\s*['"]([^'"]+)['"]/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            allEntries.push({ id: match[1], english: match[2], file });
        }
    }
    return allEntries;
}

async function run() {
    console.log("Parsing dictionary files...");
    const entries = await getDictionaryEntries();
    console.log(`Found ${entries.length} dictionary entries.`);

    console.log("Beginning audio generation across all categories using Edge TTS...");

    for (const entry of entries) {
        const wavPath = path.join(outputDir, `${entry.id}.wav`);
        const mp3Path = path.join(outputDir, `${entry.id}.mp3`);
        
        if (fs.existsSync(wavPath) || fs.existsSync(mp3Path)) {
            console.log(`[SKIPPING] Audio for ${entry.id} already exists.`);
            continue;
        }

        console.log(`[${entry.file}] Generating MP3 audio for ${entry.id}...`);
        
        try {
            await tts.ttsPromise(entry.english, mp3Path);
            console.log(`[SUCCESS] Generated audio for ${entry.id}: ${entry.english}`);
        } catch (error) {
            console.error(`[ERROR] Failed to generate audio for ${entry.id}:`, error);
        }

        // Wait a short time to avoid slamming the MS Edge endpoint
        await delay(1000); 
    }

    console.log("Generation complete!");
}

run().catch(console.error);
