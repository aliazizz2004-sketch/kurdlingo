import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@insforge/react';
import {
    Bot, Flame, BookOpen, Gamepad2, Mic, BookText,
    GraduationCap, Landmark, Laptop, Smartphone, Globe,
    Star, ArrowLeft, Zap, Target,
    MessageCircle, Volume2, PenTool, Sparkles, Sun, Moon
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './LandingPage.css';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    
    useEffect(() => {
        if (user) {
            navigate('/learn', { replace: true });
        }
    }, [user, navigate]);

    const [scrolled, setScrolled] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('lp-theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Navbar scroll
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Theme persistence
    useEffect(() => {
        localStorage.setItem('lp-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // GSAP animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero entrance — these play immediately on load (no ScrollTrigger)
            gsap.from('.lp-hero__badge', { opacity: 0, y: 30, duration: 0.8, delay: 0.2 });
            gsap.from('.lp-hero__title', { opacity: 0, y: 40, duration: 0.9, delay: 0.35 });
            gsap.from('.lp-hero__desc', { opacity: 0, y: 30, duration: 0.8, delay: 0.5 });
            gsap.from('.lp-hero__ctas', { opacity: 0, y: 30, duration: 0.8, delay: 0.65 });
            gsap.from('.lp-hero__metrics', { opacity: 0, y: 20, duration: 0.8, delay: 0.8 });
            gsap.from('.lp-mockup', { opacity: 0, y: 60, scale: 0.92, duration: 1.1, delay: 0.4, ease: 'power3.out' });
            gsap.from('.lp-mockup__card, .lp-mockup__streak', {
                opacity: 0, x: 40, duration: 0.6, stagger: 0.12, delay: 0.8
            });

            // Mascot entrance
            gsap.from('.lp-mascot--hero', { opacity: 0, x: -60, rotation: -15, duration: 1, delay: 0.9, ease: 'back.out(1.4)' });

            // ScrollTrigger-based reveals — use `to` from a set state so they're visible by default
            const revealSections = [
                { trigger: '.lp-partners', targets: '.lp-partner' },
                { trigger: '.lp-bento-header', targets: '.lp-bento-header > *' },
                { trigger: '.lp-bento', targets: '.lp-card' },
                { trigger: '.lp-steps-header', targets: '.lp-steps-header > *' },
                { trigger: '.lp-steps', targets: '.lp-step' },
                { trigger: '.lp-stats', targets: '.lp-stat-item' },
                { trigger: '.lp-reviews-header', targets: '.lp-reviews-header > *' },
                { trigger: '.lp-reviews', targets: '.lp-review' },
                { trigger: '.lp-cta', targets: '.lp-cta__inner > *' },
            ];

            revealSections.forEach(({ trigger, targets }) => {
                // Set initial state
                gsap.set(targets, { opacity: 0, y: 40 });
                // Animate on scroll
                ScrollTrigger.create({
                    trigger,
                    start: 'top 90%',
                    once: true,
                    onEnter: () => {
                        gsap.to(targets, {
                            opacity: 1, y: 0,
                            stagger: 0.1,
                            duration: 0.7,
                            ease: 'power3.out',
                        });
                    }
                });
            });

            // Progress ring
            ScrollTrigger.create({
                trigger: '.lp-ring__fill',
                start: 'top 90%',
                once: true,
                onEnter: () => {
                    document.querySelectorAll('.lp-ring__fill').forEach(el => {
                        el.classList.add('lp-ring__fill--animate');
                    });
                }
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className={`lp ${darkMode ? 'lp--dark' : 'lp--light'}`}>
            <div className="lp-glow lp-glow--green" />
            <div className="lp-glow lp-glow--blue" />

            <div className="lp-content">

                {/* ═══ NAVBAR ═══ */}
                <nav className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
                    <div className="lp-nav__brand" onClick={() => navigate('/')}>
                        <div className="lp-nav__logo">K</div>
                        <div className="lp-nav__name">Kurd<b>Lingo</b></div>
                    </div>
                    <div className="lp-nav__actions">
                        <button
                            className="lp-btn lp-btn--icon"
                            onClick={() => setDarkMode(!darkMode)}
                            aria-label="Toggle theme"
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button className="lp-btn lp-btn--ghost" onClick={() => navigate('/login')}>
                            چوونەژوورەوە
                        </button>
                        <button className="lp-btn lp-btn--solid" onClick={() => navigate('/login')}>
                            دەستپێبکە
                        </button>
                    </div>
                </nav>

                {/* ═══ HERO ═══ */}
                <section className="lp-hero">
                    <div className="lp-hero__grid">
                        {/* Mascot peeking beside hero text */}
                        <img
                            src="/charcter svg/bear.svg"
                            alt="KurdLingo Mascot"
                            className="lp-mascot lp-mascot--hero"
                        />
                        <div className="lp-hero__text">
                            <div className="lp-hero__badge">
                                <span className="lp-hero__badge-dot" />
                                پلاتفۆرمی فێربوونی زمان بە AI
                            </div>
                            <h1 className="lp-hero__title">
                                فێربوونی ئینگلیزی
                                <br />
                                <em>خۆش و ئاسان</em> بکە
                            </h1>
                            <p className="lp-hero__desc">
                                لەگەڵ کوردلینگۆ بە ڕێگای وانەی ئینتەراکتیڤ، ڕۆڵگێڕان لەگەڵ زیرەکی دەستکرد و یاری — زمانی ئینگلیزی و زمانەکانی تر فێر بە بەکەیفترین شێوە.
                            </p>
                            <div className="lp-hero__ctas">
                                <button className="lp-hero__primary" onClick={() => navigate('/login')}>
                                    <ArrowLeft size={18} />
                                    دەستپێکردنی خۆڕایی
                                </button>
                            </div>
                            <div className="lp-hero__metrics">
                                <div>
                                    <span className="lp-metric__value">١٠K+</span>
                                    <span className="lp-metric__label">فێرخواز</span>
                                </div>
                                <div>
                                    <span className="lp-metric__value">٥٠٠+</span>
                                    <span className="lp-metric__label">وانە</span>
                                </div>
                                <div>
                                    <span className="lp-metric__value">٤.٩</span>
                                    <span className="lp-metric__label">هەڵسەنگاندن</span>
                                </div>
                            </div>
                        </div>

                        <div className="lp-hero__visual">
                            <div className="lp-mockup">
                                <div className="lp-mockup__card">
                                    <div className="lp-mockup__icon lp-mockup__icon--green">
                                        <MessageCircle size={20} />
                                    </div>
                                    <div className="lp-mockup__info">
                                        <h4>بەشی ١: سڵاوکردن</h4>
                                        <p>٥ وانە · سەرەتایی</p>
                                        <div className="lp-mockup__bar">
                                            <div className="lp-mockup__fill" style={{ width: '75%' }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="lp-mockup__card">
                                    <div className="lp-mockup__icon lp-mockup__icon--blue">
                                        <PenTool size={20} />
                                    </div>
                                    <div className="lp-mockup__info">
                                        <h4>بەشی ٢: خۆناساندن</h4>
                                        <p>٨ وانە · سەرەتایی</p>
                                        <div className="lp-mockup__bar">
                                            <div className="lp-mockup__fill" style={{ width: '40%' }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="lp-mockup__streak">
                                    <div className="lp-mockup__streak-icon">
                                        <Flame size={18} />
                                    </div>
                                    <div>
                                        <h4>٧ ڕۆژ لەسەریەک</h4>
                                        <p>بەردەوام بە فێربوون</p>
                                    </div>
                                </div>

                                <div className="lp-mockup__card">
                                    <div className="lp-mockup__icon lp-mockup__icon--purple">
                                        <Gamepad2 size={20} />
                                    </div>
                                    <div className="lp-mockup__info">
                                        <h4>یاری تایپکردن</h4>
                                        <p>ڕاهێنان بە خوێندنەوە</p>
                                        <div className="lp-mockup__bar">
                                            <div className="lp-mockup__fill" style={{ width: '60%' }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="lp-mockup__card">
                                    <div className="lp-mockup__icon lp-mockup__icon--gold">
                                        <Star size={20} />
                                    </div>
                                    <div className="lp-mockup__info">
                                        <h4>٢٥٠ خاڵ</h4>
                                        <p>ئەم هەفتەیە</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ PARTNERS ═══ */}
                <section className="lp-partners">
                    <div className="lp-partners__inner">
                        <p className="lp-partners__label">پشتیوانیکراو لە لایەن</p>
                        <div className="lp-partners__list">
                            <div className="lp-partner">
                                <div className="lp-partner__icon"><GraduationCap size={16} /></div>
                                <span>زانکۆی سلێمانی</span>
                            </div>
                            <div className="lp-partner">
                                <div className="lp-partner__icon"><Landmark size={16} /></div>
                                <span>وەزارەتی پەروەردە</span>
                            </div>
                            <div className="lp-partner">
                                <div className="lp-partner__icon"><Laptop size={16} /></div>
                                <span>تەکنۆلۆجیای هەولێر</span>
                            </div>
                            <div className="lp-partner">
                                <div className="lp-partner__icon"><Smartphone size={16} /></div>
                                <span>KRG Digital</span>
                            </div>
                            <div className="lp-partner">
                                <div className="lp-partner__icon"><Globe size={16} /></div>
                                <span>Kurdish Academy</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ FEATURES BENTO ═══ */}
                <section className="lp-section">
                    <div className="lp-bento-header">
                        <span className="lp-section__label">تایبەتمەندییەکان</span>
                        <h2 className="lp-section__title">هەموو ئەوەی پێویستت بۆ فێربوون</h2>
                        <p className="lp-section__desc">
                            ئامرازی پێشکەوتوو و هەست‌پێکراو بۆ فێربوونی زمانی ئینگلیزی و زمانەکانی تر بە شێوەیەکی ئاسان و خۆش
                        </p>
                    </div>

                    <div className="lp-bento">
                        <div className="lp-card lp-card--wide" data-accent="green">
                            <div className="lp-card__icon"><Bot size={24} /></div>
                            <h3 className="lp-card__title">ڕۆڵگێڕان لەگەڵ AI</h3>
                            <p className="lp-card__desc">
                                سیناریۆی واقیعی هەڵبژێرە و لەگەڵ زیرەکی دەستکرد بە دەنگ قسە بکە. وەک ئەوەی لەگەڵ کەسێکی ڕاستەقینە قسە بکەیت.
                            </p>
                            <div className="lp-card__tags">
                                <span className="lp-tag"><MessageCircle size={12} /> قاوەخانە</span>
                                <span className="lp-tag"><Landmark size={12} /> هوتێل</span>
                                <span className="lp-tag"><BookOpen size={12} /> چێشتخانە</span>
                                <span className="lp-tag"><Globe size={12} /> فڕۆکەخانە</span>
                            </div>
                        </div>

                        <div className="lp-card" data-accent="gold">
                            <div className="lp-card__icon"><Flame size={24} /></div>
                            <h3 className="lp-card__title">ڕۆژانە بەردەوام بە</h3>
                            <p className="lp-card__desc">سیستەمی ڕۆژ لەسەریەک چالاک بکە و خەڵاتەکانت وەربگرە</p>
                            <div className="lp-card__streak-row">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="lp-streak-dot lp-streak-dot--on">
                                        <Flame size={14} />
                                    </div>
                                ))}
                                {[6, 7].map(i => (
                                    <div key={i} className="lp-streak-dot lp-streak-dot--off">
                                        <Target size={12} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lp-card" data-accent="blue">
                            <div className="lp-card__icon"><BookOpen size={24} /></div>
                            <h3 className="lp-card__title">وانەی زیرەکانە</h3>
                            <p className="lp-card__desc">وانەکان لەسەر ئاستی تۆ دانراون و هەنگاو بەهەنگاو پێت فێر دەکات</p>
                            <div className="lp-ring">
                                <svg viewBox="0 0 80 80">
                                    <circle className="lp-ring__bg" cx="40" cy="40" r="35" />
                                    <circle className="lp-ring__fill" cx="40" cy="40" r="35" />
                                </svg>
                            </div>
                        </div>

                        <div className="lp-card" data-accent="purple">
                            <div className="lp-card__icon"><Gamepad2 size={24} /></div>
                            <h3 className="lp-card__title">یاری و ڕاهێنان</h3>
                            <p className="lp-card__desc">بە یاری تایپکردن، نیورۆماچ و یاری ئەفیرانەوەیی فێربوون خۆشتر بکە</p>
                            <div className="lp-card__tags">
                                <span className="lp-tag"><Zap size={12} /> Space Typing</span>
                                <span className="lp-tag"><Sparkles size={12} /> NeuroMatch</span>
                                <span className="lp-tag"><Target size={12} /> Typing Rush</span>
                            </div>
                        </div>

                        <div className="lp-card lp-card--wide" data-accent="teal">
                            <div className="lp-card__icon"><Mic size={24} /></div>
                            <h3 className="lp-card__title">بە دەنگ فێربە</h3>
                            <p className="lp-card__desc">
                                بە تەکنەلۆجیای ناسینەوەی دەنگ و وتنەوەی AI ـ گوێبیست بە و قسە بکە. گوێت لە دەربڕینی ڕاست دەگرێت و هاوکات یارمەتیت دەدات.
                            </p>
                            <div className="lp-card__tags">
                                <span className="lp-tag"><Mic size={12} /> ناسینەوەی دەنگ</span>
                                <span className="lp-tag"><Volume2 size={12} /> خوێندنەوەی AI</span>
                                <span className="lp-tag"><PenTool size={12} /> تێبینی ڕێنووس</span>
                            </div>
                        </div>

                        <div className="lp-card" data-accent="red">
                            <div className="lp-card__icon"><BookText size={24} /></div>
                            <h3 className="lp-card__title">فەرهەنگ</h3>
                            <p className="lp-card__desc">فەرهەنگی بەهێز بۆ گەڕان لە وشە و دەستەواژە لە کوردی و ئینگلیزی</p>
                        </div>
                    </div>
                </section>

                {/* ═══ HOW IT WORKS ═══ */}
                <section className="lp-section lp-section--center" style={{ position: 'relative' }}>
                    <img
                        src="/charcter svg/book.svg"
                        alt="KurdLingo Book Mascot"
                        className="lp-mascot lp-mascot--steps"
                    />
                    <div className="lp-steps-header">
                        <span className="lp-section__label">چۆن کار دەکات</span>
                        <h2 className="lp-section__title">لە ٣ هەنگاودا دەست بە فێربوون بکە</h2>
                    </div>
                    <div className="lp-steps">
                        <div className="lp-step">
                            <div className="lp-step__num">١</div>
                            <h3 className="lp-step__title">تۆمارکردن</h3>
                            <p className="lp-step__desc">بە خۆڕایی تۆمار بکە و ئاستی خۆت دیاری بکە. هیچ پارەیەک پێویست نییە.</p>
                        </div>
                        <div className="lp-step">
                            <div className="lp-step__num">٢</div>
                            <h3 className="lp-step__title">فێربوون</h3>
                            <p className="lp-step__desc">وانەی ئینتەراکتیڤ، ڕۆڵگێڕان لەگەڵ AI و یاری فێرکاری تەواو بکە.</p>
                        </div>
                        <div className="lp-step">
                            <div className="lp-step__num">٣</div>
                            <h3 className="lp-step__title">پەرەسەندن</h3>
                            <p className="lp-step__desc">ئاستت بەرز بکە، خاڵ کۆبکەرەوە و بە متمانە بە ئینگلیزی قسە بکە.</p>
                        </div>
                    </div>
                </section>

                {/* ═══ STATS ═══ */}
                <section className="lp-stats">
                    <div className="lp-stats__grid">
                        <div className="lp-stat-item">
                            <div className="lp-stat__value">١٠<b>K+</b></div>
                            <div className="lp-stat__label">فێرخوازی چالاک</div>
                        </div>
                        <div className="lp-stat-item">
                            <div className="lp-stat__value">٥٠٠<b>+</b></div>
                            <div className="lp-stat__label">وانەی ئینتەراکتیڤ</div>
                        </div>
                        <div className="lp-stat-item">
                            <div className="lp-stat__value">٧<b>+</b></div>
                            <div className="lp-stat__label">سیناریۆی ڕۆڵگێڕان</div>
                        </div>
                        <div className="lp-stat-item">
                            <div className="lp-stat__value">٤.٩<b>/٥</b></div>
                            <div className="lp-stat__label">هەڵسەنگاندنی بەکارهێنەران</div>
                        </div>
                    </div>
                </section>

                {/* ═══ TESTIMONIALS ═══ */}
                <section className="lp-section lp-section--center">
                    <div className="lp-reviews-header">
                        <span className="lp-section__label">بۆچوونی بەکارهێنەران</span>
                        <h2 className="lp-section__title">خەڵکی چی دەڵێن؟</h2>
                        <p className="lp-section__desc">
                            هەزاران فێرخواز بە کوردلینگۆ توانیویانە زمانی ئینگلیزی فێر ببن
                        </p>
                    </div>

                    <div className="lp-reviews">
                        <div className="lp-review">
                            <div className="lp-review__stars">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={15} fill="currentColor" />)}
                            </div>
                            <p className="lp-review__text">
                                «کوردلینگۆ وای لێکردم حەزم بە فێربوونی زمان بکاتەوە. ڕۆڵگێڕان لەگەڵ AI شتێکی نایابە و فێربوون بە دەنگ زۆر سەرنجڕاکێشە.»
                            </p>
                            <div className="lp-review__author">
                                <div className="lp-review__avatar lp-review__avatar--green">ش</div>
                                <div>
                                    <p className="lp-review__name">شاناز ئەحمەد</p>
                                    <p className="lp-review__role">خوێندکاری زانکۆ · هەولێر</p>
                                </div>
                            </div>
                        </div>

                        <div className="lp-review">
                            <div className="lp-review__stars">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={15} fill="currentColor" />)}
                            </div>
                            <p className="lp-review__text">
                                «باشترین ئەپی فێربوونی زمانی ئینگلیزییە. وانەکانی زۆر ئاسان و خۆشن. یاریەکانیشی نایابن و زمان فێردەبیت بێ ئەوەی هەست بە ماندووبوون بکەیت.»
                            </p>
                            <div className="lp-review__author">
                                <div className="lp-review__avatar lp-review__avatar--blue">ک</div>
                                <div>
                                    <p className="lp-review__name">کارزان عومەر</p>
                                    <p className="lp-review__role">مامۆستا · سلێمانی</p>
                                </div>
                            </div>
                        </div>

                        <div className="lp-review">
                            <div className="lp-review__stars">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={15} fill="currentColor" />)}
                            </div>
                            <p className="lp-review__text">
                                «لە ٣ مانگدا توانیم بە ئاسانی بە ئینگلیزی گفتوگۆ بکەم. سوپاس کوردلینگۆ بۆ ئەم ئەپە سەرسوڕهێنەرە.»
                            </p>
                            <div className="lp-review__author">
                                <div className="lp-review__avatar lp-review__avatar--purple">ل</div>
                                <div>
                                    <p className="lp-review__name">لانا حەسەن</p>
                                    <p className="lp-review__role">پەرەپێدەری ئەپ · دهۆک</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ CTA ═══ */}
                <section className="lp-cta">
                    <div className="lp-cta__glow" />
                    <img
                        src="/charcter svg/bear.svg"
                        alt="KurdLingo Mascot Celebrating"
                        className="lp-mascot lp-mascot--cta"
                    />
                    <div className="lp-cta__inner">
                        <h2 className="lp-cta__title">ئامادەیت فێربوون دەست پێبکەیت؟</h2>
                        <p className="lp-cta__desc">
                            ئێستا بە خۆڕایی دەستپێبکە و ببە بە یەکێک لە هەزاران فێرخوازی کوردلینگۆ
                        </p>
                        <button className="lp-cta__button" onClick={() => navigate('/login')}>
                            <ArrowLeft size={18} />
                            دەستپێبکە — خۆڕاییە
                        </button>
                    </div>
                </section>

                {/* ═══ FOOTER ═══ */}
                <footer className="lp-footer">
                    <div className="lp-footer__inner">
                        <div className="lp-footer__brand">
                            <div className="lp-footer__logo">K</div>
                            <span className="lp-footer__name">KurdLingo</span>
                        </div>
                        <div className="lp-footer__links">
                            <a href="#">دەربارە</a>
                            <a href="#">پەیوەندی</a>
                            <a href="#">یارمەتی</a>
                            <a href="#">مافی تایبەتی</a>
                        </div>
                        <span className="lp-footer__copy">© ٢٠٢٦ کوردلینگۆ</span>
                    </div>
                </footer>

            </div>
        </div>
    );
}
