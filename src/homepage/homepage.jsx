import { Getuserdetails } from '../database';
import { useState,useEffect } from 'react';
import supabase from '../supabase';
import homepaseCSS from './homepage.module.css';
import { FaEdit } from "react-icons/fa";

function Home(data) {
  const [isLoading, setIsLoading] = useState(true); // Use state to manage loading
  const [name, setName] = useState('');
  const [phno, setPhno] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const specific_user = await Getuserdetails(data.data.user.id);
      setIsLoading(false);
      if (specific_user) {
        setName(specific_user[0].username);
        setPhno(specific_user[0].phone);
      } else {
        console.log('No user found.');
      }
    };
    fetchData();
  }, [data]); // Run effect only when data changes
  return (
    <>
    {isLoading ? (
        <h1>Loading...</h1> // Display loading message while fetching
      ) : (
      <div className={homepaseCSS.whole}>
        <div className={homepaseCSS.box}>
          <div className={homepaseCSS.top}>
            <div className={homepaseCSS.search}></div>
            <div className={homepaseCSS.logo}></div>
          </div>
        <div className={homepaseCSS.bottom}>
        <div className={homepaseCSS.sidebar}>
          <div className={homepaseCSS.right}>
          <div className={homepaseCSS.userdetails}>
            <div className={homepaseCSS.userleft}>            
            <p>{name}</p> 
            </div>
            <div className={homepaseCSS.userright}>
            <FaEdit size={23} color='white'/>
            </div>
          </div>
              <div className={homepaseCSS.community}>
              <div className={homepaseCSS.contacts}></div>
                <div className={homepaseCSS.hashes}></div>
              </div>            
          </div>
          <div className={homepaseCSS.left}>
            <div className={homepaseCSS.allcom}></div>
          </div>
          </div>
        

          <div className={homepaseCSS.chatbox}>
            <div className={homepaseCSS.presentcontact}></div>
            <div className={homepaseCSS.chats}>
            </div>
            <div className={homepaseCSS.textwork}></div>
          </div>

        </div>
                  </div>
      </div>)}
    </>
  );
}

export default Home;
