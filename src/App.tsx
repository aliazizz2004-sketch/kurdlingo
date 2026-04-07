import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage/LandingPage';
import Learn from './pages/Learn/Learn';
import Lesson from './pages/Lesson/Lesson';
import LessonCreator from './pages/LessonCreator/LessonCreator';
import Admin from './pages/Admin/Admin';
import Guidebook from './pages/Guidebook/Guidebook';
import GuidebookHub from './pages/GuidebookHub/GuidebookHub';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import Quests from './pages/Quests/Quests';
import Shop from './pages/Shop/Shop';
import Profile from './pages/Profile/Profile';
import Login from './pages/Login/Login';
import RolePlayHub from './pages/RolePlayHub/RolePlayHub';
import RolePlayChat from './pages/RolePlayChat/RolePlayChat';
import SpaceTypingGame from './pages/SpaceTypingGame/SpaceTypingGame';
import NeuroMatch from './pages/NeuroMatch/NeuroMatch';
import TypingRush from './pages/TypingRush/TypingRush';
import BookDictionary from './pages/BookDictionary/BookDictionary';
import IntermediateLearn from './pages/IntermediateLearn/IntermediateLearn';
import Eltis from './pages/Eltis/Eltis';
import Layout from './components/Layout/Layout';
import PageTransition from './components/PageTransition';
import ScrollToTop from './components/ScrollToTop';
import ProfileSetupModal from './components/ProfileSetupModal';
import VoiceTest from './pages/VoiceTest';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />

        {/* Main App Routes with Sidebar Layout - Layout already has PageTransition for его children */}
        <Route path="/learn" element={<Layout><Learn /></Layout>} />
        <Route path="/intermediate" element={<Layout><IntermediateLearn /></Layout>} />
        <Route path="/guidebook-hub" element={<Layout><GuidebookHub /></Layout>} />
        <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
        <Route path="/quests" element={<Layout><Quests /></Layout>} />
        <Route path="/shop" element={<Layout><Shop /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/roleplay" element={<Layout><RolePlayHub /></Layout>} />

        {/* Standalone Routes */}
        <Route path="/roleplay/:scenarioId" element={<PageTransition><RolePlayChat /></PageTransition>} />
        <Route path="/lesson/:lessonId" element={<PageTransition><Lesson /></PageTransition>} />
        <Route path="/create-lesson" element={<PageTransition><LessonCreator /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/guidebook/:unitId" element={<PageTransition><Guidebook /></PageTransition>} />
        <Route path="/space-game" element={<PageTransition><SpaceTypingGame /></PageTransition>} />
        <Route path="/neuromatch" element={<PageTransition><NeuroMatch /></PageTransition>} />
        <Route path="/typing-rush" element={<PageTransition><TypingRush /></PageTransition>} />
        <Route path="/dictionary" element={<Layout><BookDictionary /></Layout>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/eltis" element={<PageTransition><Eltis /></PageTransition>} />
        <Route path="/voicetest" element={<Layout><VoiceTest /></Layout>} />
      </Routes>
    </AnimatePresence>
  );
}

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <ProfileSetupModal />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;

