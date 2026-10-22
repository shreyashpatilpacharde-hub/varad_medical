import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

if (!window.localStorage.getItem('varad_inventory')) {
  window.localStorage.setItem('varad_inventory', JSON.stringify([]));
}
if (!window.localStorage.getItem('varad_receipts')) {
  window.localStorage.setItem('varad_receipts', JSON.stringify([]));
}

const fakeFetch = async (url, options = {}) => {
  if (url.includes('/api/inventory')) {
    if (options.method === 'POST') {
      const newMed = JSON.parse(options.body);
      const current = JSON.parse(window.localStorage.getItem('varad_inventory') || '[]');
      newMed.id = Date.now().toString();
      current.push(newMed);
      window.localStorage.setItem('varad_inventory', JSON.stringify(current));
      return { ok: true, json: async () => ({ success: true, data: newMed }) };
    }
    const current = window.localStorage.getItem('varad_inventory') || '[]';
    return { ok: true, json: async () => JSON.parse(current) };
  }
  return { ok: true, json: async () => [] };
};

window.fetch = fakeFetch;
