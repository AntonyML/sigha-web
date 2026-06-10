import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/styles/global.css';

import { permissionEntityService } from './services/permissionEntityService';
import { FeedbackProvider } from './presentation/context/FeedbackContext';
import { Toast } from './presentation/components/molecules/Toast/Toast';

// Inicializar servicios no críticos sin bloquear el render
const initializeApp = async (): Promise<void> => {
  try {
    await permissionEntityService.initialize();
  } catch (error) {
    console.error(
      '[App Initialization] Failed to initialize permissionEntityService',
      error
    );
  }
};

const isFileProtocol = window.location.protocol === 'file:';

createRoot(document.getElementById('root')!).render(
  <FeedbackProvider>
    <Toast />
    {isFileProtocol ? (
      <HashRouter>
        <App />
      </HashRouter>
    ) : (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )}
  </FeedbackProvider>
);

// Ejecutar después del render sin bloquear la carga inicial
void initializeApp();