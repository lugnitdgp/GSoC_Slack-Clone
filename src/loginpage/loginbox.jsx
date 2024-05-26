import "./loginbox.css";
import supabase from "../supabase";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FaRegEye, FaEyeSlash, FaUserAlt } from "react-icons/fa";
// Assuming CheckemailExists and PasswordCheck functions are defined elsewhere

function Login({ settoken, setUpdload }) {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const emailRef = useRef("");
  const passRef = useRef("");

  

  async function google() {
    try {
      let { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/update-details", // Redirect to update-details after login
        },
      })
      if (data) {
          setUpdload(true);
          alert('done')
        } else{
          console.log(error)
        }

     
    } catch (error) {
      console.error("Error in Google sign-in:", error);
    }
  }

  async function login(b) {
    b.preventDefault();
    const email = emailRef.current.value;
    const pass = passRef.current.value;

    const doesemailExist = await CheckemailExists(email);
    const passcorrect = await PasswordCheck(email, pass);

    if (doesemailExist) {
      if (passcorrect) {
        try {
          let { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: pass,
          });
          if (data) {
            if (data.user != null && data.session != null) {
              alert("Successful log in redirecting to Homepage");
              settoken(data.user);
              localStorage.setItem('token', JSON.stringify(data.user));
              setLoginMethod('email'); // Store the login method
              setUpdload('true');
              navigate("/");
            } else if (data.user == null && data.session == null) {
              alert("Wrong password");
            }
          } else if (error) {
            console.log(error);
            alert(error.message || error);
          }
        } catch (error) {
          console.error("Unexpected error:", error);
          alert("An unexpected error occurred. Please try again later.");
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
    <div className="page">
      <form onSubmit={login}>
        <div className="box">
          <h1>LOGIN</h1>
          <div className="email input">
            <span>
              <FaUserAlt />
            </span>
            <input type="text" placeholder="E-Mail I.D" ref={emailRef} />
          </div>
          <div className="pass input">
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
            />
          </div>
          <div className="forsh">
            <p>
              <Link to="/fpassuser">Forgot Password</Link>
            </p>
          </div>
          <div className="enter">
            <button type="submit">Login</button>
          </div>
          <div className="other">
            <div className="enter">
              <button type="button" onClick={google}>Google</button>
            </div>
            <p>
              Don't have an account yet? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
export default Login;
