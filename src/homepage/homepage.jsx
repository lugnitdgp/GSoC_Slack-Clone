import { Getuserdetails, idm, fetchUserDmChats } from "../database";
import { useState, useEffect, useContext } from "react";
import supabase from "../supabase";
import homepaseCSS from "./homepage.module.css";
import { FaEdit } from "react-icons/fa";
import Searchuser from "./chatboxnav";
import { FaPowerOff } from "react-icons/fa6";
import { Allconvers } from "../context api/context";
import { Chatcontext } from "../context api/chatcontext";
import { Chats } from "./chats";

function Home(data) {
  const { setUserId, currentUser, userId, Dm, setDm } = useContext(Allconvers);
  const {dispatch}=useContext(Chatcontext)
  const [isLoading, setIsLoading] = useState(true); // Use state to manage loading
  const [name, setName] = useState("");
  const [phno, setPhno] = useState("");
  const [confirmdm, setConformdm] = useState(false);
  const [dmcontacts, setDmcontacts] = useState([]);
  const [conupdate, setConupdate] = useState(false);
  const[chat,setchat]=useState(false)

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
    const fetchdmdata = async () => {
      const dmcontactinfo = await fetchUserDmChats(data.data.user);
      if (dmcontactinfo) {
        console.log("dmchatinfo:", dmcontactinfo);
        setDmcontacts(dmcontactinfo);
        console.log("dmchatinfo2:", dmcontacts);
      }
    };

    fetchData();
    fetchdmdata();
  }, [data]);
  useEffect(() => {
    const insertdm = async () => {
      const idm0 = await idm(userId);
      console.log(idm0);
    };
    insertdm();
  }, [userId]); // Run effect only when data changes
  useEffect(() => {
    console.log("newdminfochange2", dmcontacts);
    setConupdate(false)
  
  }, [dmcontacts]);
  useEffect(() => {
    console.log("dmload", conupdate);

  }, [conupdate]);
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
  useEffect(() => {
    const dmchats = () => {
      
      const channel = supabase
        .channel("currentdmchats-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "direct_messages",
            select: "dm_chats",
            filter: `id=eq.${data.data.user.id}`,
          },
          (payload) => {
            setConupdate(true)
            setDmcontacts((prevdmcontacts) => {
              const updatedContacts = [...prevdmcontacts, payload.new];
              setConupdate(true); 
              return updatedContacts;
            });
            
            console.log("Change received!", payload);
            

          }
        )
        .subscribe();

      // Cleanup function to unsubscribe from the channel
      return () => {
        supabase.removeChannel(channel);
        
      };
    };
    data.data.user.id && dmchats();
  }, [data.data.user.id]);
  const handlechatselect=(u)=>{
    dispatch({type:"Change_user" ,payload:u})
  }
  console.log(Object.entries(dmcontacts));
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
                          setConformdm(true);
                          
                        }}
                      >
                        Direct message
                      </button>

                     {!conupdate?(
                       Object.entries(dmcontacts)?.map((contact) => (
                        <div
                          className={homepaseCSS.sdmcontact}
                          key={contact[1].combinedId} onClick={()=>{handlechatselect(contact[1].userinfo)
                            setchat(true)
                            setConformdm(false)
                            setDm(false)
                          }}
                        >
                          <img src="" alt="" className={homepaseCSS.sdmimg} />
                          <div className={homepaseCSS.sdmcontactinfo}>
                            <>
                              <span className={homepaseCSS.sdmcontactname}>
                                {contact[1]?.userinfo?.uusername}
                              </span>
                              <span className={homepaseCSS.sdmcontactmail}>
                                {contact[1]?.userinfo?.uemail}
                              </span>
                            </>
                          </div>
                        </div>
                      ))
                     ):(<p>Loading</p>)}
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
                {Dm || confirmdm ? (
                  <Searchuser currentUser={currentUser[0]} setconupdate={setConupdate} setdmcontacts={setDmcontacts}/>
                ) : (
                  chat?(<Chats />):(<>
                    <div className={homepaseCSS.presentcontact}></div>
                    <div className={homepaseCSS.chats}></div>
                  </>)
                )
                }
                
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
