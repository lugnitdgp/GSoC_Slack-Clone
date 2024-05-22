import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './homepage/homepage.jsx';
import Login from './loginpage/loginbox.jsx';
import Register from './register/register.jsx';
import Fpassuser from './forgot password/fpass.jsx';
import Newpass from './forgot password/newpass.jsx';

const Pages = () => {
  const [token, setToken] = useState(null); 

  // Retrieve token from localStorage only once on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const parsedToken = JSON.parse(storedToken);
        setToken(parsedToken); // Update state only if parsing is successful
      } catch (error) {
        console.error('Error parsing stored token:', error);
    
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Update localStorage only when token changes and is valid
  useEffect(() => {
    if (token) {
      try {
        localStorage.setItem('token', JSON.stringify(token));
      } catch (error) {
        console.error('Error saving token to localStorage:', error);
      }
    }
  }, [token]);

  return (
    <div>
      <Routes>
        <Route path={"/login"} element={token ? <Navigate to="/" replace /> : <Login settoken={setToken} />} />
        <Route path={"/signup"} element={token ? <Navigate to="/" replace /> : <Register settoken={setToken}/>} />
        <Route path={"/fpassuser"} element={token ? <Navigate to="/" replace /> : <Fpassuser settoken={setToken}/>} />
        <Route
          path={'/newpass'}
          element={token ? <Newpass settoken={setToken} /> : <div>First enter a username to get the password reset mail </div>}
        />
        <Route
          path={'/'}
          element={token ? <Home data={token}/> : <Navigate to="/login" replace />}
        />
      </Routes>
    </div>
  );
};

export default Pages;
