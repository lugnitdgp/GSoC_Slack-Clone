import { useContext, useEffect, useState } from "react";
import { UserdetailsbyName } from "../database";
import chatboxnavCSS from "./chatboxnav.module.css";
import { Allconvers } from "../context api/context";
import supabase from "../supabase";

export default function Searchuser({currentUser}) {
    const{Dm,setDm}=useContext(Allconvers)
  const [Username, setUsername] = useState("");
  const [user, setUser] = useState(null); // Initialize with null
const[dmopen,setDmopen]=useState(false)
  // Log current user ID
    
  console.log(currentUser.id);

  // Log user state updates
  useEffect(() => {
    if (user && user.length > 0) {
      console.log("User State Updated:", user[0].id);
    }
  }, [user]);

  // Handle search input and fetch user details
  const handleSearch = async () => {
    
    const fetchedUser = await UserdetailsbyName(Username);
    console.log(fetchedUser);
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

  // Handle user click to create a new chat
  const handleUser = async () => {
    if (user && user.length > 0) {
      const combinedId =
        user[0].id > currentUser.id
          ? user[0].id + currentUser.id
          : currentUser.id + user[0].id;
      console.log(combinedId);
      setDmopen(true)
      setDm(false)
      
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
      try {
        const { data, error } = await supabase
          .from("direct_messages")
          .update({
            dm_chats: [
              {
                combinedId: {
                  //update the intiaziation of chat between current user and the user they
                  userinfo: {
                    //searched for to the current user
                    uid: user[0].id,
                    uusername: user[0].username,
                    uphoto: user[0].avatar_url,
                  }, // Assuming user[0].id is the user's ID
                  date: new Date().toISOString(), // Store date in ISO format
                },
              },
            ],
          })
          .eq("id", currentUser.id) // Filter by current user's ID
          .select(); // Get the updated row (optional)

        if (error) {
          console.error("Error updating direct message:", error);
          // Handle error (e.g., display error message to user)
        } else {
          console.log("Message updated successfully:", data);
          
          // Handle successful update (e.g., update UI)
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        // Handle unexpected errors
      }

      try {
        const { data, error } = await supabase
          .from("direct_messages")
          .update({
            dm_chats: [
              {
                combinedId: {
                  userinfo: {
                    uid: currentUser.id, //update the intiaziation of chat between current user and the user they
                    uusername: currentUser.username, //searched for to the the user the current user searched
                    uphoto: currentUser.avatar_url,
                  },
                  date: new Date().toISOString(), // Store date in ISO format
                },
              },
            ],
          })
          .eq("id", user[0].id) // Filter by current user's ID
          .select(); // Get the updated row (optional)

        if (error) {
          console.error("Error updating direct message2:", error);
          // Handle error (e.g., display error message to user)
        } else {
          console.log("Message updated successfully2:", data);
          // Handle successful update (e.g., update UI)
        }
      } catch (error) {
        console.error("Unexpected error2:", error);
        // Handle unexpected errors
      }
    }
  };
console.log(dmopen,Dm)
  return (
    <>
      {dmopen&&(!Dm) ?(<p>Hiiiii</p>):(
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
          <div className={chatboxnavCSS.Suserbox} onClick={handleUser}>
            <div className={chatboxnavCSS.Suserphoto}>
              <img
                src={user[0].avatar_url}
                alt=""
                className={chatboxnavCSS.img}
              />
            </div>
            <div className={chatboxnavCSS.Suserinfo}>
              <p>{user[0].username}</p>
            </div>
          </div>
        ) : (
          <div className={chatboxnavCSS.Suserbox}>
            <div className={chatboxnavCSS.Suserphoto}></div>
            <div className={chatboxnavCSS.Suserinfo}>
              <p>No User Found</p>
            </div>
          </div>
        )}
      </div></>
      )}
    </>
  );
}