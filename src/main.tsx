import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAuthInterceptor } from './utils/auth';

// Attiva l'intercettore per l'iniezione automatica dell'header Authorization
initAuthInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
