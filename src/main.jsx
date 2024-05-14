import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Login from './loginpage/loginbox.jsx'
import './index.css'
import {Outlet, RouterProvider, createBrowserRouter} from 'react-router-dom'
import Register from './register/register.jsx'

const rou = createBrowserRouter([{
  children:[
    {
      path:"/",
      element:<App />
    },
    {
      path:"/login",
      element:<Login />
    },
    {
      path:"/signup",
      element:<Register />
    }
  ],
},],);
ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={rou} />
)
