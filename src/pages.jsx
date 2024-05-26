import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./homepage/homepage.jsx";
import Login from "./loginpage/loginbox.jsx";
import Register from "./register/register.jsx";
import Fpassuser from "./forgot password/fpass.jsx";
import Newpass from "./forgot password/newpass.jsx";
import Update from "./update details/updatedetails.jsx";
import supabase from "./supabase.jsx";

const Pages = () => {
  const [token, setToken] = useState(null);

  const [updload, setUpdload] = useState(false);

  useEffect(() => {
    async function getudetails() {
      await supabase.auth.getUser().then((val) => {
        if (val.data?.user) {
          console.log(val.data.user);
          localStorage.setItem("data2", JSON.stringify(val.data.user));
          setToken(val.data.user);
          setUpdload("true");
        }
      });
    }
    console.log(updload)
    getudetails();
  }, [updload]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const parsedToken = JSON.parse(storedToken);
        setToken(parsedToken); // Update state only if parsing is successful
      } catch (error) {
        console.error("Error parsing stored token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      try {
        localStorage.setItem("token", JSON.stringify(token));
      } catch (error) {
        console.error("Error saving token to localStorage:", error);
      }
    }
  }, [token]);

  return (
    <div>
      <Routes>
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/" replace />
            ) : (
              <Login settoken={setToken} setupdload={setUpdload} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            token ? (
              <Navigate to="/" replace />
            ) : (
              <Register settoken={setToken} />
            )
          }
        />
        <Route
          path="/fpassuser"
          element={
            token ? (
              <Navigate to="/" replace />
            ) : (
              <Fpassuser settoken={setToken} />
            )
          }
        />
        <Route
          path="/newpass"
          element={
            token ? (
              <Newpass settoken={setToken} />
            ) : (
              <div>First enter a username to get the password reset mail </div>
            )
          }
        />
        <Route
          path="/update-details"
          element={updload ? <Update /> : <p>not yet logged</p>}
        />

        <Route
          path="/"
          element={
            //<Home data={token} />
            token ? <Home data={token} /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </div>
  );
};

export default Pages;
