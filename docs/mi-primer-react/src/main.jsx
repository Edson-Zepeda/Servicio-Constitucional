import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'
import './index.css'        // ⬅️ importa tu CSS global

createRoot(document.getElementById('root')).render(<App />)
registerSW({ immediate: true })
