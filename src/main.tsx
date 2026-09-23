import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { consumeJarvisHash, showIntakeToast } from './intake/jarvis'

// Ensure dark mode is applied
document.documentElement.classList.add('dark');

// Jarvis voice-intake: merge any #jarvis= payload into localStorage before
// React mounts so the planner hooks pick it up on first load.
const intakeResult = consumeJarvisHash();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (intakeResult) {
  showIntakeToast(intakeResult);
}
