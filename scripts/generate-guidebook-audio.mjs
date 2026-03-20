/**
 * Guidebook TTS Generator
 * ========================
 * Pre-generates Gemini TTS audio for all guidebook sections.
 * Audio files are saved to public/audio/guidebook/ and served statically.
 *
 * Usage: node scripts/generate-guidebook-audio.mjs [unit-id]
 * Example: node scripts/generate-guidebook-audio.mjs unit-1
 *          node scripts/generate-guidebook-audio.mjs all
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'public', 'audio', 'guidebook');

// ── Vercel production API endpoint (uses your secure GOOGLE_AI_API_KEY)
const API_BASE = 'https://kurdlingo.vercel.app';

// Delay between API calls to avoid hitting rate limits
const DELAY_MS = 8000;

// ─────────────────────────────────────────────
// Unit 1 Guidebook Text Extraction
// ─────────────────────────────────────────────
const unit1Sections = [
    {
        id: 'intro',
        text: `Welcome to Unit 1! In this unit you will learn greetings, how to introduce yourself, and basic vocabulary. The goal is to be able to hold a simple conversation in English.`
    },
    {
        id: 'grammar-sentence-structure',
        text: `Let's talk about sentence structure. In English, the order is Subject, then Verb, then Object. For example: "I drink water." This is different from Kurdish where the verb comes at the end. In English, the verb always comes right after the subject.`
    },
    {
        id: 'grammar-pronouns',
        text: `Pronouns are very important in English. The basic pronouns are: I, You, He, She, We, and They. Unlike Kurdish, English requires you to always include the pronoun — you cannot drop it from a sentence.`
    },
    {
        id: 'grammar-tobe',
        text: `The verb "to be" is the most important verb in English. It changes depending on the pronoun. We say: I am, You are, He is, She is, We are, They are. Practice these until they feel natural.`
    },
    {
        id: 'pronunciation-th',
        text: `English has some sounds that are new for Kurdish speakers. The "TH" sound in words like "the" or "this" requires you to place your tongue between your teeth and push air out. The "TH" in "think" or "three" is similar but without your voice. Practice by saying "the, this, that, think, three."`,
    },
    {
        id: 'pronunciation-w-r',
        text: `The letter W in English is pronounced like the Kurdish "wa" sound — round your lips and push air forward. The letter R is softer in English than in Kurdish. Your tongue does not touch the roof of your mouth. Try saying: run, river, right.`
    },
    {
        id: 'culture-greetings',
        text: `In English-speaking countries, greetings are very common. "Hello" is formal, while "Hi" is casual and used between friends. A wave — moving your hand — is the most common greeting gesture. Always smile when you greet someone, it shows friendliness.`
    },
    {
        id: 'vocabulary-basics',
        text: `Let us learn some essential basic vocabulary. Water. Bread. Apple. Milk. Tea. Coffee. Man. Woman. Boy. Girl. Yes. No. Practice these words every day and try to use them in simple sentences like: "I drink water" or "I eat bread."`
    },
    {
        id: 'numbers-1-10',
        text: `Numbers are essential for daily life. Let us count from one to ten: One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten. Practice counting every day until these feel automatic.`
    },
    {
        id: 'greetings-dialogue',
        text: `Here is a sample conversation for meeting someone new. Person A says: "Hello! What is your name?" Person B replies: "Hi! My name is Sara." Person A says: "Nice to meet you!" And Person B replies: "Nice to meet you too!" Try practicing this dialogue with a friend.`
    },
    {
        id: 'formality-levels',
        text: `English has different levels of formality when greeting people. "Hey" is very casual, used only with close friends. "Hi" is casual and friendly. "Hello" is more formal and polite. Always use "Hello" when meeting someone for the first time or in a professional setting.`
    },
    {
        id: 'colors',
        text: `Let us learn the basic colors in English: Red, Blue, Green, Yellow, Black, White. You can practice by pointing at objects around you and saying their color in English.`
    },
    {
        id: 'common-verbs',
        text: `Here are the most important verbs to get started: Go, Come, Eat, Drink, Sleep, See, Speak, Write. These action words are the building blocks of English sentences. Try making a sentence with each one.`
    },
    {
        id: 'key-phrases',
        text: `Before we finish Unit 1, let us review some key phrases. "Hello" — greeting someone. "My name is..." — introducing yourself. "How are you?" — asking about someone's wellbeing. "I am fine, thank you" — responding politely. "Nice to meet you" — when meeting someone for the first time. Practice these phrases every day!`
    }
];

// ─────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function stripEmoji(text) {
    // Remove emoji characters for cleaner TTS input
    return text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
}

async function generateAudio(text, outputPath) {
    const cleanText = stripEmoji(text);

    console.log(`\n🎙️  Generating: ${path.basename(outputPath)}`);
    console.log(`   Text: "${cleanText.substring(0, 80)}..."`);

    try {
        const res = await fetch(`${API_BASE}/api/gemini-voice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: cleanText,
                voice: { aiName: 'Narrator', gender: 'neutral', tone: 'educational' }
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error(`   ❌ API error ${res.status}: ${err.substring(0, 200)}`);
            return false;
        }

        const data = await res.json();

        if (!data.audioContent) {
            console.error(`   ❌ No audio content returned`);
            return false;
        }

        // Decode base64 and write to file
        const audioBuffer = Buffer.from(data.audioContent, 'base64');
        fs.writeFileSync(outputPath, audioBuffer);
        const sizekb = (audioBuffer.length / 1024).toFixed(1);
        console.log(`   ✅ Saved (${sizekb} KB) → ${outputPath}`);
        return true;

    } catch (err) {
        console.error(`   ❌ Network/fetch error: ${err.message}`);
        return false;
    }
}

// ─────────────────────────────────────────────
// Main Runner
// ─────────────────────────────────────────────
async function generateUnit1() {
    const unitDir = path.join(OUTPUT_DIR, 'unit-1');
    fs.mkdirSync(unitDir, { recursive: true });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  KurdLingo Guidebook TTS Generator  ');
    console.log('  Unit 1 — Greetings & Basics        ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Output dir: ${unitDir}`);
    console.log(`Sections to generate: ${unit1Sections.length}`);

    let successCount = 0;
    let failCount = 0;

    for (const section of unit1Sections) {
        const outputPath = path.join(unitDir, `${section.id}.wav`);

        // Skip if already exists
        if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            if (stats.size > 1000) {
                console.log(`   ⏭️  Skipping ${section.id} (already exists, ${(stats.size / 1024).toFixed(1)} KB)`);
                successCount++;
                continue;
            }
        }

        const ok = await generateAudio(section.text, outputPath);
        if (ok) successCount++;
        else failCount++;

        // Polite delay between calls
        if (section !== unit1Sections[unit1Sections.length - 1]) {
            await sleep(DELAY_MS);
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Done! ✅ ${successCount} generated, ❌ ${failCount} failed`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Write a manifest file so the app knows which files are available
    const manifest = {
        unit: 'unit-1',
        generated: new Date().toISOString(),
        sections: unit1Sections.map(s => ({
            id: s.id,
            file: `/audio/guidebook/unit-1/${s.id}.wav`,
            available: fs.existsSync(path.join(unitDir, `${s.id}.wav`))
        }))
    };

    fs.writeFileSync(
        path.join(unitDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );
    console.log(`📋 Manifest written to ${path.join(unitDir, 'manifest.json')}`);
}

// Entry point
const target = process.argv[2] || 'unit-1';
if (target === 'unit-1' || target === 'all') {
    generateUnit1().catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
} else {
    console.log(`Unknown target: ${target}. Use 'unit-1' or 'all'`);
    process.exit(1);
}
