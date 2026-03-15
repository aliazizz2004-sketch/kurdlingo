<div align="center">

# 🟠 KurdLingo

### The Modern Kurdish Language Learning Platform

[![Live App](https://img.shields.io/badge/▶_Live_App-kurdlingo.vercel.app-FF9600?style=for-the-badge&logo=vercel&logoColor=white)](https://kurdlingo.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

**Learn Kurdish Sorani — completely free.** AI-powered lessons, real conversations,<br/>gamified progress, and interactive mini-games — all in 5 minutes a day.

---

</div>

<br/>

## ⚡ Overview

KurdLingo is a full-featured, gamified language learning web app built for **Kurdish Sorani** learners worldwide. Inspired by the best in language-tech (Duolingo, Memrise), it combines adaptive AI with structured lessons, interactive games, and a vibrant community leaderboard — all wrapped in a premium, mobile-first interface.

> 🎯 **Mission:** Make Kurdish language education accessible, engaging, and free for everyone.

<br/>

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **AI-Powered Lessons** | Adaptive sessions that adjust difficulty to your level in real-time |
| 💬 **AI Roleplay Chat** | Practice real Kurdish conversations with AI-driven scenario dialogues |
| 🚀 **Space Typing Game** | Defend your spaceship by typing falling Kurdish words before they crash |
| ⚡ **Typing Rush** | Speed-type full Kurdish passages with WPM tracking and accuracy scoring |
| 🧩 **NeuroMatch** | Memory card-matching game to reinforce vocabulary retention |
| 📖 **Interactive Guidebook** | Comprehensive grammar and culture guides for every lesson unit |
| 📚 **Kurdish Dictionary** | Built-in searchable dictionary with translations and examples |
| 🏆 **Leaderboard** | Compete with other learners globally on XP and streaks |
| 🎯 **Daily Quests** | Complete daily challenges to earn bonus XP and maintain streaks |
| 🛒 **Shop** | Spend earned gems on power-ups, streak freezes, and cosmetics |
| 👤 **User Profiles** | Track progress, stats, and customize your avatar |
| 🔐 **Authentication** | Secure sign-up/login with email and OAuth providers |

<br/>

## 🛠 Tech Stack

```
Frontend        React 19 · TypeScript 5 · Vite · React Router
Styling         CSS3 · Tailwind CSS 3.4 · Custom Design System
Backend         InsForge BaaS (Auth, Database, Storage, Functions)
AI Engine       Integrated AI for lessons, roleplay, and transcription
Icons           Lucide React · DiceBear Avatars
Deployment      Vercel (Frontend) · InsForge (Backend)
```

<br/>

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Abdulla090/kurdlingoo.git
cd kurdlingoo

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your InsForge credentials in .env

# 4. Start development server
npm run dev
```

The app will be running at `http://localhost:5000`

<br/>

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/          # Sidebar, BottomNav, responsive layout
│   ├── Button/          # Custom button component
│   └── ProfileSetupModal/
├── pages/               # Route-based page components
│   ├── LandingPage/     # Marketing landing page
│   ├── Learn/           # Main learning path with unit progression
│   ├── Lesson/          # Interactive lesson engine
│   ├── SpaceTypingGame/ # Space-themed typing defense game
│   ├── TypingRush/      # Speed typing passage game
│   ├── NeuroMatch/      # Memory card matching game
│   ├── RolePlayHub/     # AI conversation scenarios hub
│   ├── RolePlayChat/    # Real-time AI roleplay chat
│   ├── Guidebook/       # Grammar & culture guides
│   ├── BookDictionary/  # Searchable Kurdish dictionary
│   ├── Leaderboard/     # Global XP leaderboard
│   ├── Quests/          # Daily quest system
│   ├── Shop/            # In-app gem shop
│   └── Profile/         # User profile & settings
├── context/             # React Context providers (Language, Auth)
├── data/                # Static data, word banks, lesson content
├── services/            # API service layer
└── styles/              # Global styles and CSS variables
```

<br/>

## 📊 Stats

<div align="center">

| Metric | Value |
|:------:|:-----:|
| 📝 Interactive Lessons | **50+** |
| 🎮 Mini-Games | **3** |
| 👥 Active Learners | **1,200+** |
| ⭐ Satisfaction Rate | **98%** |
| 🌍 Languages Supported | **Kurdish Sorani · English** |

</div>

<br/>

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m 'feat: add amazing feature'

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

<br/>

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Made with 🧡 for the Kurdish community**

[Live App](https://kurdlingo.vercel.app) · [Report Bug](https://github.com/Abdulla090/kurdlingoo/issues) · [Request Feature](https://github.com/Abdulla090/kurdlingoo/issues)

</div>
