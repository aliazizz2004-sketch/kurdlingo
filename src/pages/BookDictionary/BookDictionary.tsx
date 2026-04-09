import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MagnifyingGlass, ArrowLeft, BookmarkSimple, SpeakerHigh, X,
    List, GridFour, Info, MapPin, Lightbulb, Sun, Moon
} from '@phosphor-icons/react';
import useTextToSpeech from '../../hooks/useTextToSpeech';
import { bookDictionaryData } from '../../data/bookDictionaryData';
import './BookDictionary.css';

interface MappedWord {
    id: string;
    word: string;
    categoryId: string;
    categoryName: string;
    kurdishMeaning: string;
    exampleEn: string;
    exampleKu: string;
    color: string;
    usageContext?: string;
    moreDetails?: string;
}

// ── DETAIL MODAL ───────────────────────────────────────────────────────
interface DetailModalProps {
    word: MappedWord;
    isSaved: boolean;
    isPlaying: boolean;
    onClose: () => void;
    onBookmark: (id: string) => void;
    onPlay: (word: string, id: string) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ word, isSaved, isPlaying, onClose, onBookmark, onPlay }) => {
    const defaultWhere = 'لە وتوێژی ئینگلیزی ئاسایی و ژیانی ڕۆژانەدا';
    const defaultDetails = 'ئەم دەقەیە بەشێکی گرینگی کانزای زمانی ئینگلیزییە.';
    
    return (
        <motion.div
            className="detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="detail-drawer"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Drag handle */}
                <div className="drawer-handle" />

                {/* Header */}
                <div className="drawer-header">
                    <span className="drawer-cat" style={{ '--cat-c': word.color } as React.CSSProperties}>
                        {word.categoryName}
                    </span>
                    <button className="drawer-close" onClick={onClose}>
                        <X size={20} weight="bold" />
                    </button>
                </div>

                {/* English word */}
                <h2 className="drawer-en" dir="ltr">{word.word}</h2>

                {/* Kurdish */}
                <p className="drawer-ku" dir="rtl">{word.kurdishMeaning}</p>

                {/* Actions */}
                <div className="drawer-actions">
                    <button
                        className={`drawer-btn play ${isPlaying ? 'playing' : ''}`}
                        onClick={() => onPlay(word.word, word.id)}
                    >
                        <SpeakerHigh size={20} weight="fill" />
                        {isPlaying ? 'چاوەڕوان بە...' : 'گوێبگرە'}
                    </button>
                    <button
                        className={`drawer-btn save ${isSaved ? 'saved' : ''}`}
                        onClick={() => onBookmark(word.id)}
                    >
                        <BookmarkSimple size={20} weight={isSaved ? 'fill' : 'bold'} />
                        {isSaved ? 'پاشەکەوتکراوە' : 'پاشەکەوت بکە'}
                    </button>
                </div>

                {/* Example sentence */}
                {word.exampleEn && (
                    <div className="drawer-section">
                        <div className="drawer-section-title">
                            <Info size={16} weight="fill" />
                            <span>نموونە</span>
                        </div>
                        <p className="drawer-example-en" dir="ltr">"{word.exampleEn}"</p>
                        {word.exampleKu && (
                            <p className="drawer-example-ku" dir="rtl">{word.exampleKu}</p>
                        )}
                    </div>
                )}

                {/* Where is it used */}
                <div className="drawer-section">
                    <div className="drawer-section-title">
                        <MapPin size={16} weight="fill" />
                        <span>کوێ بەکاردێت؟</span>
                    </div>
                    <p className="drawer-detail-text" dir="rtl">{word.usageContext || defaultWhere}</p>
                </div>

                {/* More details */}
                <div className="drawer-section">
                    <div className="drawer-section-title">
                        <Lightbulb size={16} weight="fill" />
                        <span>زانیاری زیاتر</span>
                    </div>
                    <p className="drawer-detail-text" dir="rtl">{word.moreDetails || defaultDetails}</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────
const BookDictionary: React.FC = () => {
    const navigate = useNavigate();
    const { speak } = useTextToSpeech();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [playingWordId, setPlayingWordId] = useState<string | null>(null);
    const [activeWord, setActiveWord] = useState<MappedWord | null>(null);
    const [isLightMode, setIsLightMode] = useState(false);

    const allWords: MappedWord[] = useMemo(() =>
        bookDictionaryData.flatMap(cat =>
            cat.entries.map((entry, idx) => ({
                id: entry.id || `${cat.id}-${idx}`,
                word: entry.english,
                categoryId: cat.id,
                categoryName: cat.name.english,
                kurdishMeaning: entry.kurdish,
                exampleEn: entry.example?.english || '',
                exampleKu: entry.example?.kurdish || '',
                color: cat.color,
                usageContext: entry.usageContext,
                moreDetails: entry.moreDetails
            }))
        ), []);

    const filteredWords = useMemo(() => {
        let base = allWords;
        if (selectedCategory === 'favorites') base = base.filter(w => savedWords.has(w.id));
        else if (selectedCategory !== 'all') base = base.filter(w => w.categoryId === selectedCategory);
        if (!searchTerm.trim()) return base.slice(0, 60);
        const q = searchTerm.toLowerCase();
        return base.filter(w =>
            w.word.toLowerCase().includes(q) ||
            w.kurdishMeaning.toLowerCase().includes(q)
        );
    }, [searchTerm, selectedCategory, allWords, savedWords]);

    const toggleBookmark = useCallback((id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSavedWords(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    const handlePlay = useCallback((word: string, id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setPlayingWordId(id);

        const audio = new Audio(`/audio/dictionary/${id}.wav`);
        
        audio.onended = () => setPlayingWordId(null);
        
        audio.onerror = () => {
            console.error("Native audio not available. Falling back to browser TTS.");
            speak(word); // ensure browser reads out the phrase
            setPlayingWordId(null);
        };
        
        audio.play().catch(err => {
            console.warn("Failed to play native audio. Falling back to browser TTS.", err);
            speak(word);
            setPlayingWordId(null);
        });
    }, [speak]);

    const openDetail = (w: MappedWord) => setActiveWord(w);
    const closeDetail = () => setActiveWord(null);

    return (
        <div className={`lexicon-root${isLightMode ? ' light-mode' : ''}`}>
            {/* ── HEADER ── */}
            <header className="lexicon-header">
                <div className="lex-header-left">
                    <button className="lex-icon-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={24} weight="bold" />
                    </button>
                    <h1 className="lex-title">فەرهەنگ</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Theme toggle */}
                    <button
                        className="lex-theme-btn"
                        onClick={() => setIsLightMode(p => !p)}
                        title={isLightMode ? 'دوو بکەوە' : 'ڕووناک بکەوە'}
                    >
                        {isLightMode ? <Moon size={18} weight="bold" /> : <Sun size={18} weight="bold" />}
                    </button>
                    {/* View mode */}
                    <div className="lex-view-toggle">
                        <button
                            className={`lex-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <GridFour size={20} weight={viewMode === 'grid' ? 'fill' : 'regular'} />
                        </button>
                        <button
                            className={`lex-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                        >
                            <List size={20} weight={viewMode === 'table' ? 'fill' : 'regular'} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="lexicon-main">
                {/* ── SEARCH & FILTER ── */}
                <div className="lex-controls-wrapper">
                    <div className="lex-search-box">
                        <MagnifyingGlass size={20} className="lex-search-icon" />
                        <input
                            className="lex-search-input"
                            placeholder="گەڕان بۆ وشەکان..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="lex-search-clear" onClick={() => setSearchTerm('')}>
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    <div className="lex-categories no-scrollbar">
                        <button
                            className={`lex-cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('all')}
                        >هەموو پەرتووکەکان</button>
                        <button
                            className={`lex-cat-pill lex-cat-fav ${selectedCategory === 'favorites' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('favorites')}
                        >
                            پەسەندکراوەکان <BookmarkSimple size={14} weight="fill" />
                        </button>
                        {bookDictionaryData.map(c => (
                            <button
                                key={c.id}
                                className={`lex-cat-pill ${selectedCategory === c.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(c.id)}
                            >{c.name.kurdish}</button>
                        ))}
                    </div>
                </div>

                <div className="lex-results-info">
                    <span className="lex-badge">دۆزراوەکان</span>
                    <span className="lex-count">{filteredWords.length} وشە</span>
                </div>

                {/* ── GRID VIEW ── */}
                {viewMode === 'grid' && (
                    <div className="lex-word-grid">
                        <AnimatePresence>
                            {filteredWords.map(w => (
                                <motion.div
                                    key={w.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="lex-card"
                                    style={{ '--card-theme': w.color } as React.CSSProperties}
                                    onClick={() => openDetail(w)}
                                >
                                    {/* Category + English word */}
                                    <div className="lex-card-top">
                                        <span className="lex-card-cat">{w.categoryName}</span>
                                        <h4 className="lex-card-en">{w.word}</h4>
                                    </div>

                                    {/* Example */}
                                    <div className="lex-card-mid">
                                        {w.exampleEn && (
                                            <p className="lex-card-example">"{w.exampleEn}"</p>
                                        )}
                                    </div>

                                    {/* Bottom: Kurdish word LEFT, Icons + Sorani label RIGHT */}
                                    <div className="lex-card-bot">
                                        <p className="lex-card-ku" dir="rtl">{w.kurdishMeaning}</p>
                                        <div className="lex-card-bot-right">
                                            <div className="lex-card-bot-icons">
                                                <button
                                                    className={`lex-card-btn fav ${savedWords.has(w.id) ? 'active' : ''}`}
                                                    onClick={e => toggleBookmark(w.id, e)}
                                                    title="پاشەکەوت بکە"
                                                >
                                                    <BookmarkSimple size={18} weight={savedWords.has(w.id) ? 'fill' : 'regular'} />
                                                </button>
                                                <button
                                                    className={`lex-card-btn play ${playingWordId === w.id ? 'playing' : ''}`}
                                                    onClick={e => handlePlay(w.word, w.id, e)}
                                                    title="گوێبگرە"
                                                >
                                                    <SpeakerHigh size={18} weight={playingWordId === w.id ? 'fill' : 'regular'} />
                                                </button>
                                            </div>
                                            <span className="lex-lang-label">Sorani</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {filteredWords.length === 0 && (
                            <div className="lex-empty">نەدۆزرایەوە! بە دوای شتێکی تردا بگەڕێ.</div>
                        )}
                    </div>
                )}

                {/* ── TABLE VIEW: Kurdish RIGHT, English LEFT ── */}
                {viewMode === 'table' && (
                    <div className="lex-table-container">
                        <div className="lex-table-header">
                            {/* LTR order: audio | en | ku | bookmark */}
                            <div className="lex-th-audio">دەنگ</div>
                            <div className="lex-th-en">وشەی ئینگلیزی</div>
                            <div className="lex-th-ku">مانای کوردی</div>
                            <div className="lex-th-fav"></div>
                        </div>
                        <div className="lex-table-body">
                            <AnimatePresence>
                                {filteredWords.map(w => (
                                    <motion.div
                                        key={w.id}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -16 }}
                                        className="lex-table-row"
                                        onClick={() => openDetail(w)}
                                    >
                                        <div className="lex-td-audio">
                                            <button
                                                className={`lex-small-play ${playingWordId === w.id ? 'playing' : ''}`}
                                                onClick={e => { e.stopPropagation(); handlePlay(w.word, w.id); }}
                                            >
                                                <SpeakerHigh size={18} weight={playingWordId === w.id ? 'fill' : 'regular'} />
                                            </button>
                                        </div>
                                        <div className="lex-td-en">
                                            <span className="lex-t-word" dir="ltr">{w.word}</span>
                                            <span className="lex-t-cat">{w.categoryName}</span>
                                        </div>
                                        <div className="lex-td-ku">
                                            <span className="lex-t-kurd" dir="rtl">{w.kurdishMeaning}</span>
                                        </div>
                                        <div className="lex-td-fav">
                                            <button
                                                className={`lex-small-fav ${savedWords.has(w.id) ? 'active' : ''}`}
                                                onClick={e => { e.stopPropagation(); toggleBookmark(w.id); }}
                                            >
                                                <BookmarkSimple size={16} weight={savedWords.has(w.id) ? 'fill' : 'bold'} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        {filteredWords.length === 0 && (
                            <div className="lex-empty" style={{ marginTop: '40px' }}>هیچ وشەیەک نییە لەم بەشەدا.</div>
                        )}
                    </div>
                )}
            </main>

            {/* ── DETAIL MODAL / DRAWER ── */}
            <AnimatePresence>
                {activeWord && (
                    <DetailModal
                        word={activeWord}
                        isSaved={savedWords.has(activeWord.id)}
                        isPlaying={playingWordId === activeWord.id}
                        onClose={closeDetail}
                        onBookmark={id => toggleBookmark(id)}
                        onPlay={handlePlay}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookDictionary;
