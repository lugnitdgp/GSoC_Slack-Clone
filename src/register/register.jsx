import './register.css';
import { SupabaseClient } from '@supabase/supabase-js';
import supabase from '../supabase.jsx';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

function Register() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const usernameRef = useRef('');
  const emailRef = useRef('');
  const phoneRef = useRef('');
  const passRef = useRef('');

  async function signup(b) {
    b.preventDefault();

    const username = usernameRef.current.value;
    const email = emailRef.current.value;
    const phone = phoneRef.current.value;
    const pass = passRef.current.value;

    try {
      let { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            username,
            phone,
          },
        },
      });

      if (data) {
        alert('Check your mail for verification!');
      } else if (error) {
        alert(error.message || error); 
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again later.');
    }
  }

  return (
    <form onSubmit={signup}>
      <div className='box'>
        <h1>Sign up</h1>
        <div className="username">
          <input type="text" placeholder='username' ref={usernameRef} /> 
        </div>
        <div className="email">
          <input type="text" placeholder='E-Mail I.D' ref={emailRef} /> 
        </div>
        <div className="phone">
          <input type="tel" placeholder='Ph No.' pattern="[0-9]{10}" ref={phoneRef} /> 
        </div>
        <div className="pass">
          <input type={passwordVisible ? 'text' : 'password'} placeholder='Password' ref={passRef} /> 
        </div>
        <div className="forsh">
                <input type="checkbox" onClick={togglePasswordVisibility} name='show'/>
                <label htmlFor="show">Show Password</label>
            </div>
        <div className="enter" type='submit'>
          <button>Signup</button>
        </div>
        <div className="other">
                <p>
                    Already have an account? <Link to='/login'>Login</Link> 
                </p>
            </div>
            
      </div>
    </form>
  );
}

export default Register;
