import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./homepage/homepage.jsx";
import Newpass from "./Authentication/forgot password/allfpass/newpass.jsx";
import Update from "./Authentication/update details/updatedetails.jsx";
import supabase from "./supabase.jsx";
import Signingpages from "./Authentication/signingpages/signningpages.jsx";
import Uconfpass from "./Authentication/forgot password/uifpasscon/passresetconfirm.jsx";

const Pages = () => {
  const [token, setToken] = useState(null);
  const [updload, setUpdload] = useState(false);
  const [mailcheck, setMailcheck] = useState(
    JSON.parse(localStorage.getItem("mailcheck")) || false // Ensure boolean value is correctly retrieved
  );

  useEffect(() => {
    async function getudetails() {
      await supabase.auth.getUser().then((val) => {
        if (val.data?.user) {
          console.log(val.data.user);
          setToken(val.data);
          setUpdload("true");
        }
      });
    }
    console.log(updload);
    getudetails();
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const parsedToken = JSON.parse(storedToken);
        setToken(parsedToken);
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

  useEffect(() => {
    localStorage.setItem("mailcheck", JSON.stringify(mailcheck)); // Update local storage on state change
  }, [mailcheck]);


  return (
    <div>
      <Routes>
        <Route
          path="/fpassuser"
          element={
            token ? (
              <Navigate to="/" replace />
            ) : (
              <Uconfpass setmail={setMailcheck} settoken={setToken} />
            )
          }
        />
        <Route
          path="/newpass"
          element={
            mailcheck ? (
              <Newpass settoken={setToken} setmail={setMailcheck} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/update-details"
          element={
            updload ? (
              <Update data={token} settoken={setToken} />
            ) : (
              <p>not yet logged</p>
            )
          }
        />
        <Route
          path="/signing-pages"
          element={
            //<Signingpages />
            token ? (
              <Navigate to="/" replace />
            ) : (
              <Signingpages settoken={setToken} setupdload={setUpdload} />
            )
          }
        />
        <Route
          path="/"
          element={
            //<Home data={token} />
            token && !mailcheck ? (
              <Home data={token} />
            ) : (
              <Navigate to="/signing-pages" replace />
            )
          }
        />
      </Routes>
    </div>
  );
};

export default Pages;
