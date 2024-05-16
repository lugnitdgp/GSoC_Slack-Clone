import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import Login from './loginpage/loginbox.jsx';
import './index.css';
import Register from './register/register.jsx';

const Pages = () => {
  const [token, setToken] = useState(null); // Initialize token to null

  // Retrieve token from localStorage only once on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const parsedToken = JSON.parse(storedToken);
        setToken(parsedToken); // Update state only if parsing is successful
      } catch (error) {
        console.error('Error parsing stored token:', error);
        // Consider clearing invalid localStorage token here
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
        <Route path={"/login"} element={<Login settoken={setToken} />} />
        <Route path={"/signup"} element={<Register settoken={setToken}/>} />
        <Route
          path={'/'}
          element={token ? <App /> : <div>Please sign in to view this page</div>}
        />
      </Routes>
    </div>
  );
};

export default Pages;
