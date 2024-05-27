import uifpassCSS from "./uifpass.module.css";
import Fpassuser from "../allfpass/fpass";
import Register from "../../register/register";
import { useRef } from "react";

function Uifpass({ settoken }) {
  const containerRef = useRef(null);

  const handleSignupClick = () => {
    containerRef.current.classList.add(uifpassCSS.right_panel_active);
  };

  const handleforgotClick = () => {
    containerRef.current.classList.remove(uifpassCSS.right_panel_active);
  };

  return (
    <div className={uifpassCSS.body}>
      <div ref={containerRef} className={uifpassCSS.container}>
        <div className={uifpassCSS.sign_in}>
          <Fpassuser settoken={settoken} />
        </div>
        <div className={uifpassCSS.sign_up}>
          <Register settoken={settoken} />
        </div>

        <div className={uifpassCSS.overlaycon}>
          <div className={uifpassCSS.overlay}>
            <div className={uifpassCSS.overlay_left}>
              <h1>Hey</h1>
              <p>Already a user and forgot password?</p>
              <button className={uifpassCSS.signin} onClick={handleforgotClick}>
                Forgot Password
              </button>
            </div>
            <div className={uifpassCSS.overlay_right}>
              <h1>Helooo</h1>
              <p>Are you a new User then:</p>
              <button className={uifpassCSS.signup} onClick={handleSignupClick}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Uifpass;
