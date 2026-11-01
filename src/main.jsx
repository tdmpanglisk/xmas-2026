import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * Bulletproof Monkeypatch: Intercept and validate the extension's event handlers
 * before they can attach to the document or window.
 */
(function overrideListeners() {
  try {
    const targets = [window, document, HTMLElement.prototype];
    
    targets.forEach((target) => {
      const originalAddEventListener = target.addEventListener;
      
      target.addEventListener = function (type, listener, options) {
        if (type === 'keydown' || type === 'keyup' || type === 'keypress') {
          // Explicitly handle the incoming event mapping safely
          const protectedListener = function (event) {
            try {
              if (typeof listener === 'function') {
                return listener.call(this, event);
              }
              if (listener && typeof listener.handleEvent === 'function') {
                return listener.handleEvent(event);
              }
            } catch (error) {
              const stack = error?.stack || '';
              if (stack.includes('page-events.js') || error.message?.includes('length')) {
                return; 
              }
              console.error('Core App Event Crash:', error);
            }
          };
          return originalAddEventListener.call(this, type, protectedListener, options);
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
    });
  } catch (e) {
    console.debug('Listener override skipped:', e.message);
  }
})();

window.addEventListener('unhandledrejection', (event) => {
  const reasonMsg = event.reason?.message || '';
  if (reasonMsg.includes('EmailJS') || reasonMsg.includes('422')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
