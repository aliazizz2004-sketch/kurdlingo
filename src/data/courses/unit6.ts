import { Unit } from '../../types';

export const unit6: Unit = {
    id: 'unit-6',
    title: 'شەشەمین یەکە: قسەکردنی کراوە (IELTS Style)',
    description: '١٠ وانەی تاقیکردنەوەی قسەکردن بە دەنگ، هاوشێوەی تاقیکردنەوەی ئایەڵتس (IELTS)',
    guidebook: {
        introduction: "لەم یەکەیەدا، وانەی تایبەت بە قسەکردن (Speaking) هەیە هاوشێوەی تاقیکردنەوەی ئایەڵتس (IELTS Part 1). هەر پرسیارێک هیچ وەڵامێکی دیاریکراوی ڕاست یان هەڵە بوونی نییە؛ بەڵکو زیرەکی دەستکرد (Gemini) ڕێزمان، وشەسازی و گونجاوی وەڵامەکەت لەگەڵ پرسیارەکەدا هەڵدەسەنگێنێت.",
        sections: [
            {
                id: "speaking-tips",
                title: "💡 ئامۆژگاری بۆ قسەکردنی کراوە",
                content: "بۆ ئەوەی سەرکەوتوو بیت لەم وانانەدا و بە ڕەوانی قسە بکەیت، ئەم خاڵانە ڕەچاو بکە:",
                list: [
                    "بە دەنگێکی بەرز و ڕوون قسە بکە تا سیستەمەکە بە باشی تێتبگات (Speak clearly and loudly).",
                    "هەوڵ بدە لانی کەم ٢-٣ ڕستە بڵێیت. مەڵێ 'Yes' یان 'No' بەتەنیا (Try to elaborate).",
                    "مەترسە لە هەڵەکردن لە ڕێزماندا، گرنگ ئەوەیە کۆتایی بە بیرۆکەکەت بهێنیت.",
                    "کاتێک قسە دەکەیت، پەلە مەکە. بە هێواشی بڕۆ بۆ ئەوەی وشەکان ڕوون بن."
                ]
            },
            {
                id: "how-to-elaborate",
                title: "🗣️ چۆن وەڵامەکانت درێژ بکەیتەوە؟",
                content: "کاتێک پرسیارێکت لێ دەکرێت، هەوڵ بدە ئەم فۆرمۆڵەیە (Area) بەکاربهێنیت:",
                list: [
                    "A (Answer): وەڵامی پرسیارەکە بدەرەوە بە سادەیی: 'My favorite food is Pizza.'",
                    "R (Reason): هۆکارێک بهێنەوە: 'because it is very delicious and cheesy.'",
                    "E (Example): نموونەیەک یان زانیاری زیاتر بدە: 'For example, I usually eat it with my friends on weekends.'",
                    "A (Alternative): پێچەوانەکەی بڵێ یان زانیارییەکی تر: 'However, I don't like fast food every day.'"
                ],
                visual: {
                    type: "sentence-structure",
                    data: {
                        english: [
                            { word: "I love reading", label: "وەڵام (A)", color: "#1cb0f6" },
                            { word: "because", label: "هۆکار (R)", color: "#ff9600" },
                            { word: "it helps me relax.", label: "زانیاری", color: "#ce82ff" },
                            { word: "For instance,", label: "نموونە (E)", color: "#ff4b4b" },
                            { word: "I read every night.", label: "زانیاری", color: "#2dd4bf" }
                        ],
                        kurdish: [
                            { word: "حەزم لە خوێندنەوەیە", label: "وەڵام", color: "#1cb0f6" },
                            { word: "لەبەرئەوەی", label: "هۆکار", color: "#ff9600" },
                            { word: "یارمەتیم دەدات ئارام ببمەوە.", label: "زانیاری", color: "#ce82ff" },
                            { word: "بۆ نموونە،", label: "نموونە", color: "#ff4b4b" },
                            { word: "هەموو شەوێک دەخوێنمەوە.", label: "زانیاری", color: "#2dd4bf" }
                        ]
                    }
                }
            },
            {
                id: "comparison",
                title: "⚖️ وەڵامی سادە بەرامبەر وەڵامی باشتر",
                content: "تەماشای ئەم جیاوازییانە بکە لە نێوان وەڵامێکی زۆر کورت و وەڵامێکی باش کە نمرەی بەرزتر وەردەگرێت:",
                visual: {
                    type: "comparison",
                    data: [
                        { english: "- Do you like movies? - Yes, I do.", kurdish: "وەڵامێکی زۆر کورت (نەخێر مەیکە)", icon: "❌" },
                        { english: "- Do you like movies? - Yes, I really enjoy watching action movies because they are exciting.", kurdish: "وەڵامێکی باش و درێژکراوە (بەڵێ)", icon: "✅" },
                        { english: "- Where are you from? - I am from Erbil.", kurdish: "تەنها وەڵامی داواکراو", icon: "⚠️" },
                        { english: "- Where are you from? - I am from Erbil, which is a beautiful, historic city in Kurdistan.", kurdish: "پێدانی زانیاری زیاتر دەربارەی شوێنەکە", icon: "🌟" }
                    ]
                }
            },
            {
                id: "linking-words",
                title: "🔗 وشەی پێکەوەبەستن (Linking Words)",
                content: "بۆ ئەوەی قسەکردنەکەت سروشتیتر دەربکەوێت، ئەم وشانە بەکاربهێنە بۆ بەستنەوەی ڕستەکانت:",
                visual: {
                    type: "pronoun-grid",
                    data: [
                        { english: "Actually", kurdish: "لە ڕاستیدا", icon: "🗣️" },
                        { english: "Well,", kurdish: "باشە، (بۆ بیرکردنەوە)", icon: "🤔" },
                        { english: "To be honest", kurdish: "بۆ ئەوەی ڕاستگۆ بم", icon: "💯" },
                        { english: "However", kurdish: "بەڵام / هەرچەندە", icon: "🔄" },
                        { english: "Especially", kurdish: "بە تایبەتی", icon: "✨" },
                        { english: "Also", kurdish: "هەروەها", icon: "➕" }
                    ]
                }
            },
            {
                id: "example-dialogue",
                title: "💬 نموونەی گفتوگۆ (IELTS Part 1)",
                content: "گوێ لەم نموونەیە بگرە بزانە چۆن گفتوگۆیەکی سادە و باش ئەنجام دەدرێت:",
                visual: {
                    type: "dialogue",
                    data: [
                        { speaker: "A", avatar: "👩‍🏫", english: "Hello, let's talk about your hometown. Where are you from?", kurdish: "سڵاو، با باسی زێدەکەت بکەین. خەڵکی کوێیت؟" },
                        { speaker: "B", avatar: "👤", english: "I am from Sulaymaniyah, which is a beautiful city in Kurdistan. It is known as the capital of culture.", kurdish: "من خەڵکی سلێمانیم، کە شارێکی جوانە لە کوردستان. ناسراوە بە پایتەختی ڕۆشنبیری." },
                        { speaker: "A", avatar: "👩‍🏫", english: "That sounds lovely. Do you like living there?", kurdish: "زۆر خۆش دیارە. ئایا حەزت بە ژیانە لەوێ؟" },
                        { speaker: "B", avatar: "👤", english: "Yes, I really enjoy living there because the people are very friendly and the weather is nice in spring.", kurdish: "بەڵێ، بەڕاستی چێژ لە ژیان دەبینم لەوێ لەبەرئەوەی خەڵکەکەی زۆر ڕووخۆشن و کەش و هەواکەی خۆشە لە بەهاردا." }
                    ]
                }
            }
        ],
        keyPhrases: [
            { english: "In my opinion...", kurdish: "بە بڕوای من...", pronunciation: "ئین مای ئۆپینیۆن" },
            { english: "For example...", kurdish: "بۆ نموونە...", pronunciation: "فۆر ئیگزامپڵ" },
            { english: "First of all...", kurdish: "لە پێش هەموو شتێکەوە...", pronunciation: "فێرست ئۆڤ ئۆڵ" },
            { english: "Because...", kurdish: "لەبەر ئەوەی...", pronunciation: "بیکۆز" },
            { english: "Also...", kurdish: "هەروەها...", pronunciation: "ئۆڵسۆ" },
            { english: "I think that...", kurdish: "پێموایە کە...", pronunciation: "ئای سینک ذات" },
            { english: "I usually...", kurdish: "من بەگشتی/زۆرجار...", pronunciation: "ئای یوزولی" },
            { english: "In the future...", kurdish: "لە داهاتوودا...", pronunciation: "ئین زە فیوچەر" },
            { english: "To be honest...", kurdish: "بەڕاستی/بۆ ئەوەی ڕاستگۆ بم...", pronunciation: "تو بی ئۆنێست" },
            { english: "I really enjoy...", kurdish: "بەڕاستی چێژ دەبینم لە...", pronunciation: "ئای ڕیلی ئینجۆی" }
        ]
    },
    lessons: [
        {
            id: 'unit6-lesson1',
            title: '1. Introduce Yourself',
            icon: '🙋',
            type: 'regular',
            exercises: [
                {
                    type: 'roleplay-chat',
                    question: 'Talk about yourself in English.',
                    scenario: 'IELTS Speaking Part 1: You are meeting the examiner for the first time. They want to know some basic information about you. Speak for a few sentences.',
                    speechLang: 'en-US',
                    chatMessages: [
                        { sender: 'ai', text: 'Hello! I am your examiner. Let\'s start with some general questions. Please tell me about yourself and where you are from.', avatar: '👩‍🏫', name: 'Examiner' },
                        { sender: 'ai', text: 'confirm: Thank you. That was a very good introduction!', avatar: '👩‍🏫', name: 'Examiner' }
                    ],
                    acceptableResponses: [
                        'my name is', 'i am from', 'i live in', 'years old'
                    ],
                    hints: ['Try saying: "My name is... I am from... I am a student/worker..."']
                }
            ]
        },
        {
            id: 'unit6-lesson2',
            title: '2. Your Hobbies',
            icon: '🎨',
            type: 'regular',
            exercises: [
                {
                    type: 'roleplay-chat',
                    question: 'Talk about your hobbies.',
                    scenario: 'IELTS Speaking Part 1: The examiner asks you about your free time activities.',
                    speechLang: 'en-US',
                    chatMessages: [
                        { sender: 'ai', text: 'Now, let\'s talk about your free time. What is your favorite hobby, and why do you enjoy it?', avatar: '👩‍🏫', name: 'Examiner' },
                        { sender: 'ai', text: 'confirm: That sounds like a wonderful hobby. Thanks for sharing!', avatar: '👩‍🏫', name: 'Examiner' }
                    ],
                    acceptableResponses: [
                        'hobby', 'free time', 'i like to', 'favorite', 'play'
                    ],
                    hints: ['Try saying: "In my free time, I like to... because it is..."']
                }
            ]
        },
        {
            id: 'unit6-lesson3',
            title: '3. Daily Routine',
            icon: '⏰',
            type: 'regular',
            exercises: [
                {
                    type: 'roleplay-chat',
                    question: 'Describe your daily routine.',
                    scenario: 'IELTS Speaking Part 1: The examiner wants to know what you usually do every day.',
                    speechLang: 'en-US',
                    chatMessages: [
                        { sender: 'ai', text: 'Let\'s talk about a normal day in your life. What is your typical daily routine?', avatar: '👩‍🏫', name: 'Examiner' },
                        { sender: 'ai', text: 'confirm: Interesting! You seem to have a busy day.', avatar: '👩‍🏫', name: 'Examiner' }
                    ],
                    acceptableResponses: [
                        'wake up', 'go to', 'breakfast', 'usually', 'every day'
                    ],
                    hints: ['Try saying: "I usually wake up at... Then I go to..."']
                }
            ]
        },
        {
            id: 'unit6-lesson4',
            title: '4. Favorite Food',
            icon: '🍔',
            type: 'regular',
            exercises: [
                {
                    type: 'roleplay-chat',
                    question: 'Talk about your favorite food.',
                    scenario: 'IELTS Speaking Part 1: The examiner asks about the kinds of food you like to eat.',
                    speechLang: 'en-US',
                    chatMessages: [
                        { sender: 'ai', text: 'Let\'s move on to food. What is your favorite type of food, and do you like cooking?', avatar: '👩‍🏫', name: 'Examiner' },
                        { sender: 'ai', text: 'confirm: Sounds delicious! Cooking can be a lot of fun.', avatar: '👩‍🏫', name: 'Examiner' }
                    ],
                    acceptableResponses: [
                        'favorite food', 'delicious', 'i like eating', 'cook'
                    ],
                    hints: ['Try saying: "My favorite food is... because it is delicious. I also like..."']
                }
            ]
        },
        {
            id: 'unit6-lesson5',
            title: '5. Travel and Cities',
            icon: '🌍',
            type: 'regular',
            exercises: [
                {
                    type: 'roleplay-chat',
                    question: 'Talk about a place you want to visit.',
                    scenario: 'IELTS Speaking Part 1: The examiner asks about travel and places you would like to go to.',
                    speechLang: 'en-US',
                    chatMessages: [
                        { sender: 'ai', text: 'Let\'s talk about travel. Which country or city would you like to visit in the future, and why?', avatar: '👩‍🏫', name: 'Examiner' },
                        { sender: 'ai', text: 'confirm: That sounds like a fantastic place to visit!', avatar: '👩‍🏫', name: 'Examiner' }
                    ],
                    acceptableResponses: [
                        'want to visit', 'travel to', 'because', 'beautiful', 'country'
                    ],
                    hints: ['Try saying: "I would love to visit... because I want to see..."']
                }
            ]
        },
        {
            id: 'unit6-lesson6',
            title: '6. Weather and Seasons',
            icon: '☀️',
            type: 'regular',
            exercises: [
                {
                    type: 'roleplay-chat',
                    question: 'Talk about your favorite season.',
                    scenario: 'IELTS Speaking Part 1: The examiner asks you about the weather where you live.',
                    speechLang: 'en-US',
                    chatMessages: [
                        { sender: 'ai', text: 'How about the weather? What is your favorite season, and what do you usually do during that time?', avatar: '👩‍🏫', name: 'Examiner' },
                        { sender: 'ai', text: 'confirm: I see. The weather really does affect what we can do!', avatar: '👩‍🏫', name: 'Examiner' }
                    ],
                    acceptableResponses: [
                        'favorite season', 'summer', 'winter', 'spring', 'autumn', 'weather is', 'i usually'
                    ],
                    hints: ['Try saying: "My favorite season is... because I enjoy..."']
                }
            ]
        },
        {
            id: 'unit6-lesson7',
            title: '7. Books and Reading',
            icon: '📚',
            type: 'regular',
            exercises: [
                {
                    type: 'roleplay-chat',
                    question: 'Talk about reading.',
                    scenario: 'IELTS Speaking Part 1: The examiner asks about the books you read.',
                    speechLang: 'en-US',
                    chatMessages: [
                        { sender: 'ai', text: 'Let\'s talk about reading. Do you enjoy reading books? What kind of books do you like?', avatar: '👩‍🏫', name: 'Examiner' },
                        { sender: 'ai', text: 'confirm: That is great. Reading is a really good habit.', avatar: '👩‍🏫', name: 'Examiner' }
                    ],
                    acceptableResponses: [
                        'like reading', 'my favorite book', 'story', 'interesting'
                    ],
                    hints: ['Try saying: "Yes, I like reading. I enjoy reading about..."']
                }
            ]
        },
        {
            id: 'unit6-lesson8',
            title: '8. Music and Movies',
            icon: '🎬',
            type: 'regular',
            exercises: [
                {
                    type: 'roleplay-chat',
                    question: 'Talk about music and movies.',
                    scenario: 'IELTS Speaking Part 1: The examiner asks about your entertainment preferences.',
                    speechLang: 'en-US',
                    chatMessages: [
                        { sender: 'ai', text: 'I\'d like to ask you about movies and music. What kind of movies or music do you prefer?', avatar: '👩‍🏫', name: 'Examiner' },
                        { sender: 'ai', text: 'confirm: Excellent! Music and movies are great ways to relax.', avatar: '👩‍🏫', name: 'Examiner' }
                    ],
                    acceptableResponses: [
                        'favorite movie', 'listen to music', 'pop', 'action', 'relaxing'
                    ],
                    hints: ['Try saying: "I really enjoy watching... because it makes me feel..."']
                }
            ]
        },
        {
            id: 'unit6-lesson9',
            title: '9. Family and Friends',
            icon: '👥',
            type: 'regular',
            exercises: [
                {
                    type: 'roleplay-chat',
                    question: 'Talk about a friend or family member.',
                    scenario: 'IELTS Speaking Part 1: The examiner asks about people who are close to you.',
                    speechLang: 'en-US',
                    chatMessages: [
                        { sender: 'ai', text: 'Let\'s talk about people. Tell me about a close friend or a family member. Why do you like spending time with them?', avatar: '👩‍🏫', name: 'Examiner' },
                        { sender: 'ai', text: 'confirm: That\'s very sweet. It is important to have good people around us.', avatar: '👩‍🏫', name: 'Examiner' }
                    ],
                    acceptableResponses: [
                        'my best friend', 'my mother', 'brother', 'we always', 'kind'
                    ],
                    hints: ['Try saying: "I would like to talk about my... We like to... together."']
                }
            ]
        },
        {
            id: 'unit6-lesson10',
            title: '10. Future Goals',
            icon: '🎯',
            type: 'regular',
            exercises: [
                {
                    type: 'roleplay-chat',
                    question: 'Talk about your future goals.',
                    scenario: 'IELTS Speaking Part 1: The examiner asks you about your plans for the future.',
                    speechLang: 'en-US',
                    chatMessages: [
                        { sender: 'ai', text: 'Finally, let\'s talk about the future. What is a goal you want to achieve in the next few years?', avatar: '👩‍🏫', name: 'Examiner' },
                        { sender: 'ai', text: 'confirm: That sounds like a great plan! I wish you the best of luck.', avatar: '👩‍🏫', name: 'Examiner' }
                    ],
                    acceptableResponses: [
                        'in the future', 'i want to', 'my goal is', 'plan to', 'study'
                    ],
                    hints: ['Try saying: "In the future, I hope to... because..."']
                }
            ]
        }
    ]
};
