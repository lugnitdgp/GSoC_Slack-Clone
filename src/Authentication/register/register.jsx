import registerCSS from "./register.module.css";
import supabase from "../../supabase.jsx";
import { useState, useRef, useContext } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  FaUserAlt,
  FaGithub,
  FaRegEye,
  FaEyeSlash,
  FaGoogle,
  FaPhoneAlt,
} from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import { CheckemailExists } from "../../database.jsx";
import { Allconvers } from "../../context api/context.jsx";

function Register({ settoken }) {
  const { userId } = useContext(Allconvers);
  let navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false); //for hide and showing the pass we alter the input type to accomplishn this//
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible); //by this toggle paasword funcyion we change the state to the oppasite of the prev one
  const [passwordVisible2, setPasswordVisible2] = useState(false);
  const togglePasswordVisibility2 = () =>
    setPasswordVisible2(!passwordVisible2);

  const [lowerValid, setLower] = useState(false);
  const [upperValid, setUpper] = useState(false);
  const [numValid, setNum] = useState(false);
  const [splValid, setSpl] = useState(false); //for checking the strength of the password//
  const [lenValid, setLen] = useState(false);
  const [allValid, setAllValid] = useState(false);

  const usernameRef = useRef("");
  const emailRef = useRef(""); //first made sure that the content of the data being taken into are empty//
  const phoneRef = useRef("");
  const passRef = useRef("");
  const cpassRef = useRef("");

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

  const passwordChange = (value) => {
    console.log(passRef); //regexp searches for the specific pattern in strings and here we use to check our
    const lower = new RegExp("(?=.*[a-z])"); //requirements in the password ?= checks for a patter in string . for all characters
    const upper = new RegExp("(?=.*[A-Z])"); //of this pattern that we contain after it and * (basically to say except newline)for all those in that pattern that might repeat
    const num = new RegExp("(?=.*[0-9])"); //atleast once as we mentioned the pattern here//
    const len = new RegExp("(?=.*[\\S]{8,})");
    const spl = new RegExp("(?=.*[^a-zA-Z0-9s])"); // Matches any character except letters, numbers, and whitespace
    //here\ is used to strictly mean a specific spl char//
    setLower(lower.test(value));
    setUpper(upper.test(value));
    setNum(num.test(value));
    setLen(len.test(value));
    setSpl(spl.test(value));
    setAllValid(lowerValid && upperValid && numValid && splValid && lenValid);
  };
  async function signup(e) {
    e.preventDefault();
    const username = usernameRef.current.value; //used useRef because spreading and updating the data didn't work using usestate//
    const email = emailRef.current.value;
    const phone = phoneRef.current.value;
    const password = passRef.current.value;
    const confirmPassword = cpassRef.current.value;
    if (username.trim() === "") {
      alert("Please enter a username."); //.trim is used to remove the blank spaces before the text is entered//
      return;
    }
    if (email.trim() === "") {
      alert("Please enter an email address.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      //here ^checks for a string /S+ for non whitespace characters and $ gives end of the string//
      alert("Please enter a valid email address.");
      return;
    }

    if (phone.trim() === "") {
      alert("Please enter a phone number.");
      return;
    }

    if (!password || password.trim() === "") {
      alert("Please enter a password."); //!password is true and gives alert if the input is empty or password is not defined
      return; //but we also need to trim and check because the user might enter spaces and leave it blank//
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    let isPasswordStrong =
      lowerValid && upperValid && numValid && splValid && lenValid;
    setAllValid(isPasswordStrong);
    if (!allValid) {
      alert(
        "Password is not strong enough. Please ensure it meets the following criteria:\n- Minimum 8 characters\n- Lowercase letter\n- Uppercase letter\n- Number\n- Special character"
      );
      return;
    }
    const doesemailExist = await CheckemailExists(email);
    if (!doesemailExist) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedpass = await bcrypt.hash(password, salt);
        console.log(hashedpass);
        let { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            emailRedirectTo: `${origin}/`,
            data: {
              username: username,
              phone: phone,
              avatar_url: null,
              hash_password: hashedpass,
            },
          },
        });

        if (data) {
          console.log(data);
          if (data.user != null && data.session != null) {
            alert("Sign up successful");
            settoken(data);
            navigate("/");
          } else if (data.user == null && data.session == null) {
            alert("check the details provided");
          }
        } else if (error) {
          alert(error.message || error);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    } else {
      alert("the given mail already exists");
    }
  }

  return (
    <form onSubmit={signup} className={registerCSS.form}>
      <h1 className={registerCSS.h1}>Sign up</h1>
      <div className={registerCSS.social}>
        <div
          className={registerCSS.media}
          onClick={() => handleOAuth("google")}
        >
          <FaGoogle />
        </div>
        <div
          className={registerCSS.media}
          onClick={() => handleOAuth("github")}
        >
          <FaGithub />
        </div>
      </div>
      <p className={registerCSS.p}>Or use your E-Mail</p>
      <div className={registerCSS.inputout}>
        <span>
          <FaUserAlt />
        </span>
        <input
          type="text"
          placeholder="username"
          ref={usernameRef}
          className={registerCSS.input}
        />
      </div>
      <div className={registerCSS.inputout}>
        <span>
          <IoMdMail />
        </span>
        <input
          type="text"
          placeholder="E-Mail I.D"
          ref={emailRef}
          className={registerCSS.input}
        />
      </div>
      <div className={registerCSS.inputout}>
        <span>
          <FaPhoneAlt />
        </span>
        <input
          type="tel"
          placeholder="Ph No."
          pattern="[0-9]{10}"
          ref={phoneRef}
          className={registerCSS.input}
        />
      </div>
      <div className={registerCSS.inputout}>
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
          className={registerCSS.input}
          onChange={(e) => {
            passwordChange(e.target.value);
          }}
        />
      </div>
      <div className={registerCSS.inputout}>
        {passwordVisible2 ? (
          <span onClick={togglePasswordVisibility2}>
            <FaRegEye />
          </span>
        ) : (
          <span onClick={togglePasswordVisibility2}>
            <FaEyeSlash />
          </span>
        )}
        <input
          type={passwordVisible2 ? "text" : "password"}
          placeholder="Confirm Password"
          ref={cpassRef}
          className={registerCSS.input}
        />
      </div>
      <button className={registerCSS.enter} type="submit">
        Signup
      </button>
    </form>
  );
}
export default Register;
