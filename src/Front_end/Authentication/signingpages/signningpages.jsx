import signingpagesCSS from "./signingpages.module.css";
import Login from "../loginpage/loginbox";
import Register from "../register/register";
import { useRef } from "react";

function Signingpages({ settoken, setUpdload }) {
  const containerRef = useRef(null);

  const handleSignupClick = () => {
    containerRef.current.classList.add(signingpagesCSS.right_panel_active);
  };

  const handleSigninClick = () => {
    containerRef.current.classList.remove(signingpagesCSS.right_panel_active);
  };

  return (
    <div className={signingpagesCSS.body}>
      <div ref={containerRef} className={signingpagesCSS.container}>
        <div className={signingpagesCSS.sign_in}>
          <Login settoken={settoken} setUpdload={setUpdload} />
        </div>
        <div className={signingpagesCSS.sign_up}>
          <Register settoken={settoken} />
        </div>

        <div className={signingpagesCSS.overlaycon}>
          <div className={signingpagesCSS.overlay}>
            <div className={signingpagesCSS.overlay_left}>
              <div className={signingpagesCSS.overlayheadings}>
                <h1 className={signingpagesCSS.h1}>Welcome back!</h1>
                <p>To get back to your chats, please Login</p>
              </div>

              <button
                className={signingpagesCSS.signin}
                onClick={handleSigninClick}
              >
                Log in
              </button>
            </div>
            <div className={signingpagesCSS.overlay_right}>
              <div className={signingpagesCSS.overlayheadings}>
                <h1 className={signingpagesCSS.h1}>Hey, What's New!</h1>
                <p>To get back to your chats, please Login</p>
              </div>
              <button
                className={signingpagesCSS.signup}
                onClick={handleSignupClick}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signingpages;
