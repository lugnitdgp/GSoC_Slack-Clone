import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./homepage/homepage.jsx";
import Newpass from "./Authentication/forgot password/allfpass/newpass.jsx";
import Update from "./Authentication/update details/updatedetails.jsx";
import supabase from "./supabase.jsx";
import Signingpages from "./Authentication/signingpages/signningpages.jsx";
import Uconfpass from "./Authentication/forgot password/uifpasscon/passresetconfirm.jsx";
import Cookies from "js-cookie";

const Pages = () => {
  const [token, setToken] = useState(
    Cookies.get("authToken") ? JSON.parse(Cookies.get("authToken")) : null
  );
  const [updload, setUpdload] = useState(false);
  const [mailcheck, setMailcheck] = useState(
    JSON.parse(localStorage.getItem("mailcheck")) || false // Ensure boolean value is correctly retrieved
  );
  const [joken, setJoken] = useState(null);

  useEffect(() => {
    async function getudetails() {
      await supabase.auth.getUser().then((val) => {
        if (val.data?.user) {
          console.log(val.data.user);
          setToken(val.data);
          setJoken(val.data);
          setUpdload("true");
        }
      });
    }
    console.log(updload);
    getudetails();
  }, []);
  useEffect(() => {
    if (token) {
      Cookies.set("authToken", JSON.stringify(token), {
        expires: 2,
        secure: true,
      }); //here expire time is taken in days eg:2 hours = 1/12 day
      const jwttoken = localStorage.getItem(
        "sb-kibzydwyaosjaslultsq-auth-token"
      );
      setJoken(jwttoken);
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
            joken ? (
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
              <video src="src/Front_end/loading video/6824-196344457_medium.mp4" autoPlay loop muted style={{width:"100vw" ,height:"100vh",objectFit:"cover"}}></video>
            )
          }
        />
        <Route
          path="/signing-pages"
          element={
            //<Signingpages />
            joken ? (
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
            joken && !mailcheck ? (
              <Home data={token} />
            ) : (
              <Navigate to="/signing-pages" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default Pages;
