import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./homepage/homepage.jsx";
import Newpass from "./forgot password/allfpass/newpass.jsx";
import Update from "./update details/updatedetails.jsx";
import supabase from "./supabase.jsx";
import Signingpages from "./signingpages/signningpages.jsx";
import Uifpass from "./forgot password/uifpass/uifpass.jsx";

const Pages = () => {
  const [token, setToken] = useState(null);

  const [updload, setUpdload] = useState(false);

  useEffect(() => {
    async function getudetails() {
      await supabase.auth.getUser().then((val) => {
        if (val.data?.user) {
          console.log(val.data.user);
          localStorage.setItem("data2", JSON.stringify(val.data));
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
          path="/fpassuser"
          element={
            token ? (
              <Navigate to="/" replace />
            ) : (
              <Uifpass settoken={setToken} />
            )
          }
        />
        <Route
          path="/newpass"
          element={
            token ? (
              <Newpass settoken={setToken} />
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
            token ? (
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
