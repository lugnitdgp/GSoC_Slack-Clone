import './newpass.css'; 
import supabase from '../supabase.jsx';
import { useState, useRef } from 'react';
import { Link,Navigate, useNavigate } from 'react-router-dom';
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";


function Newpass({ settoken }) {
  let navigate=useNavigate()
  const [passwordVisible, setPasswordVisible] = useState(false);          //for hide and showing the pass we alter the input type to accomplishn this//
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const [lowerValid, setLower] = useState(false);
  const [upperValid, setUpper] = useState(false);
  const [numValid, setNum] = useState(false);
  const [splValid, setSpl] = useState(false);   //for checking the strength of the password//
  const [lenValid, setLen] = useState(false);
  const [allValid, setAllValid] = useState(false); 
   
  const emailRef = useRef(''); //first made sure that the cons of the data being taken into are empty//
  
  const passRef = useRef(''); 
  const cpassRef = useRef('');
    
  const passwordChange = (value) => {     
    console.log(passRef)                                           //regexp searches for the specific pattern in strings and here we use to check our
    const lower = new RegExp('(?=.*[a-z])');   //requirements in the password ?= checks for a patter in string . for all characters
    const upper = new RegExp('(?=.*[A-Z])');   //of this pattern that we contain after it and * (basically to say except newline)for all those in that pattern that might repeat
    const num = new RegExp('(?=.*[0-9])');     //atleast once as we mentioned the pattern here//
    const len = new RegExp('(?=.*[\\S]{8,})'); 
    const spl = new RegExp('(?=.*[^a-zA-Z0-9\s])'); // Matches any character except letters, numbers, and whitespace
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
    const email = emailRef.current.value;
    const password = passRef.current.value;         //used useRef because spreading and updating the data didn't work using usestate//
    const confirmPassword = cpassRef.current.value;
    if (email.trim() === '') {
    alert('Please enter an email address.');
    return;
    }
if (!/^\S+@\S+\.\S+$/.test(email)) {                    //here ^checks for a string /S+ for non whitespace characters and $ gives end of the string//
      alert('Please enter a valid email address.');
      return;
    }

    if (!password || password.trim() === '') {
      alert('Please enter a password.');            //!password is true and gives alert if the input is empty or password is not defined
      return;                                       //but we also need to trim and check because the user might enter spaces and leave it blank//
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    let isPasswordStrong = lowerValid && upperValid && numValid && splValid && lenValid;
    setAllValid(isPasswordStrong);
    if (!allValid) {
      alert('Password is not strong enough. Please ensure it meets the following criteria:\n- Minimum 8 characters\n- Lowercase letter\n- Uppercase letter\n- Number\n- Special character');
      return;
    }
          
    try {
      
    const { data, error } = await supabase.auth.updateUser({
        email: email,
        password: password,
    })
      if (data) {
        alert('Successfully Updated the Changes');
        console.log(data);
        settoken(data); 
        navigate('/')
      } else if (error) {
        alert(error.message || error);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again later.');
    }
  }

  return (
    <div className="page">
        <form onSubmit={signup}>
      <div className='box'>
        <h1>Update your Account</h1>
        <div className="email input">
        <span>
          <IoMdMail />
          </span>
          <input type="text" placeholder='E-Mail I.D' ref={emailRef} />
          
        </div>
        <div className="pass input">
        {passwordVisible ? 
          <span onClick={togglePasswordVisibility}>
            <FaRegEye />
          </span>: <span onClick={togglePasswordVisibility}>
          <FaEyeSlash />
          </span>  }
          <input type={passwordVisible ? 'text' : 'password'} placeholder='Password' ref={passRef} onChange={(e) => {passwordChange(e.target.value)}} /> 
        </div>
        <div className="cpass input">
        {passwordVisible ? 
          <span onClick={togglePasswordVisibility}>
            <FaRegEye />
          </span>: <span onClick={togglePasswordVisibility}>
          <FaEyeSlash />
          </span>  }
          <input type={passwordVisible ? 'text' : 'password'} placeholder='Confirm Password' ref={cpassRef} />
        </div>
        <div className="enter" type='submit'>
          <button>Update</button>
        </div>
        <div className="other">
          <p>
            Already have an account? <Link to='/login'>Login</Link>
          </p>
        </div>
      </div>
    </form>
    </div>
    
  );
}
export default Newpass