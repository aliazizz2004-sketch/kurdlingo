import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, MessageCircle, Gamepad2, ArrowLeft } from 'lucide-react';
import './LandingPage.css';

const slides = [
    {
        id: 'welcome',
        title: 'بەخێربێیت بۆ کوردلینگۆ',
        subtitle: 'فێربوونی ئینگلیزی بە شێوەیەکی نوێ و سەردەمیانە لە ڕێگەی زیرەکی دەستکردەوە.',
        icon: <Sparkles size={48} color="var(--color-primary, #1cb0f6)" />,
        image: '/charcter svg/bear.svg',
        color: 'var(--color-primary, #1cb0f6)'
    },
    {
        id: 'ai-chat',
        title: 'گفتوگۆ لەگەڵ AI',
        subtitle: 'ڕۆڵگێڕان و قسەکردن لەگەڵ زیرەکی دەستکرددا بۆ بەهێزکردنی توانای قسەکردنت وەکو کەسێکی ڕاستەقینە.',
        icon: <MessageCircle size={48} color="var(--color-secondary, #ce82ff)" />,
        image: '/charcter svg/book.svg',
        color: 'var(--color-secondary, #ce82ff)'
    },
    {
        id: 'gamified',
        title: 'یاری و فێربوون',
        subtitle: 'لە ڕێگەی یاریکردن و ڕکابەرییەوە، ڕۆژانە بەبێ بێزاربوون وشە و ڕێزمانی نوێ فێربە.',
        icon: <Gamepad2 size={48} color="var(--color-gold, #ffc800)" />,
        image: '/charcter svg/bear.svg',
        color: 'var(--color-gold, #ffc800)'
    }
];

export default function SplashScreen() {
    const navigate = useNavigate();
    const { user, isLoaded } = useUser();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Redirect if logged in
    useEffect(() => {
        if (isLoaded && user) {
            navigate('/learn', { replace: true });
        }
    }, [user, isLoaded, navigate]);

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(curr => curr + 1);
        } else {
            navigate('/learn');
        }
    };

    const handleSkip = () => {
        navigate('/learn');
    };

    if (!isLoaded || user) return null;

    const slide = slides[currentSlide];

    return (
        <div className="splash-screen" dir="rtl">
            <div className="splash-background" style={{ backgroundColor: slide.color }}>
                <div className="splash-glow"></div>
            </div>

            <header className="splash-header">
                <div className="splash-brand">
                    <span className="splash-logo">K</span>
                    <span className="splash-name">KurdLingo</span>
                </div>
                {currentSlide < slides.length - 1 && (
                    <button className="splash-skip" onClick={handleSkip}>
                        بازدان
                    </button>
                )}
            </header>

            <main className="splash-main">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: -50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 1.05 }}
                        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                        className="splash-content-wrapper"
                    >
                        <div className="splash-image-container">
                            <motion.img 
                                src={slide.image} 
                                alt={slide.title} 
                                className="splash-image"
                                initial={{ y: 20 }}
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            />
                            <div className="splash-icon-badge" style={{ color: slide.color }}>
                                {slide.icon}
                            </div>
                        </div>
                        
                        <div className="splash-text-content">
                            <h1 className="splash-title">{slide.title}</h1>
                            <p className="splash-subtitle">{slide.subtitle}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            <footer className="splash-footer">
                <div className="splash-indicators">
                    {slides.map((_, idx) => (
                        <button 
                            key={idx}
                            className={`splash-indicator ${idx === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                            style={{ backgroundColor: idx === currentSlide ? slide.color : 'rgba(255,255,255,0.2)' }}
                        />
                    ))}
                </div>

                <div className="splash-actions">
                    <button 
                        className="splash-btn splash-btn-primary" 
                        onClick={handleNext}
                        style={{ backgroundColor: slide.color }}
                    >
                        {currentSlide === slides.length - 1 ? (
                            <span>دەستپێبکە <ArrowLeft size={20} /></span>
                        ) : (
                            <span>دواتر <ArrowLeft size={20} /></span>
                        )}
                    </button>
                </div>
            </footer>
        </div>
    );
}
