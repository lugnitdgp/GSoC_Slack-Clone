import { useContext, useEffect, useState } from "react";
import { UserdetailsbyName } from "../database";
import chatboxnavCSS from "./chatboxnav.module.css";
import { Allconvers } from "../context api/context";
import supabase from "../supabase";

export default function Searchuser({ currentUser }) {
  const { Dm, setDm } = useContext(Allconvers);
  const [Username, setUsername] = useState("");
  const [user, setUser] = useState(null); // Initialize with null
  const [dmopen, setDmopen] = useState(false);
  const [currentuserdm_chats, setcurrentuserdm_chats] = useState([]);
  const [userdm_chats, setuserdm_chats] = useState([]);
  const [combinedIdExists, setcombinedidExists] = useState(false);
  const [combinedIdExists2, setcombinedidExists2] = useState(false);
  const [clickeduser, setClickeduser] = useState(null);
  const [combinedId, setcombinedId] = useState("");

  useEffect(() => {
    console.log("dm stored current", currentuserdm_chats);
    console.log("dm stored user", userdm_chats);
    console.log(combinedId);
  }, [combinedId, currentuserdm_chats, userdm_chats]);

  // Handle search input and fetch user details
  const handleSearch = async () => {
    const fetchedUser = await UserdetailsbyName(Username);

    if (fetchedUser && fetchedUser.length > 0) {
      setUser(fetchedUser);
    } else {
      setUser(null); // Set user to null to display "No User Found"
    }
  };

  // Trigger search on Enter key press
  const handleInput = (e) => {
    if (e.code === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    async function fetchCurrentUserDmChats() {
      let { data: dmstored, error } = await supabase
        .from("direct_messages")
        .select("dm_chats")
        .eq("id", currentUser.id);

      if (error) {
        console.error("Error fetching user data:", error);
      } else {
        setcurrentuserdm_chats(dmstored[0]?.dm_chats || []);
      }
    }

    fetchCurrentUserDmChats();
  }, [clickeduser]);

  useEffect(() => {
    if (clickeduser) {
      const combinedid =
        clickeduser.id > currentUser.id
          ? clickeduser.id + currentUser.id
          : currentUser.id + clickeduser.id;
      setcombinedId(combinedid);

      async function fetchUserDmChats(user) {
        let { data: dmstored2, error } = await supabase
          .from("direct_messages")
          .select("dm_chats")
          .eq("id", user.id);

        if (error) {
          console.error("Error fetching user data:", error);
        } else {
          setuserdm_chats(dmstored2[0]?.dm_chats || []);
        }
      }

      fetchUserDmChats(clickeduser);
    }
  }, [clickeduser, currentUser.id]);

  useEffect(() => {
    if (combinedId) {
      const checkCombinedIdExists = (chats) =>
        chats.some((chat) => chat.combinedId === combinedId);

      const currentUserCombinedIdExists = checkCombinedIdExists(currentuserdm_chats);
      const selectedUserCombinedIdExists = checkCombinedIdExists(userdm_chats);

      setcombinedidExists(currentUserCombinedIdExists);
      setcombinedidExists2(selectedUserCombinedIdExists);

      if (!currentUserCombinedIdExists || !selectedUserCombinedIdExists) {
        (async () => {
          try {
            const { data, error } = await supabase
              .from("chats_dm")
              .insert([{ id: combinedId, messages: [] }])
              .select();
      
            if (data) {
              console.log(data);
            } else {
              console.log("Error inserting chat:", error);
            }
          } catch (error) {
            console.log("Error in new chat creation:", error);
          }
          if (!currentUserCombinedIdExists) {
            try {
              const { data, error } = await supabase
                .from("direct_messages")
                .update({
                  dm_chats: [
                    ...currentuserdm_chats,
                    {
                      combinedId: combinedId,
                      userinfo: {
                        uid: clickeduser.id,
                        uusername: clickeduser.username,
                        uemail: clickeduser.email,
                        uphoto: clickeduser.avatar_url,
                      },
                      date: new Date().toISOString(),
                    },
                  ],
                })
                .eq("id", currentUser.id)
                .select();

              if (error) {
                console.error("Error updating direct message:", error);
              } else {
                console.log("Message updated successfully current:", data);
              }
            } catch (error) {
              console.error("Unexpected error:", error);
            }
          }

          if (!selectedUserCombinedIdExists) {
            try {
              const { data, error } = await supabase
                .from("direct_messages")
                .update({
                  dm_chats: [
                    ...userdm_chats,
                    {
                      combinedId: combinedId,
                      userinfo: {
                        uid: currentUser.id,
                        uusername: currentUser.username,
                        uemail: currentUser.email,
                        uphoto: currentUser.avatar_url,
                      },
                      date: new Date().toISOString(),
                    },
                  ],
                })
                .eq("id", clickeduser.id)
                .select();

              if (error) {
                console.error("Error updating direct message2:", error);
              } else {
                console.log("Message updated successfully2 user:", data);
              }
            } catch (error) {
              console.error("Unexpected error2:", error);
            }
          }
        })();
      } else {
        console.log("Combined ID already exists for both users");
      }
    }
  }, [combinedId, currentuserdm_chats, userdm_chats, clickeduser, currentUser.id]);

  const handleUser = async (user) => {
    setClickeduser(user);
    setDmopen(true);
    setDm(false);

    
  };

  return (
    <>
      {dmopen && !Dm ? (
        <p>Hiiiii</p>
      ) : (
        <>
          <div className={chatboxnavCSS.searchbar}>
            <div className={chatboxnavCSS.heading}>
              <p>New Message</p>
            </div>
            <div className={chatboxnavCSS.enter}>
              <label htmlFor="to">To:</label>
              <div className={chatboxnavCSS.in}>
                <input
                  type="text"
                  name="to"
                  className={chatboxnavCSS.input}
                  placeholder="Find a User"
                  onKeyDown={handleInput}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className={chatboxnavCSS.chats}>
            {user ? (
              user.map((u) => (
                <div
                  key={u.id}
                  className={chatboxnavCSS.Suserbox}
                  onClick={() => handleUser(u)}
                >
                  <div className={chatboxnavCSS.Suserphoto}>
                    <img
                      src={u.avatar_url}
                      alt=""
                      className={chatboxnavCSS.img}
                    />
                  </div>
                  <div className={chatboxnavCSS.Suserinfo}>
                    <p>{u.username}</p>
                    <p>{u.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className={chatboxnavCSS.Suserbox}>
                <div className={chatboxnavCSS.Suserphoto}></div>
                <div className={chatboxnavCSS.Suserinfo}>
                  <p>No User Found</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
