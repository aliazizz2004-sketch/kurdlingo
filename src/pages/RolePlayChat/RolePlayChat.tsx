import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rolePlayScenarios } from '../../data/rolePlayScenarios';
import { sendChatMessage, evalChatMessage } from '../../services/api';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import useTextToSpeech from '../../hooks/useTextToSpeech';
import { useLanguage } from '../../context/LanguageContext';
import { Mic, Send, ArrowLeft, Play, Square, Star } from 'lucide-react';
import './RolePlayChat.css';

interface Message {
    id?: string;
    role: 'ai' | 'user';
    text: string;
    timestamp: Date;
    image?: string;
    avatar?: string;
    rating?: number;
    correction?: string;
    isEvaluating?: boolean;
}

interface ChatHistoryItem {
    role: string;
    parts: Array<{ text: string }>;
}

const RolePlayChat: React.FC = () => {
    const { scenarioId } = useParams<{ scenarioId: string }>();
    const navigate = useNavigate();
    const scenario = rolePlayScenarios.find(s => s.id === scenarioId);

    const { t, language } = useLanguage();

    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { transcript, isListening, startListening, stopListening, error: speechError } = useSpeechRecognition();
    const { speak, prepareAndSpeak, stop: stopSpeaking } = useTextToSpeech();

    // Scroll to bottom whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize Chat
    useEffect(() => {
        if (!scenario) return;

        // Add initial message to history
        setChatHistory([{
            role: 'model',
            parts: [{ text: scenario.initialMessage }]
        }]);

        // Use prepareAndSpeak: show message only when audio is ready
        setIsTyping(true);
        prepareAndSpeak(
            scenario.initialMessage,
            () => {
                // onReady: audio is fetched, show the message now
                const initialAI: Message = {
                    id: `msg-initial`,
                    role: 'ai' as const,
                    text: scenario.initialMessage,
                    timestamp: new Date(),
                    avatar: scenario.image
                };
                setMessages([initialAI]);
                setIsTyping(false);
            },
            undefined,
            {
                aiName: scenario.aiName,
                gender: scenario.gender,
                tone: scenario.tone
            }
        );

        return () => {
            stopSpeaking();
            stopListening();
        };
    }, [scenario, navigate, prepareAndSpeak, stopSpeaking, stopListening]);

    // Handle incoming transcript when speech ends
    useEffect(() => {
        if (transcript && !isListening) {
            handleSendMessage(transcript);
        }
    }, [isListening, transcript]);

    const getVisualAttachment = (text: string, scenarioId: string): string | undefined => {
        const lowerText = text.toLowerCase();

        // Cafe Scenario Logic
        if (scenarioId === 'coffee-shop') {
            if (lowerText.includes('latte')) return '/roleplay/item_iced_latte.png';
            if (lowerText.includes('water')) return '/roleplay/item_water.png';
            if (lowerText.includes('coffee') || lowerText.includes('cappuccino') || lowerText.includes('espresso')) return '/roleplay/item_coffee.png';
        }

        return undefined;
    };

    const getAvatarForEmotion = (text: string, baseAvatar: string, scenarioId: string): string => {
        const lowerText = text.toLowerCase();

        // Cafe Scenario Emotion Logic
        if (scenarioId === 'coffee-shop') {
            if (lowerText.includes('happy') || lowerText.includes('great') || lowerText.includes('enjoy') || lowerText.includes('welcome')) {
                return '/roleplay/sam_happy.png';
            }
            if (lowerText.includes('sorry') || lowerText.includes('confused') || lowerText.includes('repeat') || lowerText.includes('what')) {
                return '/roleplay/sam_confused.png';
            }
            if (lowerText.includes('angry') || lowerText.includes('wrong') || lowerText.includes('unfortunately')) {
                return '/roleplay/sam_angry.png';
            }
        }

        return baseAvatar;
    };

    const [inputText, setInputText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-expand textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputText]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || !scenario) return;

        const msgId = `msg-${Date.now()}`;
        const userMsg: Message = { id: msgId, role: 'user', text, timestamp: new Date(), isEvaluating: true };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        setInputText(''); // Clear input

        // Update history with user message
        const newHistory = [...chatHistory, {
            role: 'user',
            parts: [{ text }]
        }];

        // Evaluate user's grammar
        evalChatMessage(text).then(evalResult => {
            if (evalResult.success && (evalResult.rating || evalResult.correction)) {
                setMessages(prev => prev.map(m => 
                    m.id === msgId 
                        ? { ...m, isEvaluating: false, rating: evalResult.rating, correction: evalResult.correction }
                        : m
                ));
            } else {
                setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isEvaluating: false } : m));
            }
        });

        try {
            // Use secure API - no API key exposed!
            const result = await sendChatMessage(text, scenario.systemPrompt, chatHistory);

            if (result.success && result.response) {
                const attachment = getVisualAttachment(result.response, scenario.id);
                const currentAvatar = getAvatarForEmotion(result.response, scenario.image, scenario.id);

                // Update history with AI response
                setChatHistory([...newHistory, {
                    role: 'model',
                    parts: [{ text: result.response }]
                }]);

                // Use prepareAndSpeak: keep typing indicator until audio is ready
                await prepareAndSpeak(
                    result.response,
                    () => {
                        // onReady: audio is fetched, show the message now
                        const aiMsg: Message = {
                            id: `msg-${Date.now()}-ai`,
                            role: 'ai',
                            text: result.response,
                            timestamp: new Date(),
                            image: attachment,
                            avatar: currentAvatar
                        };
                        setMessages(prev => [...prev, aiMsg]);
                        setIsTyping(false);
                    },
                    undefined,
                    {
                        aiName: scenario.aiName,
                        gender: scenario.gender,
                        tone: scenario.tone
                    }
                );
            } else {
                throw new Error(result.error || 'Failed to get response');
            }
        } catch (err) {
            console.error("Chat API Error:", err);
            setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I'm having trouble connecting right now. Let's try again in a moment.", timestamp: new Date() }]);
            setIsTyping(false);
        }
    };

    if (!scenario) return <div>Scenario not found</div>;

    return (
        <div className="roleplay-chat-page">
            <header className="chat-header">
                <button className="back-btn" onClick={() => navigate('/roleplay')}>
                    <ArrowLeft size={24} />
                </button>
                <div className="scenario-info">
                    <div className="scenario-avatar-container">
                        <img src={scenario.image} alt={scenario.title} className="scenario-avatar" />
                        <span className="scenario-icon-overlay">{scenario.icon}</span>
                    </div>
                    <div className="scenario-titles">
                        <h2>{language === 'ckb' ? scenario.titleKu : scenario.title}</h2>
                        <p>
                            {t('aiLabel')}: {language === 'ckb' ? scenario.aiRoleKu : scenario.aiRole} &
                            {t('youLabel')}: {language === 'ckb' ? scenario.userRoleKu : scenario.userRole}
                        </p>
                    </div>
                </div>
                <div className={`difficulty-indicator ${scenario.difficulty}`}>
                    {t(scenario.difficulty)}
                </div>
            </header>

            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message-row ${msg.role}`}>
                        {msg.role === 'ai' && (
                            <img src={msg.avatar || scenario.image} alt="AI Avatar" className="chat-avatar" />
                        )}
                        <div className={`message-bubble ${msg.role}`}>
                            <div className="bubble-content">
                                {msg.text}
                                {msg.image && (
                                    <div className="message-attachment">
                                        <img src={msg.image} alt="Attached item" />
                                    </div>
                                )}
                            </div>
                            {msg.role === 'user' && (msg.rating || msg.correction || msg.isEvaluating) && (
                                <div className="message-eval-card">
                                    {msg.isEvaluating ? (
                                        <div className="eval-loading">
                                            <span></span><span></span><span></span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="eval-rating">
                                                <Star className="eval-star" size={14} fill="currentColor" />
                                                <span>{msg.rating}/10</span>
                                            </div>
                                            {msg.correction && (
                                                <div className="eval-correction">{msg.correction}</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                            <div className="bubble-meta">
                                {msg.role === 'ai' && (
                                    <>
                                        <button className="re-speak-btn" onClick={() => speak(msg.text, undefined, {
                                            aiName: scenario.aiName,
                                            gender: scenario.gender,
                                            tone: scenario.tone
                                        })}>
                                            <Play size={12} fill="currentColor" />
                                        </button>
                                        <button className="re-speak-btn" onClick={stopSpeaking} style={{ marginLeft: '4px' }}>
                                            <Square size={12} fill="currentColor" />
                                        </button>
                                    </>
                                )}
                                <span className="message-time">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="message-row ai">
                        <img src={scenario.image} alt="AI Avatar" className="chat-avatar" />
                        <div className="message-bubble ai typing">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <footer className="chat-footer">
                <div className={`record-status ${isListening ? 'active' : ''}`}>
                    {isListening ? t('listening') : (speechError ? speechError : t('tapToAnswer'))}
                </div>

                <div className="input-row">
                    <button
                        className={`mic-button ${isListening ? 'listening' : ''}`}
                        onClick={isListening ? stopListening : startListening}
                        title={t('tapToAnswer')}
                    >
                        <Mic size={32} />
                        {isListening && <div className="pulse-ring"></div>}
                    </button>

                    <div className="text-input-fallback">
                        <textarea
                            ref={textareaRef}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={t('typeMessage')}
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(inputText);
                                }
                            }}
                        />
                        <button
                            className={`send-btn ${inputText.trim() ? 'active' : ''}`}
                            onClick={() => handleSendMessage(inputText)}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default RolePlayChat;
