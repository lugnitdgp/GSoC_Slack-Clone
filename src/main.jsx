import React from 'react'
import ReactDOM from 'react-dom/client'
import Pages from './pages.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Pages /> 
    </BrowserRouter>
  </React.StrictMode>,
)
