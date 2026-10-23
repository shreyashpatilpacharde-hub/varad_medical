if (!window.localStorage.getItem('varad_inventory')) {
  window.localStorage.setItem('varad_inventory', JSON.stringify([]));
}
if (!window.localStorage.getItem('varad_receipts')) {
  window.localStorage.setItem('varad_receipts', JSON.stringify([]));
}

const fakeFetch = async (url, options = {}) => {
  const urlStr = String(url);
  if (urlStr.includes('/api/inventory')) {
    if (options.method === 'POST') {
      const newMed = JSON.parse(options.body || '{}');
      const current = JSON.parse(window.localStorage.getItem('varad_inventory') || '[]');
      newMed.id = Date.now().toString();
      current.push(newMed);
      window.localStorage.setItem('varad_inventory', JSON.stringify(current));
      return { ok: true, status: 200, json: async () => ({ success: true, data: newMed }), headers: new Headers({'Content-Type': 'application/json'}) };
    }
    const current = window.localStorage.getItem('varad_inventory') || '[]';
    return { ok: true, status: 200, json: async () => JSON.parse(current), headers: new Headers({'Content-Type': 'application/json'}) };
  }
  if (urlStr.includes('/api/')) {
    return { ok: true, status: 200, json: async () => [], headers: new Headers({'Content-Type': 'application/json'}) };
  }
  return window.fetch(url, options);
};

window.fetch = fakeFetch;

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);


