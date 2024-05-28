import { Getuserdetails, idm } from "../database";
import { useState, useEffect, useContext } from "react";
import supabase from "../supabase";
import homepaseCSS from "./homepage.module.css";
import { FaEdit } from "react-icons/fa";
import Searchuser from "./chatboxnav";
import { FaPowerOff } from "react-icons/fa6";
import { Allconvers } from "../context api/context";

function Home(data) {
  const { setUserId, currentUser, userId,Dm, setDm } = useContext(Allconvers);
  const [isLoading, setIsLoading] = useState(true); // Use state to manage loading
  const [name, setName] = useState("");
  const [phno, setPhno] = useState("");
  const[confirmdm,setConformdm]=useState(false)


  useEffect(() => {
    const fetchData = async () => {
      const specific_user = await Getuserdetails(data.data.user.id);
      setIsLoading(false);
      if (specific_user) {
        setName(specific_user[0].username);
        setPhno(specific_user[0].phone);
        setUserId(specific_user[0].id);
        console.log(currentUser);
      } else {
        console.log("No user found.");
      }
    };
    fetchData();
  }, [data]);
  useEffect(() => {
    const insertdm = async () => {
      const idm0 = await idm(userId);
      console.log(idm0);
    };
    insertdm();
  }, [userId]); // Run effect only when data changes

  async function signout() {
    try {
      let { error } = await supabase.auth.signOut();

      if (error) {
        console.log(error);
      } else {
        localStorage.removeItem("token");
        window.location.reload();
        alert("successfully logged out");
      }
    } catch (error) {
      console.log(error);
    }
  }

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
                      <p className={homepaseCSS.NaMe}>{name}</p>
                    </div>
                    <div className={homepaseCSS.userright}>
                      <FaEdit
                        className={homepaseCSS.faedit}
                        size={23}
                        color="white"
                      />
                    </div>
                  </div>
                  <div className={homepaseCSS.community}>
                    <div className={homepaseCSS.hashes}>
                      <p>Channels</p>
                    </div>
                    <div className={homepaseCSS.contacts}>
                      <button
                        className={homepaseCSS.dm}
                        onClick={(s) => {
                          setDm(true);
                          setConformdm(true)
                        }}
                      >
                        {console.log(Dm)}
                        Direct message
                      </button>
                    </div>
                  </div>
                </div>
                <div className={homepaseCSS.left}>
                  <div className={homepaseCSS.allcom}>
                    <FaPowerOff
                      size={30}
                      color="white"
                      className={homepaseCSS.poweroff}
                      onClick={() => signout()}
                    />
                  </div>
                </div>
              </div>

              <div className={homepaseCSS.chatbox}>
                {Dm ||confirmdm ? (
                  <Searchuser
                    currentUser={currentUser[0]} 
                  />
                ) : (
                  <>
                    <div className={homepaseCSS.presentcontact}></div>
                    <div className={homepaseCSS.chats}></div>
                  </>
                )}
                <div className={homepaseCSS.textwork}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
