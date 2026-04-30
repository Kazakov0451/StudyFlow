import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToastProvider } from './components/Toast';
import Board from './components/Board';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <Board />
    </ToastProvider>
  </React.StrictMode>
);
