import './loginbox.css'
import supabase from '../supabase'
import { Link } from 'react-router-dom'
import { useState,useRef } from 'react'

function Login(){
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
            <input type="text" placeholder='E-Mail I.D' ref={emailRef} />
            </div>
            <div className="pass">
            <input type={passwordVisible ? 'text' : 'password'} placeholder='Password' ref={passRef}  />
            </div>
            <div className="forsh">
                <input type="checkbox" onClick={togglePasswordVisibility} name='show'/>
                <label htmlFor="show">Show Password</label>
                <a href="">Forgot Password</a>
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