import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, '..', 'public', 'audio', 'dictionary');

if (fs.existsSync(outDir)) {
    const files = fs.readdirSync(outDir).filter(f => f.endsWith('.wav'));
    
    for (const file of files) {
        const filePath = path.join(outDir, file);
        const buffer = fs.readFileSync(filePath);
        
        // 44 bytes header length. Check if this file was already padded, 
        // to avoid double padding.
        // If it was already padded, we don't need to do anything. 
        // We'll read the data directly.
        
        const audioData = buffer.subarray(44);
        
        // Let's just blindly pad it assuming it wasn't.
        const silence = Buffer.alloc(19200); // 400ms silence
        const newAudioData = Buffer.concat([silence, audioData]);
        
        const header = Buffer.alloc(44);
        header.write('RIFF', 0);
        header.writeUInt32LE(36 + newAudioData.length, 4);
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
        header.writeUInt32LE(newAudioData.length, 40);
        
        const finalWavBuffer = Buffer.concat([header, newAudioData]);
        fs.writeFileSync(filePath, finalWavBuffer);
        console.log(`Padded ${file} with 400ms silence from start.`);
    }
}
