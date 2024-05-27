import loginboxCSS from "./loginbox.module.css";
import supabase from "../supabase";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FaRegEye, FaEyeSlash, FaUserAlt } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { CheckemailExists, PasswordCheck } from "../database";
// Assuming CheckemailExists and PasswordCheck functions are defined elsewhere

function Login({ settoken, setUpdload }) {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const emailRef = useRef("");
  const passRef = useRef("");

  async function handleOAuth(provider) {
    try {
      let { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin + "/update-details", // Redirect to update-details after login
        },
      });
      if (data) {
        console.log(data);
      } else {
        console.log(error);
      }
    } catch (error) {
      console.error("Error in Google sign-in:", error);
    }
  }

  async function login(b) {
    b.preventDefault();
    const email = emailRef.current.value;
    const pass = passRef.current.value;
    console.log(email, pass);
    const doesemailExist = await CheckemailExists(email);
    console.log(doesemailExist);

    if (doesemailExist) {
      const passcorrect = await PasswordCheck(email, pass);
      console.log(passcorrect);
      if (passcorrect) {
        try {
          let { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: pass,
          });
          if (data) {
            if (data.user != null && data.session != null) {
              alert("Successful log in redirecting to Homepage");
              navigate("/");
              settoken(data);
            } else if (data.user == null && data.session == null) {
              alert("Wrong password");
            }
          } else if (error) {
            console.log(error);
            alert(error.message || error);
          }
        } catch (error) {
          console.error("Unexpected error:", error);
        }
      } else {
        alert("Wrong password");
      }
    } else {
      alert("Email does not exist.");
      // Handle the case where the email doesn't exist
    }
  }

  return (
    <form onSubmit={login} className={loginboxCSS.form}>
      <h1 className={loginboxCSS.h1}>LOGIN</h1>
      <div className={loginboxCSS.social}>
        <div
          className={loginboxCSS.media}
          onClick={() => handleOAuth("google")}
        >
          <FaGoogle />
        </div>
        <div
          className={loginboxCSS.media}
          onClick={() => handleOAuth("github")}
        >
          <FaGithub />
        </div>
      </div>
      <p className={loginboxCSS.p}>Or use your E-Mail</p>
      <div className={loginboxCSS.inputout}>
        <span>
          <FaUserAlt />
        </span>
        <input
          type="text"
          placeholder="E-Mail I.D"
          ref={emailRef}
          className={loginboxCSS.input}
        />
      </div>
      <div className={loginboxCSS.inputout}>
        {passwordVisible ? (
          <span onClick={togglePasswordVisibility}>
            <FaRegEye />
          </span>
        ) : (
          <span onClick={togglePasswordVisibility}>
            <FaEyeSlash />
          </span>
        )}
        <input
          type={passwordVisible ? "text" : "password"}
          placeholder="Password"
          ref={passRef}
          className={loginboxCSS.input}
        />
      </div>
      <div className={loginboxCSS.forgot}>
        <p>
          <Link to="/fpassuser">Forgot Password</Link>
        </p>
      </div>
      <button type="submit" className={loginboxCSS.enter}>
        Login
      </button>
    </form>
  );
}
export default Login;
