import uconfpassCSS from "./uconfpass.module.css";
import Forpassuser from "../allfpass/forpass";
import Register from "../../register/register";
import { useRef } from "react";

function Uconfpass({ settoken, setmail }) {
  const containerRef = useRef(null);

  const handleSignupClick = () => {
    containerRef.current.classList.add(uconfpassCSS.right_panel_active);
  };

  const handleforgotClick = () => {
    containerRef.current.classList.remove(uconfpassCSS.right_panel_active);
  };

  return (
    <div className={uconfpassCSS.body}>
      <div ref={containerRef} className={uconfpassCSS.container}>
        <div className={uconfpassCSS.sign_in}>
          <Forpassuser setmail={setmail} />
        </div>
        <div className={uconfpassCSS.sign_up}>
          <Register settoken={settoken} />
        </div>

        <div className={uconfpassCSS.overlaycon}>
          <div className={uconfpassCSS.overlay}>
            <div className={uconfpassCSS.overlay_left}>
              <div className={uconfpassCSS.overlayheadings}>
                <h1>Hey</h1>
                <p>Already a user and forgot password?</p>
              </div>
              <button
                className={uconfpassCSS.signin}
                onClick={handleforgotClick}
              >
                Forgot Password
              </button>
            </div>
            <div className={uconfpassCSS.overlay_right}>
              <div className={uconfpassCSS.overlayheadings}>
                <h1>Helooo</h1>
                <p>Are you a new User then:</p>
              </div>
              <button
                className={uconfpassCSS.signup}
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

export default Uconfpass;
