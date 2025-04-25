import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { BrowserRouter } from 'react-router-dom';
import { ToastContainer, ToastProvider } from "@/Components/ui/toast";
import { ThemeProvider } from './Components/ThemeProvider.jsx';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <Toaster/>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
