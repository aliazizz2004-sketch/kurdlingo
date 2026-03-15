import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App'

import { LanguageProvider } from './context/LanguageContext';
import { InsforgeProvider } from '@insforge/react';
import { insforge } from './lib/insforge';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <InsforgeProvider client={insforge}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </InsforgeProvider>
  </StrictMode>,
)
