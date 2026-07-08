import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/styles/global.css';

import { FeedbackProvider } from './presentation/context/FeedbackContext';
import { SettingsProvider } from './presentation/context/SettingsContext';
import { Toast } from './presentation/components/molecules/Toast/Toast';
import { PermissionUtils } from './utils/permissionUtils';
import { authStorage } from './infrastructure/storage/authStorage';

const preloadPermissions = async (): Promise<void> => {
  if (!authStorage.isAuthenticated()) return;
  try {
    await PermissionUtils.load();
  } catch (error) {
    console.error('[App Initialization] Failed to load user permissions', error);
  }
};

window.addEventListener('authTokenChanged', () => {
  PermissionUtils.clearCache();
  void preloadPermissions();
});

const isFileProtocol = window.location.protocol === 'file:';

createRoot(document.getElementById('root')!).render(
  <SettingsProvider>
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
  </SettingsProvider>
);

void preloadPermissions();
