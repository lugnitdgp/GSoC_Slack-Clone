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
    console.log(email)
    console.log(pass)
    try {
      
    let { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass,
    });
      if (data) {
        console.log(data)
        settoken(data)
        navigate('/')
      } else if (error) {
        alert(error.message || error); 
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again later.');
    }
  }

    
    return(
        
        <form onSubmit={login}>
            
            <div className='box'>
            <h1>LOGIN</h1>
            <div className="email">
            <span>
            <FaUserAlt />
            </span>
            <input type="text" placeholder='E-Mail I.D' ref={emailRef} />
            </div>
            <div className="pass">
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
    )
}
export default Login