import { useState, useRef } from 'react';
import { requestSTT } from '../services/api';

export default function VoiceTest() {
    const [status, setStatus] = useState<string>('idle');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [transcript, setTranscript] = useState<string>('');
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const startTest = async () => {
        setErrorMsg('');
        setTranscript('');
        setStatus('checking_permissions');
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setStatus('error');
            setErrorMsg('Microphone API is completely blocked by your browser. Are you using HTTP instead of HTTPS on your phone? Browsers REQUIRE secure contexts (HTTPS or localhost) to open the microphone.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStatus('recording');
            
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                setStatus('processing');
                setAudioChunks(chunks);
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());

                try {
                    // Test Gemini directly!
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64 = (reader.result as string).split(',')[1];
                        try {
                            const result = await requestSTT(base64, 'audio/webm');
                            if (result.success) {
                                setTranscript(result.transcript);
                                setStatus('success');
                            } else {
                                setStatus('error');
                                setErrorMsg('Gemini API Error: ' + result.error);
                            }
                        } catch (e: any) {
                            setStatus('error');
                            setErrorMsg('Network Error talking to Gemini: ' + e.message);
                        }
                    };
                    reader.onerror = () => {
                        setStatus('error');
                        setErrorMsg('Failed to process recorded blob.');
                    };
                    reader.readAsDataURL(audioBlob);

                } catch (e: any) {
                    setStatus('error');
                    setErrorMsg('STT Conversion Error: ' + e?.message);
                }
            };

            mediaRecorder.start();
        } catch (e: any) {
            setStatus('error');
            setErrorMsg('Microphone permission denied! Chrome and Safari will automatically block permissions if you access this site using your local IP (e.g. http://192.168.1.5:5173). You MUST use localhost or proper HTTPS. Error detail: ' + e.message);
        }
    };

    const stopTest = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', color: 'var(--color-text)', direction: 'ltr' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)' }}>🎤 Voice Diagnostics Test</h1>
            
            <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '16px', border: '2px solid var(--color-border)' }}>
                <p style={{ marginBottom: '20px' }}>Use this page to test exactly why the voice isn't working on your device.</p>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button 
                        onClick={startTest}
                        disabled={status === 'recording'}
                        style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', opacity: status === 'recording' ? 0.5 : 1 }}
                    >
                        Start Recording
                    </button>
                    <button 
                        onClick={stopTest}
                        disabled={status !== 'recording'}
                        style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--color-error, #ff4b4b)', color: 'white', border: 'none', cursor: 'pointer', opacity: status !== 'recording' ? 0.5 : 1 }}
                    >
                        Stop Recording
                    </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <strong>Status: </strong> 
                    <span style={{ 
                        color: status === 'error' ? 'red' : status === 'success' ? 'green' : 'orange',
                        fontWeight: 'bold', textTransform: 'uppercase'
                    }}>
                        {status}
                    </span>
                </div>

                {status === 'recording' && (
                    <div style={{ padding: '20px', background: 'rgba(255,0,0,0.1)', border: '2px dashed red', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
                        🎙️ Speak anything now...
                    </div>
                )}

                {transcript && (
                    <div style={{ marginTop: '20px', padding: '15px', background: 'var(--color-surface-dim)', borderRadius: '8px' }}>
                        <h3 style={{ marginBottom: '10px' }}>STT Result from Gemini:</h3>
                        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>"{transcript}"</p>
                    </div>
                )}

                {errorMsg && (
                    <div style={{ marginTop: '20px', padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '8px', border: '1px solid #c62828' }}>
                        <h3 style={{ marginBottom: '10px' }}>❌ Critical Error Detected</h3>
                        <p style={{ lineHeight: '1.5' }}>{errorMsg}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
