import React,{useEffect} from 'react'
import ReactDOM from 'react-dom/client'
import Pages from './pages.jsx'
import supabase from './supabase.jsx'
import { BrowserRouter } from 'react-router-dom'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Pages />
    </BrowserRouter>
  </React.StrictMode>,
)
