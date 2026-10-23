import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

if (!localStorage.getItem('medical_inventory')) {
  localStorage.setItem('medical_inventory', JSON.stringify([]));
}

const originalFetch = window.fetch;
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const options = init || {};

  if (url.includes('/api/inventory') || url.includes('/api/medicines')) {
    if (options.method === 'POST' && options.body) {
      const newMed = JSON.parse(options.body as string);
      const currentInv = JSON.parse(localStorage.getItem('medical_inventory') || '[]');
      newMed.id = Date.now().toString();
      currentInv.push(newMed);
      localStorage.setItem('medical_inventory', JSON.stringify(currentInv));
      return new Response(JSON.stringify(newMed), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    const currentInv = localStorage.getItem('medical_inventory') || '[]';
    return new Response(currentInv, { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (url.includes('/api/')) {
    return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  return originalFetch(input, init);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
