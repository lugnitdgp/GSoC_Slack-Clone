import './loginbox.css'
import supabase from '../supabase'
import { Link,useNavigate } from 'react-router-dom'
import { useState,useRef } from 'react'
import { FaRegEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";

function Login({settoken}){
    let navigate=useNavigate()
    const [passwordVisible, setPasswordVisible] = useState(false);
    const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

    const emailRef = useRef('');
    const passRef = useRef('');

    async function login(b){
        b.preventDefault(); 
    const email = emailRef.current.value;
    const pass = passRef.current.value;
    if (email.trim() === '') {
        alert('Please enter an email address.');
        return;
        }
        if (pass.trim() === '') {
            alert('Please enter a password.');
            return;
            }
    if (!/^\S+@\S+\.\S+$/.test(email)) {                    //here ^checks for a string /S+ for non whitespace characters and $ gives end of the string//
          alert('Please enter a valid email address.');
          return;
        }
    
    try {
    console.log(email,pass)
    let { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass,
    });
    console.log(error)
      if (data) {
        console.log(data)     
        if(data.user!=null && data.session!=null){
          navigate('/')
          settoken(data)
        }
        else if(data.user==null && data.session==null){
          alert('check the details provided')
        }
        
      } else if (error) {
        alert(error.message || error); 
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again later.');
    }
  }

    
    return(
        <div className="page">
          <form onSubmit={login}>
            
            <div className='box'>
            <h1>LOGIN</h1>
            <div className="email input">
            <span>
            <FaUserAlt />
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
            <input type={passwordVisible ? 'text' : 'password'} placeholder='Password' ref={passRef}  />
            </div>
            <div className="forsh">
                <p><Link to='/fpassuser'>Forgot Password</Link></p>
            </div>
            <div className="enter" >
                <button type='submit'>Login</button>
            </div>
            <div className="other">
                <p>
                    Don't have an account yet?<Link to='/signup'>Sign up</Link> 
                </p>
            </div>          
        </div>
        </form>
        </div>
        
    )
}
export default Login