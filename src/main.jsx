import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx';
import { QueryProvider } from './context/QueryContext.jsx';

const basename = import.meta.env.VITE_GITHUB_PAGES ? '/Global-Wealth' : '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <QueryProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </QueryProvider>
    </BrowserRouter>
  </StrictMode>,
);

