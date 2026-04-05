const API_KEY = 'dD6KSuIUtgFEvgl83I0DZ_vQYIW55bSII7fbo3ht';

async function test() {
    const rawData = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEF/AAACABAAZGF0YQAAAAA='; // valid empty WAV
    
    // Test 1: use inline_data and mime_type (Bad format?)
    const res1 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: "test" }
                ]
            }]
        })
    });
    
    console.log("Status text only:", res1.status, await res1.text());
}

test();
