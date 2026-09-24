import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against benign ResizeObserver loop limit/undelivered notifications warnings
if (typeof window !== 'undefined') {
  const resizeObserverErrRegex = /ResizeObserver loop (completed with undelivered notifications|limit exceeded)/i;
  window.addEventListener('error', (event) => {
    if (event.message && resizeObserverErrRegex.test(event.message)) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
