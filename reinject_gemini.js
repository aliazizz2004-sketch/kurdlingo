import fs from 'fs';

let content = fs.readFileSync('src/pages/Lesson/Lesson.tsx', 'utf8');

const roleplayOld = `    // Toggle voice recording using Native
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
            recognition.continuous = true;
            recognition.interimResults = true;
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

                if (event.results[event.results.length-1].isFinal) {
                    recognition.stop();
                }
            };

            recognition.onerror = (event: any) => {
                console.error('STT Error:', event.error);
                if (event.error === 'no-speech' || event.error === 'aborted' || event.error === 'network') {
                    if (!spokenText.trim()) {
                        setIsRecording(false);
                        setVoiceError(t('couldNotHear') || 'Could not hear you. Please tap again and speak.');
                    }
                } else if (event.error === 'not-allowed') {
                    setIsRecording(false);
                    setVoiceError(t('unsupportedBrowser') || 'Microphone access denied. Please check site permissions.');
                }
            };

            recognition.onend = () => {
                setIsRecording(false);
                let finalSubmission = finalTranscript.trim();
                if (!finalSubmission && spokenText.trim()) {
                    finalSubmission = spokenText.trim();
                }
                if (finalSubmission) {
                    submitAnswer(finalSubmission);
                } else if (!voiceError) {
                   setVoiceError(t('couldNotHear') || 'Could not hear you. Please tap again and speak.');
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

const roleplayNew = `    // Toggle voice recording using direct Gemini API!
    const toggleRecording = async () => {
        if (isCheckingRef.current || hasAnsweredRef.current || isTranscribing) return;
        if (isSpeakingAI) return;

        if (isRecording) {
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
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
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
                    console.error("Gemini Error:", e);
                    setVoiceError(t('voiceError') || 'AI transcription failed. Please try again.');
                } finally {
                    setIsTranscribing(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setSpokenText(t('recordingMessage') || 'Recording... Speak now!');
        } catch (err) {
            console.error('Mic error:', err);
            setVoiceError(t('unsupportedBrowser') || 'Microphone access denied. Ensure you are on HTTPS.');
            setIsRecording(false);
        }
    };`;

const pronunOld = `    // Start speech recognition using Native
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

const pronunNew = `    // Start speech recognition using direct Gemini API!
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
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());

                try {
                    const text = await transcribeWithGemini(audioBlob);
                    const expected = (exercise.expectedAnswer || exercise.targetTranslation).toLowerCase().trim();
                    const accepted = (exercise.acceptedAnswers || []).map((a: string) => a.toLowerCase().trim());
                    
                    const bestMatch = text.toLowerCase().trim();
                    setTranscript(text);

                    let bestScore = similarity(bestMatch, expected);
                    const acceptedScore = Math.max(0, ...accepted.map((a: string) => similarity(bestMatch, a)));
                    const finalScore = Math.max(bestScore, acceptedScore);

                    const isCorrect = finalScore >= 0.6;
                    setTimeout(() => {
                        setStatus(isCorrect ? 'correct' : 'incorrect');
                        setAttempts((prev: number) => prev + 1);
                    }, 500);

                } catch (e) {
                    console.error("Gemini Error:", e);
                    setStatus('error');
                }
            };

            mediaRecorder.start();
            setStatus('listening');
            setTranscript('...');
        } catch (e) {
            console.error('Mic error:', e);
            setStatus('error');
        }
    };`;

function safeReplace(text, searchStr, replaceStr) {
    if (searchStr.includes('const toggleRecording = () => {')) {
        const regex = /    \/\/ Toggle voice recording using Native[\s\S]*?startRecognition\(\);\r?\n        \}\r?\n    \};/g;
        return text.replace(regex, replaceStr);
    } else {
        const regex = /    \/\/ Start speech recognition using Native[\s\S]*?startRec\(\);\r?\n        \}\r?\n    \};/g;
        return text.replace(regex, replaceStr);
    }
}

content = safeReplace(content, roleplayOld, roleplayNew);
content = safeReplace(content, pronunOld, pronunNew);

fs.writeFileSync('src/pages/Lesson/Lesson.tsx', content, 'utf8');
console.log('Update Complete.');
