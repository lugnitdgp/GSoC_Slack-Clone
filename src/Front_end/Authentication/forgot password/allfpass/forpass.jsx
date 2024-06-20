import supabase from "../../../supabase.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { FaUserAlt } from "react-icons/fa";
import fpassCSS from "./fpass.module.css";
import { CheckemailExists } from "../../../database.jsx";

function Forpassuser({ setmail }) {
  let navigate = useNavigate();

  const emailRef = useRef("");

  async function fpass(b) {
    b.preventDefault();
    const email = emailRef.current.value;

    const doesemailExist = await CheckemailExists(email);
    console.log(doesemailExist);

    if (doesemailExist) {
      try {
        let { data, error } = await supabase.auth.resetPasswordForEmail(email);

        if (data) {
          console.log(data);
          setmail(true);
          alert("Check your mail for password reset link");
          navigate("/");
        } else if (error) {
          alert(error.message || error);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    } else {
      alert("email does not exist.");
      // Handle the case where the email doesn't exist
    }
  }

  return (
    <form onSubmit={fpass} className={fpassCSS.form}>
      <h1 className={fpassCSS.h1}>Reset your Password</h1>
      <p className={fpassCSS.p}>
        A mail be sent to the mail to reset your password
      </p>
      <div className={fpassCSS.inputout}>
        <span>
          <FaUserAlt />
        </span>
        <input
          type="text"
          placeholder="E-Mail I.D"
          ref={emailRef}
          className={fpassCSS.input}
        />
      </div>
      <button type="submit" className={fpassCSS.enter}>
        Send
      </button>

      <p className={fpassCSS.p}>
        Already have an account?<Link to="/signing-pages">Log in</Link>
      </p>
    </form>
  );
}
export default Forpassuser;
