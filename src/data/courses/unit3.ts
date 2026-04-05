import { Unit } from '../../types';

export const unit3: Unit = {
    id: 'unit-3',
    title: 'سێیەمین یەکە',
    description: 'کەلتوور، کار و گەشت',
    guidebook: {
        introduction: "لەم بەشەدا فێری چەمکە پێشکەوتووەکان دەبیت وەک گەشتکردن، کارکردن و کەلتوور. هەروەها فێردەبیت چۆن باسی داهاتوو بکەیت، داواکاری بە ڕێزەوە پێشکەش بکەیت، و باسی تەکنەلۆژیا بکەیت.",
        sections: [
            {
                id: "grammar",
                title: "📚 ڕێزمانی داهاتوو و داواکاری",
                content: "چۆن باسی داهاتوو بکەین و بە ڕێزەوە داوا بکەین:",
                subsections: [
                    {
                        subtitle: "داهاتوو (Future Tense)",
                        text: "بۆ داهاتوو وشەی 'Will' (دە-) بەکاردێنین:",
                        visual: {
                            type: "sentence-structure",
                            data: {
                                english: [
                                    { word: "I", label: "Subject", color: "#ef4444" },
                                    { word: "Will", label: "Future", color: "#f59e0b" },
                                    { word: "Go", label: "Verb", color: "#3b82f6" }
                                ],
                                kurdish: [
                                    { word: "من", label: "بکەر", color: "#ef4444" },
                                    { word: "دە", label: "داهاتوو", color: "#f59e0b" },
                                    { word: "ڕۆم", label: "کردار", color: "#3b82f6" }
                                ]
                            }
                        }
                    },
                    {
                        subtitle: "داواکاری بە ڕێزەوە (Polite Requests)",
                        text: "لە جیاتی 'I want' (دەمەوێت)، باشترە بڵێیت 'I would like' (حەز دەکەم/دەمەوێت بە ڕێزەوە):",
                        list: [
                            "I would like tea (چام دەوێت)",
                            "I would like to order (دەمەوێت داوا بکەم)",
                            "Could you help me? (دەتوانیت یارمەتیم بدەیت؟)"
                        ]
                    }
                ]
            },
            {
                id: "vocabulary",
                title: "💼 کار و پیشەکان",
                content: "وشە گرنگەکانی شوێنی کار:",
                visual: {
                    type: "pronoun-grid",
                    data: [
                        { english: "Doctor", kurdish: "پزیشک", icon: "👨‍⚕️" },
                        { english: "Engineer", kurdish: "ئەندازیار", icon: "👷" },
                        { english: "Teacher", kurdish: "مامۆستا", icon: "👩‍🏫" },
                        { english: "Lawyer", kurdish: "پارێزەر", icon: "⚖️" },
                        { english: "Office", kurdish: "نووسینگە", icon: "🏢" },
                        { english: "Meeting", kurdish: "کۆبوونەوە", icon: "🤝" }
                    ]
                }
            },
            {
                id: "idioms",
                title: "💡 پەندی پێشینان (Idioms)",
                content: "دەستەواژە باوەکان کە مانای تایبەتیان هەیە:",
                visual: {
                    type: "comparison",
                    data: [
                        { english: "You're welcome", kurdish: "سەر چاو", icon: "👁️" },
                        { english: "Good job / Hello", kurdish: "ماندوو نەبیت", icon: "💪" },
                        { english: "My dear", kurdish: "قوربان", icon: "❤️" }
                    ]
                }
            },
            {
                id: "culture",
                title: "🎉 جەژن و بۆنەکان",
                content: "کوردستان چەندین بۆنەی تایبەتی هەیە:",
                visual: {
                    type: "timeline",
                    data: [
                        { label: "Newroz", sub: "نەورۆز (٢١ی ئازار)" },
                        { label: "Eid", sub: "جەژن" },
                        { label: "Wedding", sub: "زەماوەند" },
                        { label: "Picnic", sub: "سەیران" }
                    ]
                }
            },
            {
                id: "travel",
                title: "✈️ گەشت و هۆتێل",
                content: "وشەکانی فڕۆکەخانە و مانەوە:",
                visual: {
                    type: "dialogue",
                    data: [
                        { speaker: "A", avatar: "💁‍♂️", english: "Do you have a reservation?", kurdish: "ئایا حجرت هەیە؟" },
                        { speaker: "B", avatar: "🧔", english: "Yes, under the name Azad.", kurdish: "بەڵێ، بە ناوی ئازاد." },
                        { speaker: "A", avatar: "💁‍♂️", english: "Here is your key.", kurdish: "فەرموو کلیلەکەت." },
                        { speaker: "B", avatar: "🧔", english: "Thank you.", kurdish: "سوپاس." }
                    ]
                }
            },
            {
                id: "emergency",
                title: "🚨 ژمارە فریاگوزارییەکان",
                content: "ژمارە گرنگەکان لە کاتی پێویستدا:",
                visual: {
                    type: "pronoun-grid",
                    data: [
                        { english: "Police (104)", kurdish: "پۆلیس", icon: "👮" },
                        { english: "Ambulance (122)", kurdish: "فریاکەوتن", icon: "🚑" },
                        { english: "Fire (115)", kurdish: "ئاگرکوژێنەوە", icon: "🚒" }
                    ]
                }
            },
            {
                id: "tech",
                title: "📱 تەکنەلۆژیا و سۆشیال میدیا",
                content: "وشەکانی ڕۆژانە بۆ مۆبایل و ئینتەرنێت:",
                list: [
                    "Download (داگرتن)",
                    "Upload (بارکردن)",
                    "Password (وشەی نهێنی)",
                    "Screen (شاشە)",
                    "Battery (پاتری)",
                    "Follow (فۆڵۆ)",
                    "Like (لایك)",
                    "Share (شێر)"
                ]
            }
        ],
        keyPhrases: [
            { english: "I would like...", kurdish: "دەمەوێت... (بە ڕێزەوە)", pronunciation: "ئای ود لایک..." },
            { english: "The bill, please", kurdish: "حیسابەکە، تکایە", pronunciation: "زە بیڵ، پلیز" },
            { english: "Where is the airport?", kurdish: "فڕۆکەخانەکە لە کوێیە؟", pronunciation: "وێر ئیز زە ئێرپۆرت؟" },
            { english: "My battery is dead", kurdish: "شەحنم نەماوە", pronunciation: "مای باتری ئیز دێد" },
            { english: "Happy Newroz!", kurdish: "نەورۆزتان پیرۆز!", pronunciation: "هاپی نەورۆز" },
            { english: "Can you help me?", kurdish: "دەتوانیت یارمەتیم بدەیت؟", pronunciation: "کان یو هێڵپ می؟" }
        ]
    },
    lessons: [
        {
            id: 'unit3-lesson1',
            title: 'Food & Dining',
            icon: '🍽️',
            exercises: [
                {
                    type: 'multiple-choice',
                    question: 'What is "Restaurant" in Kurdish?',
                    options: [
                        { text: 'چێشتخانە', image: '🍽️', correct: true },
                        { text: 'چایخانە', image: '☕', correct: false },
                        { text: 'نانەواخانە', image: '🍞', correct: false },
                        { text: 'خواردن', image: '🍴', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'خواردن', english: 'Food/Eating' },
                        { kurdish: 'خواردنەوە', english: 'Drinking' },
                        { kurdish: 'تام', english: 'Taste' },
                        { kurdish: 'برسی', english: 'Hunger' },
                        { kurdish: 'تینوویەتی', english: 'Thirst' }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "I would like to order food"',
                    sourceText: 'I would like to order food',
                    correctSentence: ['من', 'دەمەوێت', 'خواردن', 'داوا', 'بکەم'],
                    options: ['من', 'دەمەوێت', 'خواردن', 'داوا', 'بکەم', 'بخۆم', 'بکڕم']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "This food is very ___" (delicious)',
                    sentenceParts: ['ئەم', 'خواردنە', 'زۆر', '___'],
                    correctOption: 'تامدارە',
                    options: ['تامدارە', 'گرانە', 'هەرزانە', 'گەرمە']
                },
                {
                    type: 'vocabulary-grid',
                    question: 'Match Kurdish dishes with their descriptions',
                    items: [
                        { kurdish: 'دۆلمە', english: 'Stuffed vegetables', image: '🫑' },
                        { kurdish: 'کوبە', english: 'Meat & bulgur balls', image: '🥙' },
                        { kurdish: 'بریانی', english: 'Rice dish', image: '🍚' },
                        { kurdish: 'کەباب', english: 'Grilled meat', image: '🍖' }
                    ]
                },
                {
                    type: 'roleplay-chat',
                    question: 'Order food at a restaurant in English!',
                    scenario: '🍽️ You are at a restaurant. The waiter is taking your order. Order your favorite dish in English!',
                    chatMessages: [
                        { sender: 'ai', text: 'Hello and welcome! Our restaurant is famous for its kebabs. What would you like to order?', avatar: '🧑‍🍳', name: 'Waiter' },
                        { sender: 'ai', text: 'confirm: Very good! I will bring it right away. Enjoy your meal!', avatar: '🧑‍🍳', name: 'Waiter' }
                    ],
                    acceptableResponses: [
                        'I want kebab and biryani',
                        'I would like a kebab',
                        'I want to eat kebab',
                        'I want dolma',
                        'I want biryani and salad'
                    ],
                    keywordsRequired: ['want'],
                    hints: ['kebab', 'biryani', 'dolma', 'want'],
                    speechLang: 'en-US'
                },
                {
                    type: 'conversation',
                    question: 'Complete the restaurant dialogue',
                    dialogue: [
                        { speaker: 'Waiter', text: 'Hello! What would you like to eat?' },
                        { speaker: 'You', text: '___', options: ['I want kebab and biryani', 'I am fine', 'Thank you'] },
                        { speaker: 'Waiter', text: 'Okay, what would you like to drink?' },
                        { speaker: 'You', text: '___', options: ['I want ayran', 'No', 'Goodbye'] }
                    ],
                    correctOptions: ['I want kebab and biryani', 'I want ayran']
                },
                {
                    type: 'typing',
                    question: 'Type in Kurdish: "The bill, please"',
                    correctAnswer: 'حیسابەکە تکایە',
                    hints: ['حیساب', 'تکایە']
                },
                {
                    type: 'multiple-choice',
                    question: 'How do you say "Breakfast"?',
                    options: [
                        { text: 'تایبەت', image: '🍳', correct: true },
                        { text: 'نانی نیوەڕۆ', image: '🍱', correct: false },
                        { text: 'شێوانە', image: '🍽️', correct: false },
                        { text: 'خواردن', image: '🍴', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'چای', english: 'Tea' },
                        { kurdish: 'قاوە', english: 'Coffee' },
                        { kurdish: 'شیر', english: 'Milk' },
                        { kurdish: 'ئاو', english: 'Water' },
                        { kurdish: 'دۆغ', english: 'Yogurt drink' }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "I am vegetarian"',
                    sourceText: 'I am vegetarian',
                    correctSentence: ['من', 'ڕووەکخۆرم'],
                    options: ['من', 'ڕووەکخۆرم', 'گۆشتخۆرم', 'برسیمە', 'تێرم']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "Do you have ___ food?" (spicy)',
                    sentenceParts: ['ئایا', 'خواردنی', '___', 'تان', 'هەیە', '؟'],
                    correctOption: 'تیژ',
                    options: ['تیژ', 'شیرین', 'سوور', 'ترش']
                },
                {
                    type: 'cultural-note',
                    question: 'Learn about Kurdish tea culture',
                    content: 'In Kurdish culture, tea (چای) is served throughout the day and is a symbol of hospitality. It is typically served in small glasses with sugar cubes.',
                    quiz: {
                        question: 'What does tea symbolize in Kurdish culture?',
                        options: ['Hospitality', 'Wealth', 'Power', 'Youth'],
                        correct: 'Hospitality'
                    }
                },
                {
                    type: 'multiple-choice',
                    question: 'What is "Bill" in Kurdish?',
                    options: [
                        { text: 'حیساب', image: '🧾', correct: true },
                        { text: 'پارە', image: '💵', correct: false },
                        { text: 'مێز', image: '🪑', correct: false }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "The tea is hot"',
                    sourceText: 'The tea is hot',
                    correctSentence: ['چایەکە', 'گەرمە'],
                    options: ['چایەکە', 'گەرمە', 'ساردە', 'خۆشە']
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'کەوچک', english: 'Spoon' },
                        { kurdish: 'چەتەڵ', english: 'Fork' },
                        { kurdish: 'چەقۆ', english: 'Knife' },
                        { kurdish: 'قاپ', english: 'Plate' }
                    ]
                }
            ]
        },
        {
            id: 'unit3-lesson2',
            title: 'Holidays & Traditions',
            icon: '🎉',
            exercises: [
                {
                    type: 'multiple-choice',
                    question: 'What is "Newroz" (Kurdish New Year)?',
                    options: [
                        { text: 'نەورۆز', image: '🔥', correct: true },
                        { text: 'جەژن', image: '🎊', correct: false },
                        { text: 'ئاهەنگ', image: '🎉', correct: false },
                        { text: 'بایرام', image: '🎈', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'نەورۆز', english: 'Kurdish New Year' },
                        { kurdish: 'جەژن', english: 'Festival/Celebration' },
                        { kurdish: 'ئاهەنگ', english: 'Party/Event' },
                        { kurdish: 'ڕێز', english: 'Respect' },
                        { kurdish: 'نەریت', english: 'Tradition' }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "Happy Newroz!"',
                    sourceText: 'Happy Newroz!',
                    correctSentence: ['نەورۆزتان', 'پیرۆز', 'بێت', '!'],
                    options: ['نەورۆزتان', 'پیرۆز', 'بێت', '!', 'جەژنتان', 'خۆش']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "We celebrate ___ on March 21st"',
                    sentenceParts: ['ئێمە', '___', 'لە', 'بیست', 'و', 'یەکی', 'ئازار', 'دەگێڕین'],
                    correctOption: 'نەورۆز',
                    options: ['نەورۆز', 'جەژن', 'ئاهەنگ', 'بایرام']
                },
                {
                    type: 'cultural-timeline',
                    question: 'Order these Kurdish celebrations chronologically',
                    events: [
                        { name: 'نەورۆز', date: 'March 21', order: 1 },
                        { name: 'ڕەمەزان', date: 'Variable', order: 2 },
                        { name: 'جەژنی قوربان', date: 'Variable', order: 3 }
                    ]
                },
                {
                    type: 'typing',
                    question: 'Type in Kurdish: "Traditional dance"',
                    correctAnswer: 'هەڵپەڕکێ',
                    hints: ['هەڵپەڕکێ']
                },
                {
                    type: 'multiple-choice',
                    question: 'What is "Wedding" in Kurdish?',
                    options: [
                        { text: 'زەماوەند', image: '💒', correct: true },
                        { text: 'جەژن', image: '🎉', correct: false },
                        { text: 'ئاهەنگ', image: '🎊', correct: false },
                        { text: 'خوازبێنی', image: '💍', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'زەماوەند', english: 'Wedding' },
                        { kurdish: 'خوازبێنی', english: 'Engagement' },
                        { kurdish: 'بووک', english: 'Bride' },
                        { kurdish: 'زاوا', english: 'Groom' }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "I love Kurdish music"',
                    sourceText: 'I love Kurdish music',
                    correctSentence: ['من', 'مۆسیقای', 'کوردیم', 'خۆشدەوێت'],
                    options: ['من', 'مۆسیقای', 'کوردیم', 'خۆشدەوێت', 'ڕقم', 'لێیە']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "Kurdish ___ is very colorful"',
                    sentenceParts: ['جلوبەرگی', 'کوردی', 'زۆر', '___'],
                    correctOption: 'ڕەنگاوڕەنگە',
                    options: ['ڕەنگاوڕەنگە', 'ڕەشە', 'سپیە', 'گرانە']
                },
                {
                    type: 'image-match',
                    question: 'Match Kurdish cultural items',
                    pairs: [
                        { image: '🎵', kurdish: 'مۆسیقا' },
                        { image: '💃', kurdish: 'هەڵپەڕکێ' },
                        { image: '👗', kurdish: 'جلوبەرگ' },
                        { image: '🔥', kurdish: 'ئاگر' }
                    ]
                },
                {
                    type: 'story-completion',
                    question: 'Complete the Newroz story',
                    story: 'نەورۆز جەژنی نوێیە لە کوردستان. خەڵکی کورد ___ دەسووتێنن و ___ دەکەن.',
                    blanks: ['ئاگر', 'هەڵپەڕکێ'],
                    options: ['ئاگر', 'ئاو', 'هەڵپەڕکێ', 'دەنگ']
                },
                {
                    type: 'match-pairs',
                    question: 'Match traditional clothes',
                    pairs: [
                        { kurdish: 'کەوا و سەڵتە', english: 'Women\'s Suit' },
                        { kurdish: 'شەرواڵ و مرادخانی', english: 'Men\'s Suit' },
                        { kurdish: 'کڵاش', english: 'Traditional Shoes' },
                        { kurdish: 'مێزەر', english: 'Turban' }
                    ]
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "Newroz is in ___"',
                    sentenceParts: ['نەورۆز', 'لە', 'وەرزی', '___', 'دایە'],
                    correctOption: 'بەهار',
                    options: ['بەهار', 'هاوین', 'زستان', 'پایز']
                },
                {
                    type: 'multiple-choice',
                    question: 'What is "Picnic"?',
                    options: [
                        { text: 'سەیران', image: '🌳', correct: true },
                        { text: 'کار', image: '💼', correct: false },
                        { text: 'خەو', image: '😴', correct: false }
                    ]
                }
            ]
        },
        {
            id: 'unit3-lesson3',
            title: 'Work & Education',
            icon: '💼',
            exercises: [
                {
                    type: 'multiple-choice',
                    question: 'What is "Job/Work" in Kurdish?',
                    options: [
                        { text: 'کار', image: '💼', correct: true },
                        { text: 'قوتابخانە', image: '🏫', correct: false },
                        { text: 'زانکۆ', image: '🎓', correct: false },
                        { text: 'مامۆستا', image: '👨‍🏫', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'مامۆستا', english: 'Teacher' },
                        { kurdish: 'پزیشک', english: 'Doctor' },
                        { kurdish: 'ئەندازیار', english: 'Engineer' },
                        { kurdish: 'وەکیل', english: 'Lawyer' },
                        { kurdish: 'نووسەر', english: 'Writer' }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "I work as a teacher"',
                    sourceText: 'I work as a teacher',
                    correctSentence: ['من', 'وەک', 'مامۆستا', 'کار', 'دەکەم'],
                    options: ['من', 'وەک', 'مامۆستا', 'کار', 'دەکەم', 'پزیشک', 'قوتابیم']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "I study at the ___"',
                    sentenceParts: ['من', 'لە', '___', 'دەخوێنم'],
                    correctOption: 'زانکۆ',
                    options: ['زانکۆ', 'قوتابخانە', 'کتێبخانە', 'دووکان']
                },
                {
                    type: 'typing',
                    question: 'Type in Kurdish: "University"',
                    correctAnswer: 'زانکۆ',
                    hints: ['زانکۆ']
                },
                {
                    type: 'multiple-choice',
                    question: 'How do you say "Student"?',
                    options: [
                        { text: 'قوتابی', image: '👨‍🎓', correct: true },
                        { text: 'مامۆستا', image: '👨‍🏫', correct: false },
                        { text: 'کارمەند', image: '👔', correct: false },
                        { text: 'کرێکار', image: '👷', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'قوتابخانە', english: 'School' },
                        { kurdish: 'زانکۆ', english: 'University' },
                        { kurdish: 'کتێبخانە', english: 'Library' },
                        { kurdish: 'تاقیگە', english: 'Laboratory' }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "What is your profession?"',
                    sourceText: 'What is your profession?',
                    correctSentence: ['پیشەکەت', 'چییە', '؟'],
                    options: ['پیشەکەت', 'چییە', '؟', 'ناوت', 'کوێیە', 'کەی']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "I have a ___ tomorrow"',
                    sentenceParts: ['سبەی', '___', 'م', 'هەیە'],
                    correctOption: 'تاقیکردنەوە',
                    options: ['تاقیکردنەوە', 'کار', 'ئاهەنگ', 'سەردان']
                },
                {
                    type: 'roleplay-chat',
                    question: 'Answer job interview questions in English!',
                    scenario: '💼 You are in a job interview. The interviewer asks about your profession and experience. Answer professionally in English!',
                    chatMessages: [
                        { sender: 'ai', text: 'Hello and welcome! Please introduce yourself. What is your profession and how many years of experience do you have?', avatar: '👔', name: 'Interviewer' },
                        { sender: 'ai', text: 'confirm: Very good! You have good experience. When can you start working?', avatar: '👔', name: 'Interviewer' }
                    ],
                    acceptableResponses: [
                        'I am an engineer and I have five years experience',
                        'I am a teacher and I have three years experience',
                        'My profession is doctor and I have ten years experience',
                        'I am a programmer and I have four years experience'
                    ],
                    keywordsRequired: ['experience'],
                    hints: ['profession', 'experience', 'years'],
                    speechLang: 'en-US'
                },
                {
                    type: 'conversation',
                    question: 'Complete the job interview',
                    dialogue: [
                        { speaker: 'Interviewer', text: 'What is your profession?' },
                        { speaker: 'You', text: '___', options: ['I am an engineer', 'I am fine', 'Thank you'] },
                        { speaker: 'Interviewer', text: 'How many years of experience do you have?' },
                        { speaker: 'You', text: '___', options: ['Five years', 'I do not know', 'Goodbye'] }
                    ],
                    correctOptions: ['I am an engineer', 'Five years']
                },
                {
                    type: 'career-path',
                    question: 'Match education levels with Kurdish terms',
                    levels: [
                        { english: 'Elementary', kurdish: 'سەرەتایی', order: 1 },
                        { english: 'Middle School', kurdish: 'ناوەندی', order: 2 },
                        { english: 'High School', kurdish: 'ئامادەیی', order: 3 },
                        { english: 'University', kurdish: 'زانکۆ', order: 4 }
                    ]
                },
                {
                    type: 'multiple-choice',
                    question: 'What does "مووچە" mean?',
                    options: [
                        { text: 'Salary', image: '💰', correct: true },
                        { text: 'Work', image: '💼', correct: false },
                        { text: 'Office', image: '🏢', correct: false },
                        { text: 'Boss', image: '👔', correct: false }
                    ]
                },
                {
                    type: 'multiple-choice',
                    question: 'What is "Office"?',
                    options: [
                        { text: 'نووسینگە', image: '🏢', correct: true },
                        { text: 'ماڵ', image: '🏠', correct: false },
                        { text: 'چێشتخانە', image: '🍽️', correct: false }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "I go to work"',
                    sourceText: 'I go to work',
                    correctSentence: ['من', 'دەچم', 'بۆ', 'سەر', 'کار'],
                    options: ['من', 'دەچم', 'بۆ', 'سەر', 'کار', 'ماڵ', 'خەو']
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'بەڕێوبەر', english: 'Manager' },
                        { kurdish: 'هاوکار', english: 'Colleague' },
                        { kurdish: 'کۆبوونەوە', english: 'Meeting' },
                        { kurdish: 'پشوودان', english: 'Break' }
                    ]
                }
            ]
        },
        {
            id: 'unit3-lesson4',
            title: 'Travel & Transportation',
            icon: '✈️',
            exercises: [
                {
                    type: 'multiple-choice',
                    question: 'What is "Airplane" in Kurdish?',
                    options: [
                        { text: 'فڕۆکە', image: '✈️', correct: true },
                        { text: 'ئۆتۆمبێل', image: '🚗', correct: false },
                        { text: 'پاس', image: '🚌', correct: false },
                        { text: 'شەمەندەفەر', image: '🚂', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'فڕۆکە', english: 'Airplane' },
                        { kurdish: 'ئۆتۆمبێل', english: 'Car' },
                        { kurdish: 'پاس', english: 'Bus' },
                        { kurdish: 'تاکسی', english: 'Taxi' },
                        { kurdish: 'پاسکێل', english: 'Bicycle' }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "I want to book a ticket"',
                    sourceText: 'I want to book a ticket',
                    correctSentence: ['من', 'دەمەوێت', 'بلیتێک', 'حجز', 'بکەم'],
                    options: ['من', 'دەمەوێت', 'بلیتێک', 'حجز', 'بکەم', 'بکڕم', 'ببینم']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "The train arrives at ___"',
                    sentenceParts: ['شەمەندەفەر', 'لە', 'کاتژمێر', '___', 'دەگاتە'],
                    correctOption: 'حەوت',
                    options: ['حەوت', 'شەش', 'هەشت', 'نۆ']
                },
                {
                    type: 'typing',
                    question: 'Type in Kurdish: "Airport"',
                    correctAnswer: 'فڕۆکەخانە',
                    hints: ['فڕۆکەخانە']
                },
                {
                    type: 'multiple-choice',
                    question: 'How do you say "Hotel"?',
                    options: [
                        { text: 'ئوتێل', image: '🏨', correct: true },
                        { text: 'ماڵ', image: '🏠', correct: false },
                        { text: 'چێشتخانە', image: '🍽️', correct: false },
                        { text: 'دووکان', image: '🏪', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'فڕۆکەخانە', english: 'Airport' },
                        { kurdish: 'وێستگە', english: 'Station' },
                        { kurdish: 'ئوتێل', english: 'Hotel' },
                        { kurdish: 'پاسپۆرت', english: 'Passport' }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "Where is the bus station?"',
                    sourceText: 'Where is the bus station?',
                    correctSentence: ['وێستگەی', 'پاس', 'لە', 'کوێیە', '؟'],
                    options: ['وێستگەی', 'پاس', 'لە', 'کوێیە', '؟', 'فڕۆکەخانە', 'کەی']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "I need to check in at the ___"',
                    sentenceParts: ['پێویستە', 'لە', '___', 'تۆمار', 'بکەم'],
                    correctOption: 'ئوتێل',
                    options: ['ئوتێل', 'فڕۆکەخانە', 'وێستگە', 'دووکان']
                },
                {
                    type: 'roleplay-chat',
                    question: 'Check into your hotel in English!',
                    scenario: '🏨 You have arrived at a hotel. Talk to the receptionist to check in!',
                    chatMessages: [
                        { sender: 'ai', text: 'Hello and welcome to our hotel! Do you have a reservation?', avatar: '👩‍💼', name: 'Receptionist' },
                        { sender: 'ai', text: 'confirm: Very good! Here is your room key. Room 305.', avatar: '👩‍💼', name: 'Receptionist' }
                    ],
                    acceptableResponses: [
                        'Yes I have a reservation under the name Ahmed',
                        'Yes I have a reservation',
                        'I have a reservation my name is Ahmed',
                        'Hello yes I made a reservation'
                    ],
                    keywordsRequired: ['reservation'],
                    hints: ['reservation', 'name', 'yes'],
                    speechLang: 'en-US'
                },
                {
                    type: 'conversation',
                    question: 'Complete the hotel check-in',
                    dialogue: [
                        { speaker: 'Receptionist', text: 'Hello! How can I help you?' },
                        { speaker: 'You', text: '___', options: ['I have a reservation', 'I am fine', 'Goodbye'] },
                        { speaker: 'Receptionist', text: 'What is your name?' },
                        { speaker: 'You', text: '___', options: ['My name is Ahmed', 'I do not know', 'Thank you'] }
                    ],
                    correctOptions: ['I have a reservation', 'My name is Ahmed']
                },
                {
                    type: 'route-planner',
                    question: 'Plan your journey',
                    start: 'ماڵ',
                    destination: 'فڕۆکەخانە',
                    steps: [
                        { transport: 'تاکسی', duration: '15 خولەک' },
                        { transport: 'فڕۆکە', duration: '2 کاتژمێر' }
                    ]
                },
                {
                    type: 'emergency-phrases',
                    question: 'Learn important travel phrases',
                    phrases: [
                        { kurdish: 'یارمەتیم بدە!', english: 'Help me!', situation: 'Emergency' },
                        { kurdish: 'ونم بووە', english: 'I am lost', situation: 'Navigation' },
                        { kurdish: 'پۆلیس بانگ بکە', english: 'Call the police', situation: 'Emergency' }
                    ],
                    quiz: {
                        question: 'How do you say "I am lost"?',
                        options: ['ونم بووە', 'یارمەتیم بدە', 'باشم'],
                        correct: 'ونم بووە'
                    }
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'فڕین', english: 'To Fly' },
                        { kurdish: 'لێخوڕین', english: 'To Drive' },
                        { kurdish: 'ڕۆیشتن', english: 'To Walk' },
                        { kurdish: 'گەیشتن', english: 'To Arrive' }
                    ]
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "The plane is ___"',
                    sentenceParts: ['فڕۆکەکە', '___'],
                    correctOption: 'خێرایە',
                    options: ['خێرایە', 'هێواشە', 'بچووکە']
                },
                {
                    type: 'multiple-choice',
                    question: 'What is "Ticket"?',
                    options: [
                        { text: 'بلیت', image: '🎫', correct: true },
                        { text: 'پاسپۆرت', image: '🛂', correct: false },
                        { text: 'جانتا', image: '🎒', correct: false }
                    ]
                }
            ]
        },
        {
            id: 'unit3-lesson5',
            title: 'Technology & Modern Life',
            icon: '📱',
            exercises: [
                {
                    type: 'multiple-choice',
                    question: 'What is "Mobile Phone" in Kurdish?',
                    options: [
                        { text: 'مۆبایل', image: '📱', correct: true },
                        { text: 'کۆمپیوتەر', image: '💻', correct: false },
                        { text: 'تەلەفزیۆن', image: '📺', correct: false },
                        { text: 'ئینتەرنێت', image: '🌐', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'مۆبایل', english: 'Mobile Phone' },
                        { kurdish: 'کۆمپیوتەر', english: 'Computer' },
                        { kurdish: 'ئینتەرنێت', english: 'Internet' },
                        { kurdish: 'ئیمەیل', english: 'Email' },
                        { kurdish: 'وێبسایت', english: 'Website' }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "I use social media every day"',
                    sourceText: 'I use social media every day',
                    correctSentence: ['من', 'هەموو', 'ڕۆژێک', 'سۆشیال', 'میدیا', 'بەکاردەهێنم'],
                    options: ['من', 'هەموو', 'ڕۆژێک', 'سۆشیال', 'میدیا', 'بەکاردەهێنم', 'دەبینم', 'دەکڕم']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "Can you send me the ___?" (link)',
                    sentenceParts: ['دەتوانیت', '___', 'بۆ', 'بنێریت', '؟'],
                    correctOption: 'لینک',
                    options: ['لینک', 'ئیمەیل', 'مۆبایل', 'ناو']
                },
                {
                    type: 'typing',
                    question: 'Type in Kurdish: "Password"',
                    correctAnswer: 'وشەی نهێنی',
                    hints: ['وشەی', 'نهێنی']
                },
                {
                    type: 'multiple-choice',
                    question: 'How do you say "Download"?',
                    options: [
                        { text: 'داگرتن', image: '⬇️', correct: true },
                        { text: 'بارکردن', image: '⬆️', correct: false },
                        { text: 'سڕینەوە', image: '🗑️', correct: false },
                        { text: 'کردنەوە', image: '📂', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'داگرتن', english: 'Download' },
                        { kurdish: 'بارکردن', english: 'Upload' },
                        { kurdish: 'سڕینەوە', english: 'Delete' },
                        { kurdish: 'پاشەکەوتکردن', english: 'Save' }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "My phone battery is dead"',
                    sourceText: 'My phone battery is dead',
                    correctSentence: ['باتریی', 'مۆبایلەکەم', 'تەواوبووە'],
                    options: ['باتریی', 'مۆبایلەکەم', 'تەواوبووە', 'پڕە', 'نوێیە', 'کۆنە']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "I need to charge my ___"',
                    sentenceParts: ['پێویستە', '___', 'م', 'چارج', 'بکەم'],
                    correctOption: 'مۆبایل',
                    options: ['مۆبایل', 'کۆمپیوتەر', 'کارت', 'کتێب']
                },
                {
                    type: 'app-vocabulary',
                    question: 'Match apps with their Kurdish names',
                    apps: [
                        { icon: '💬', english: 'WhatsApp', kurdish: 'واتساپ' },
                        { icon: '📘', english: 'Facebook', kurdish: 'فەیسبووک' },
                        { icon: '📷', english: 'Instagram', kurdish: 'ئینستاگرام' },
                        { icon: '🐦', english: 'Twitter', kurdish: 'تویتەر' }
                    ]
                },
                {
                    type: 'tech-troubleshooting',
                    question: 'Match problems with solutions',
                    problems: [
                        { issue: 'ئینتەرنێت کار ناکات', solution: 'WiFi چەک بکە' },
                        { issue: 'باتری تەواوە', solution: 'چارجی بکە' },
                        { issue: 'وشەی نهێنیم لەبیرکردووە', solution: 'Reset بکە' }
                    ]
                },
                {
                    type: 'conversation',
                    question: 'Complete the tech support dialogue',
                    dialogue: [
                        { speaker: 'Support', text: 'What is your problem?' },
                        { speaker: 'You', text: '___', options: ['My internet is not working', 'I am fine', 'Thank you'] },
                        { speaker: 'Support', text: 'Did you check the WiFi?' },
                        { speaker: 'You', text: '___', options: ['Yes, but it is not working', 'No', 'I do not know'] }
                    ],
                    correctOptions: ['My internet is not working', 'Yes, but it is not working']
                },
                {
                    type: 'typing',
                    question: 'Type in Kurdish: "Screen"',
                    correctAnswer: 'شاشە',
                    hints: ['شاشە']
                },
                {
                    type: 'multiple-choice',
                    question: 'What is "Battery"?',
                    options: [
                        { text: 'پاتری', image: '🔋', correct: true },
                        { text: 'مۆبایل', image: '📱', correct: false },
                        { text: 'وایفای', image: '📶', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'نامە', english: 'Message' },
                        { kurdish: 'پەیوەندی', english: 'Call' },
                        { kurdish: 'وێنە', english: 'Photo' },
                        { kurdish: 'ڤیدیۆ', english: 'Video' }
                    ]
                }
            ]
        },
        {
            id: 'unit3-lesson6',
            title: 'Body Parts & Appearance',
            icon: '🧍',
            exercises: [
                {
                    type: 'multiple-choice',
                    question: 'What is "Head" in Kurdish?',
                    options: [
                        { text: 'سەر', image: '🧠', correct: true },
                        { text: 'دەست', image: '🤚', correct: false },
                        { text: 'پێ', image: '🦶', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'سەر', english: 'Head' },
                        { kurdish: 'دەست', english: 'Hand' },
                        { kurdish: 'چاو', english: 'Eye' },
                        { kurdish: 'گوێ', english: 'Ear' }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "I have brown eyes"',
                    sourceText: 'I have brown eyes',
                    correctSentence: ['چاوم', 'قاوەیییە'],
                    options: ['چاوم', 'قاوەیییە', 'سەوزە', 'شینە', 'سەرم']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "She has long ___" (hair)',
                    sentenceParts: ['قژی', '___', 'یە'],
                    correctOption: 'درێژ',
                    options: ['درێژ', 'کورت', 'ڕەش', 'سوور']
                },
                {
                    type: 'multiple-choice',
                    question: 'How do you say "Tall"?',
                    options: [
                        { text: 'بەرز', image: '📏', correct: true },
                        { text: 'کورت', image: '📐', correct: false },
                        { text: 'قەڵەو', image: '🔵', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'قژ', english: 'Hair' },
                        { kurdish: 'دەم', english: 'Mouth' },
                        { kurdish: 'لووت', english: 'Nose' },
                        { kurdish: 'پەنجە', english: 'Finger' }
                    ]
                },
                {
                    type: 'typing',
                    question: 'Type in Kurdish: "Shoulder"',
                    correctAnswer: 'شان',
                    hints: ['شان']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "He is ___ and strong" (tall)',
                    sentenceParts: ['ئەو', '___', 'و', 'بەهێزە'],
                    correctOption: 'بەرز',
                    options: ['بەرز', 'کورت', 'لاواز', 'پیر']
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "My hand hurts"',
                    sourceText: 'My hand hurts',
                    correctSentence: ['دەستم', 'ئێشێت'],
                    options: ['دەستم', 'ئێشێت', 'سەرم', 'باشە', 'پێم']
                },
                {
                    type: 'multiple-choice',
                    question: 'What is "Knee" in Kurdish?',
                    options: [
                        { text: 'ئەژنۆ', image: '🦵', correct: true },
                        { text: 'پێ', image: '🦶', correct: false },
                        { text: 'مل', image: '🧣', correct: false }
                    ]
                }
            ]
        },
        {
            id: 'unit3-lesson7',
            title: 'Nature & Environment',
            icon: '🏔️',
            exercises: [
                {
                    type: 'multiple-choice',
                    question: 'What is "Mountain" in Kurdish?',
                    options: [
                        { text: 'چیا', image: '🏔️', correct: true },
                        { text: 'دەریا', image: '🌊', correct: false },
                        { text: 'دار', image: '🌳', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'چیا', english: 'Mountain' },
                        { kurdish: 'ڕووبار', english: 'River' },
                        { kurdish: 'دار', english: 'Tree' },
                        { kurdish: 'دەریاچە', english: 'Lake' }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "The mountain is very high"',
                    sourceText: 'The mountain is very high',
                    correctSentence: ['چیاکە', 'زۆر', 'بەرزە'],
                    options: ['چیاکە', 'زۆر', 'بەرزە', 'نزمە', 'گەورەیە', 'ڕووبارەکە']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "There are many ___ in Kurdistan" (trees)',
                    sentenceParts: ['لە', 'کوردستان', 'زۆر', '___', 'هەیە'],
                    correctOption: 'دار',
                    options: ['دار', 'چیا', 'دەریا', 'ئاسمان']
                },
                {
                    type: 'multiple-choice',
                    question: 'How do you say "Sky"?',
                    options: [
                        { text: 'ئاسمان', image: '🌤️', correct: true },
                        { text: 'زەمین', image: '🌍', correct: false },
                        { text: 'دەریا', image: '🌊', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'ئاسمان', english: 'Sky' },
                        { kurdish: 'هەتاو', english: 'Sun' },
                        { kurdish: 'مانگ', english: 'Moon' },
                        { kurdish: 'ستێرە', english: 'Star' }
                    ]
                },
                {
                    type: 'typing',
                    question: 'Type in Kurdish: "Forest"',
                    correctAnswer: 'دارستان',
                    hints: ['دارستان']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "The ___ is beautiful at night" (sky)',
                    sentenceParts: ['___', 'لە', 'شەوان', 'جوانە'],
                    correctOption: 'ئاسمان',
                    options: ['ئاسمان', 'زەمین', 'دەریا', 'چیا']
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "I love nature"',
                    sourceText: 'I love nature',
                    correctSentence: ['من', 'سروشتم', 'خۆشدەوێت'],
                    options: ['من', 'سروشتم', 'خۆشدەوێت', 'ڕقم', 'لێیە', 'چیام']
                },
                {
                    type: 'multiple-choice',
                    question: 'What is "Flower" in Kurdish?',
                    options: [
                        { text: 'گوڵ', image: '🌺', correct: true },
                        { text: 'دار', image: '🌳', correct: false },
                        { text: 'بەرد', image: '🪨', correct: false }
                    ]
                }
            ]
        },
        {
            id: 'unit3-lesson8',
            title: 'Social Media & Communication',
            icon: '💬',
            exercises: [
                {
                    type: 'multiple-choice',
                    question: 'What is "Message" in Kurdish?',
                    options: [
                        { text: 'پەیام', image: '💬', correct: true },
                        { text: 'ئیمەیل', image: '📧', correct: false },
                        { text: 'ناو', image: '📛', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'پەیام', english: 'Message' },
                        { kurdish: 'پۆست', english: 'Post' },
                        { kurdish: 'لایک', english: 'Like' },
                        { kurdish: 'شێر', english: 'Share' }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "Send me a message"',
                    sourceText: 'Send me a message',
                    correctSentence: ['پەیامێکم', 'بۆ', 'بنێرە'],
                    options: ['پەیامێکم', 'بۆ', 'بنێرە', 'بنووسە', 'بخوێنەوە', 'لایک']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "I will ___ your photo" (like)',
                    sentenceParts: ['من', 'وێنەکەت', '___', 'دەکەم'],
                    correctOption: 'لایک',
                    options: ['لایک', 'شێر', 'سڕین', 'بلۆک']
                },
                {
                    type: 'multiple-choice',
                    question: 'How do you say "Phone call"?',
                    options: [
                        { text: 'پەیوەندی تەلەفۆنی', image: '📞', correct: true },
                        { text: 'پەیام', image: '💬', correct: false },
                        { text: 'ئیمەیل', image: '📧', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'فۆڵۆکردن', english: 'Follow' },
                        { kurdish: 'بلۆککردن', english: 'Block' },
                        { kurdish: 'کۆمێنت', english: 'Comment' },
                        { kurdish: 'پرۆفایل', english: 'Profile' }
                    ]
                },
                {
                    type: 'typing',
                    question: 'Type in Kurdish: "Video call"',
                    correctAnswer: 'ڤیدیۆ کۆڵ',
                    hints: ['ڤیدیۆ', 'کۆڵ']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "I ___ you on Instagram" (followed)',
                    sentenceParts: ['من', 'لەسەر', 'ئینستاگرام', '___', 'م', 'کردیت'],
                    correctOption: 'فۆڵۆ',
                    options: ['فۆڵۆ', 'بلۆک', 'لایک', 'شێر']
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "Check your notification"',
                    sourceText: 'Check your notification',
                    correctSentence: ['ئاگاداریەکانت', 'بپشکنە'],
                    options: ['ئاگاداریەکانت', 'بپشکنە', 'بنووسە', 'بخوێنەوە', 'پەیامەکانت']
                },
                {
                    type: 'multiple-choice',
                    question: 'What is "Group chat" in Kurdish?',
                    options: [
                        { text: 'گروپی گفتوگۆ', image: '👥', correct: true },
                        { text: 'پەیامی تایبەت', image: '🔒', correct: false },
                        { text: 'ستۆری', image: '📸', correct: false }
                    ]
                }
            ]
        },
        {
            id: 'unit3-lesson9',
            title: 'Sports & Hobbies',
            icon: '⚽',
            exercises: [
                {
                    type: 'multiple-choice',
                    question: 'What is "Football" in Kurdish?',
                    options: [
                        { text: 'تۆپی پێ', image: '⚽', correct: true },
                        { text: 'باسکێتبۆڵ', image: '🏀', correct: false },
                        { text: 'تەنیس', image: '🎾', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'تۆپی پێ', english: 'Football' },
                        { kurdish: 'مەلەوانی', english: 'Swimming' },
                        { kurdish: 'ڕاکردن', english: 'Running' },
                        { kurdish: 'یاری', english: 'Game' }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "I like playing football"',
                    sourceText: 'I like playing football',
                    correctSentence: ['من', 'حەز', 'لە', 'تۆپی', 'پێ', 'یاریکردن', 'دەکەم'],
                    options: ['من', 'حەز', 'لە', 'تۆپی', 'پێ', 'یاریکردن', 'دەکەم', 'بینین', 'خوێندنەوە']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "I play ___ every week" (sport)',
                    sentenceParts: ['من', 'هەموو', 'هەفتەیەک', '___', 'یاری', 'دەکەم'],
                    correctOption: 'وەرزش',
                    options: ['وەرزش', 'مۆسیقا', 'کتێب', 'کار']
                },
                {
                    type: 'multiple-choice',
                    question: 'How do you say "Team"?',
                    options: [
                        { text: 'تیم', image: '👥', correct: true },
                        { text: 'یارمەتی', image: '🤝', correct: false },
                        { text: 'هاوڕێ', image: '👫', correct: false }
                    ]
                }
            ]
        },
        {
            id: 'unit3-lesson10',
            title: 'Unit 3 Review',
            icon: '📝',
            exercises: [
                {
                    type: 'multiple-choice',
                    question: 'What is "Culture"?',
                    options: [
                        { text: 'کەلتوور', image: '🎭', correct: true },
                        { text: 'وەرزش', image: '⚽', correct: false },
                        { text: 'کار', image: '💼', correct: false }
                    ]
                },
                {
                    type: 'match-pairs', question: 'Match the pairs',
                    pairs: [
                        { kurdish: 'چیا', english: 'Mountain' },
                        { kurdish: 'فڕۆکە', english: 'Airplane' },
                        { kurdish: 'مۆبایل', english: 'Mobile' },
                        { kurdish: 'پەیام', english: 'Message' }
                    ]
                },
                {
                    type: 'sentence-builder',
                    question: 'Translate: "I love nature"',
                    sourceText: 'I love nature',
                    correctSentence: ['من', 'سروشتم', 'خۆشدەوێت'],
                    options: ['من', 'سروشتم', 'خۆشدەوێت', 'ڕقم', 'لێیە', 'کارەکەم']
                },
                {
                    type: 'fill-blank',
                    question: 'Complete: "My ___ hurts" (head)',
                    sentenceParts: ['___', 'م', 'ئێشێت'],
                    correctOption: 'سەر',
                    options: ['سەر', 'دەست', 'پێ', 'چاو']
                },
                {
                    type: 'multiple-choice',
                    question: 'Review: What is "Follow" in social media?',
                    options: [
                        { text: 'فۆڵۆکردن', image: '➕', correct: true },
                        { text: 'بلۆککردن', image: '🚫', correct: false },
                        { text: 'لایککردن', image: '❤️', correct: false }
                    ]
                }
            ]
        }
    ]
};
