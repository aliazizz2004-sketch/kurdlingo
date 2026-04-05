import fs from 'fs';

let content = fs.readFileSync('src/pages/Lesson/Lesson.tsx', 'utf8');

const roleplayOriginal = `    // Toggle voice recording using Gemini (AI) STT
    const toggleRecording = async () => {
        if (isCheckingRef.current || hasAnsweredRef.current || isTranscribing) return;
        if (isSpeakingAI) return;

        if (isRecording) {
            // Stop recording
            if (recognitionRef.current && recognitionRef.current.state === 'recording') {
                recognitionRef.current.stop();
            }
            return;
        }

        setVoiceError(null);
        window.speechSynthesis?.cancel();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            recognitionRef.current = mediaRecorder;
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                setIsRecording(false);
                setIsTranscribing(true);
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                stream.getTracks().forEach(track => track.stop());

                try {
                    const transcript = await transcribeWithGemini(audioBlob);
                    setSpokenText(transcript);
                    if (transcript.trim()) {
                        submitAnswer(transcript.trim());
                    } else {
                        setVoiceError(t('couldNotHear') || 'Could not hear you. Please try again.');
                    }
                } catch (e) {
                    setVoiceError(t('voiceError') || 'AI transcription failed. Please try again.');
                } finally {
                    setIsTranscribing(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setSpokenText('');
        } catch (err) {
            console.error('Mic error:', err);
            setVoiceError(t('unsupportedBrowser') || 'Microphone access denied or unavailable.');
            setIsRecording(false);
        }
    };`;

const roleplayNew = `    // Toggle voice recording (Native Web Speech API)
    const toggleRecording = () => {
        if (isCheckingRef.current || hasAnsweredRef.current || isTranscribing) return;
        if (isSpeakingAI) return;

        if (isRecording) {
            setIsRecording(false);
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { }
            }
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setVoiceError(t('unsupportedBrowser') || 'Speech recognition is not available in your browser.');
            return;
        }

        setVoiceError(null);

        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) { }
        }

        let needsWait = false;
        if ('speechSynthesis' in window && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
            window.speechSynthesis.cancel();
            needsWait = true;
        }

        const startRecognition = () => {
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            recognition.lang = exercise.speechLang || 'en-US';
            recognition.continuous = true; // Use continuous so it doesn't auto close instantly on some androids
            recognition.interimResults = true; // Show text as they speak
            recognition.maxAlternatives = 1;

            let finalTranscript = '';

            recognition.onstart = () => {
                setIsRecording(true);
                setSpokenText('');
                setVoiceError(null);
            };

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                const currentText = (finalTranscript + ' ' + interimTranscript).trim();
                setSpokenText(currentText);

                // Auto stop functionality if they stopped talking
                if (event.results[event.results.length-1].isFinal) {
                    recognition.stop();
                }
            };

            recognition.onerror = (event: any) => {
                console.error('STT Error:', event.error);
                if (event.error === 'no-speech' || event.error === 'aborted' || event.error === 'network') {
                    // ignore network errors if we already got some text
                    if (!spokenText.trim()) {
                        setIsRecording(false);
                        setVoiceError(t('couldNotHear') || 'Could not hear you. Please tap again and speak clearly.');
                    }
                } else if (event.error === 'not-allowed') {
                    setIsRecording(false);
                    setVoiceError(t('unsupportedBrowser') || 'Microphone access denied. Please check site permissions.');
                }
            };

            recognition.onend = () => {
                setIsRecording(false);
                let finalSubmission = finalTranscript.trim();
                // Fallback to spokenText state if finalTranscript didn't capture the end due to abort
                if (!finalSubmission && spokenText.trim()) {
                    finalSubmission = spokenText.trim();
                }

                if (finalSubmission) {
                    submitAnswer(finalSubmission);
                } else if (!voiceError) {
                   setVoiceError(t('couldNotHear') || 'Could not hear you. Please tap again and speak clearly.');
                }
            };

            try {
                recognition.start();
            } catch (err) {
                console.error('Recognition start error:', err);
                setIsRecording(false);
            }
        };

        if (needsWait) {
            setTimeout(startRecognition, 400); // give the browser a bit longer on android
        } else {
            startRecognition();
        }
    };`;

const pronunOriginal = `    // Start speech recognition using Gemini AI
    const startListening = async () => {
        if (isPlaying) return;

        // Toggle logic: stop recording if it's already listening
        if (status === 'listening' && recognitionRef.current && recognitionRef.current.state === 'recording') {
            recognitionRef.current.stop();
            return;
        }

        window.speechSynthesis?.cancel();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            recognitionRef.current = mediaRecorder;
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                setStatus('processing');
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                stream.getTracks().forEach(track => track.stop());

                try {
                    const text = await transcribeWithGemini(audioBlob);
                    const expected = (exercise.expectedAnswer || exercise.targetTranslation).toLowerCase().trim();
                    const accepted = (exercise.acceptedAnswers || []).map(a => a.toLowerCase().trim());
                    
                    const bestMatch = text.toLowerCase().trim();
                    setTranscript(text);

                    let bestScore = similarity(bestMatch, expected);
                    const acceptedScore = Math.max(0, ...accepted.map(a => similarity(bestMatch, a)));
                    const finalScore = Math.max(bestScore, acceptedScore);

                    const isCorrect = finalScore >= 0.6;
                    setTimeout(() => {
                        setStatus(isCorrect ? 'correct' : 'incorrect');
                        setAttempts(prev => prev + 1);
                    }, 500);

                } catch (e) {
                    setStatus('error');
                }
            };

            mediaRecorder.start();
            setStatus('listening');
            setTranscript('');
        } catch (e) {
            console.error('Mic error:', e);
            setStatus('error');
        }
    };`;

const pronunNew = `    // Start speech recognition Native
    const startListening = () => {
        if (isPlaying) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setStatus('unsupported');
            return;
        }

        if (status === 'listening' && recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
            return;
        }

        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) { }
        }

        let needsWait = false;
        if ('speechSynthesis' in window && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
            window.speechSynthesis.cancel();
            needsWait = true;
        }

        const startRec = () => {
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            recognition.lang = exercise.speechLang || 'en-US';
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            let finalTranscript = '';

            recognition.onstart = () => {
                setStatus('listening');
                setTranscript('');
            };

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                const currentText = (finalTranscript + ' ' + interimTranscript).trim();
                setTranscript(currentText);

                if (event.results[event.results.length-1].isFinal) {
                    recognition.stop();
                }
            };

            recognition.onerror = (event: any) => {
                console.error('STT error:', event.error);
                if (event.error === 'not-allowed') {
                    setStatus('error');
                }
            };

            recognition.onend = () => {
                if (statusRef.current === 'listening') {
                    if (!finalTranscript && !transcript) {
                        setStatus('idle');
                        return;
                    }

                    setStatus('processing');
                    
                    const bestMatch = (finalTranscript || transcript).toLowerCase().trim();
                    const expected = (exercise.expectedAnswer || exercise.targetTranslation).toLowerCase().trim();
                    const accepted = (exercise.acceptedAnswers || []).map((a: string) => a.toLowerCase().trim());
                    
                    setTranscript(bestMatch);

                    let bestScore = similarity(bestMatch, expected);
                    const acceptedScore = Math.max(0, ...accepted.map((a: string) => similarity(bestMatch, a)));
                    const finalScore = Math.max(bestScore, acceptedScore);

                    const isCorrect = finalScore >= 0.6;
                    setTimeout(() => {
                        setStatus(isCorrect ? 'correct' : 'incorrect');
                        setAttempts((prev: number) => prev + 1);
                    }, 500);
                }
            };

            try {
                recognition.start();
            } catch (e) {
                setStatus('error');
            }
        };

        if (needsWait) {
            setTimeout(startRec, 400); // 400ms wait
        } else {
            startRec();
        }
    };`;

function safeReplace(text, searchStr, replaceStr) {
    if (searchStr.includes('const toggleRecording = async () => {')) {
        const regex = /    \/\/ Toggle voice recording using Gemini \(AI\) STT[\s\S]*?start\(\);\r?\n            setIsRecording\(true\);\r?\n            setSpokenText\(''\);\r?\n        \} catch \(err\) \{[\s\S]*?\}\r?\n    \};/g;
        return text.replace(regex, replaceStr);
    } else {
        const regex = /    \/\/ Start speech recognition using Gemini AI[\s\S]*?setStatus\('error'\);\r?\n        \}\r?\n    \};/g;
        return text.replace(regex, replaceStr);
    }
}

content = safeReplace(content, roleplayOriginal, roleplayNew);
content = safeReplace(content, pronunOriginal, pronunNew);

// Add the user message text render right below the recording button
const spokenTextRenderMatch = '{/* Hints */}';
if (content.includes(spokenTextRenderMatch)) {
    const renderSpokenTextStr = \`
            {/* User Spoken Text (Real-time) */}
            {spokenText && !hasAnswered && (
                <div className="chat-hints" style={{marginTop:'15px', color:'var(--color-primary)', fontWeight:'800', textAlign:'center', fontSize:'1.15rem'}}>
                    {spokenText}
                </div>
            )}
            
            {/* Hints */}\`;
    content = content.replace('{/* Hints */}', renderSpokenTextStr);
}

fs.writeFileSync('src/pages/Lesson/Lesson.tsx', content, 'utf8');
console.log('Update Complete.');
