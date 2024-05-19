import './fpass.css'
import supabase from '../supabase'
import { Link,useNavigate } from 'react-router-dom'
import { useState,useRef } from 'react'
import { FaUserAlt } from "react-icons/fa";

function Fpassuser({settoken}){
    let navigate=useNavigate()

    const emailRef = useRef('');
    
    async function fpass(b){
    b.preventDefault(); 
    const email = emailRef.current.value;
    try {
      
    
    let { data, error } = await supabase.auth.resetPasswordForEmail(email)

      if (data) {
        console.log(data)
        settoken(data)
        navigate('/newpass')
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
          <form onSubmit={fpass}>
            
            <div className='box'>
            <h1>Reset your Password</h1>
            <h3>A mail be sent to the mail to reset your password</h3>
            <div className="email input">
            <span>
            <FaUserAlt />
            </span>
            <input type="text" placeholder='E-Mail I.D' ref={emailRef} />
            </div>
            <div className="enter" >
                <button type='submit'>Send</button>
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
export default Fpassuser