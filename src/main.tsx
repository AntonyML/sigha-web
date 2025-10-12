import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import "./assets/styles/global.css";


const isFileProtocol = window.location.protocol === 'file:'

createRoot(document.getElementById('root')!).render(

  isFileProtocol ? (
    <HashRouter>
      <App />
    </HashRouter>
  ) : (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
)