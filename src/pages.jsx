import React,{useEffect, useState} from 'react'
import { Route,Routes } from 'react-router-dom'
import App from './App.jsx'
import Login from './loginpage/loginbox.jsx'
import './index.css'
import Register from './register/register.jsx'
const Pages=()=>{
  const [token,settoken]=useState(false)
if(token){
  sessionStorage.setItem('token',JSON.stringify(token))
}
useEffect(()=>{
  if(sessionStorage.setItem('token',JSON.stringify(token))){
    let data=JSON.parse(sessionStorage.setItem('token'))
    settoken(data)
  }
},[])
  return(
    <div>
    <Routes>
      <Route path={"/login"} element={<Login settoken={settoken} />} />
      <Route path={"/signup"} element={<Register />} />
      <Route path={'/'} element={token?<App />:<div>sign in to view this page</div> } />
    </Routes>
    </div>
  )
  }
export default Pages
