import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import "./assets/styles/global.css";
import { permissionEntityService } from './services/permissionEntityService';
import { FeedbackProvider } from './presentation/context/FeedbackContext';
import { Toast } from './presentation/components/molecules/Toast/Toast';

// Inicializar servicios al cargar la aplicación
const initializeApp = async () => {
  try {
    await permissionEntityService.initialize();
  } catch {
    // silencioso — no bloquea el arranque
  }
};

const isFileProtocol = window.location.protocol === 'file:'

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

// Inicializar servicios después del render
initializeApp();