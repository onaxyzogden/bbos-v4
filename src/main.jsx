import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import { runMigrations } from './services/migration.js';

// Run localStorage migrations before render
runMigrations();

// Apply saved theme
const savedTheme = localStorage.getItem('bbos_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
