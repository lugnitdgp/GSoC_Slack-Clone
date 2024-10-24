import { useState, useEffect, useContext } from "react";
import { fetchUserDmChats, fetchUserchannelsbyid } from "../../database";
import totalsearchCSS from "./totalsearch.module.css";
import { Allconvers } from "../../context api/context";
import { Channelcontext } from "../../context api/channelcontext.jsx";
import { Chatcontext } from "../../context api/chatcontext";
import supabase from "../../supabase.jsx";
import { FaSearch } from "react-icons/fa";

const Totalsearch = () => {
  const { currentUser, setDm, setChannelchat, setConformdm, setchat } =
    useContext(Allconvers);
  const { dispatch } = useContext(Chatcontext);
  const { dispatchchannel } = useContext(Channelcontext);
  const [dmcontacts, setdmcontacts] = useState([]);
  const [channels, setchannels] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [fetchchannelupdate, setFetchchanupdate] = useState(false);
  const [fetchdmupdate, setFetchdmupdate] = useState(false);

  if (currentUser[0]?.id) {
    useEffect(() => {
      const fetchdata = async () => {
        const fetcheddm = await fetchUserDmChats(currentUser[0]);
        const filteredDm = fetcheddm.filter((contact) => contact.showstatus);
        setdmcontacts(filteredDm);
        const fetchedchannel = await fetchUserchannelsbyid(currentUser[0].id);
        setchannels(fetchedchannel);
      };
      fetchdata();
    }, [currentUser]);
    useEffect(() => {
      const fetchdata = async () => {
        const fetcheddm = await fetchUserDmChats(currentUser[0]);
        const filteredDm = fetcheddm.filter((contact) => contact.showstatus);
        setdmcontacts(filteredDm);
        const fetchedchannel = await fetchUserchannelsbyid(currentUser[0].id);
        setchannels(fetchedchannel);
        setFetchchanupdate(false);
        setFetchdmupdate(false);
      };
      fetchdata();
    }, [fetchchannelupdate, fetchdmupdate]);

    useEffect(() => {
      const dmchatslisten = () => {
        const dmchannel = supabase
          .channel("currentdmchatschannel") //to listen to the real time changes in the dm contacts and i also tried updating the contacts
          .on(
            //by using the new payload we get but i faced a lag in the time to change the state after the payload
            "postgres_changes", //is recieved but got errors so i instead used a state to get like a signal that there is contact
            {
              //added and then again fetched the contact details again
              event: "*",
              schema: "public",
              table: "direct_messages",
              select: "dm_chats",
              filter: `id=eq.${currentUser[0].id}`,
            },
            (payload) => {
              setFetchdmupdate(true);
              console.log("Change received!", payload);
            }
          )
          .subscribe();

        // Cleanup function to unsubscribe from the channel
        return () => {
          supabase.removeChannel(dmchannel);
        };
      };
      const channelslisten = () => {
        const channels = supabase
          .channel("currentchannellist") //to listen to the real time changes in the dm contacts and i also tried updating the contacts
          .on(
            //by using the new payload we get but i faced a lag in the time to change the state after the payload
            "postgres_changes", //is recieved but got errors so i instead used a state to get like a signal that there is contact
            {
              //added and then again fetched the contact details again
              event: "*",
              schema: "public",
              table: "channels_list",
              select: "channels",
              filter: `id=eq.${currentUser[0].id}`,
            },
            (payload) => {
              setFetchchanupdate(true);
              console.log("Change received!", payload);
            }
          )
          .subscribe();

        // Cleanup function to unsubscribe from the channel
        return () => {
          supabase.removeChannel(channels);
        };
      };
      dmchatslisten();
      channelslisten();
    }, [currentUser[0]]);

    useEffect(() => {
      if (search.trim() === "") {
        setSearchResults([]);
        return;
      }

      const filteredDmContacts = dmcontacts.filter((contact) =>
        contact.userinfo.uusername.toLowerCase().includes(search.toLowerCase())
      );

      const filteredChannels = channels.filter((channel) =>
        channel.channelname.toLowerCase().includes(search.toLowerCase())
      );

      setSearchResults([...filteredDmContacts, ...filteredChannels]);
    }, [dmcontacts, channels, search]);

    const handleInput = (e) => {
      setSearch(e.target.value);
    };

    const handleChannelSelect = (channel) => {
      dispatchchannel({ type: "Change_channel", payload: channel });
      resetSearch();
      setDm(false);
      setChannelchat(true);
      setConformdm(false);
      setchat(false);
    };

    const handleDMSelect = (userinfo) => {
      dispatch({ type: "Change_user", payload: userinfo });
      resetSearch();
      setDm(false);
      setChannelchat(false);
      setConformdm(false);
      setchat(true);
    };

    const resetSearch = () => {
      setSearch("");
      setSearchResults([]);
    };

    const handleBlur = (e) => {
      // Check if the relatedTarget (where focus is going) is not inside results
      if (
        e.relatedTarget &&
        !e.currentTarget.contains(e.relatedTarget) &&
        e.relatedTarget.className !== totalsearchCSS.resultItem
      ) {
        setShowResults(false);
      }
    };

    return (
      <div className={totalsearchCSS.container}>
        <div className={totalsearchCSS.input}>
          {search === '' && ( // Only show icon when input is empty
            <FaSearch className={totalsearchCSS.inputSearch} />
          )}
          <input
            type="text"
            value={search}
            onChange={handleInput}
            placeholder={search === '' ? 'Search a Channel or Contact...' : ''} // Placeholder disappears when typing
            className={totalsearchCSS.inputBox}
          />
        </div>
        {search.trim() !== "" && (
          <div className={totalsearchCSS.results}>
            {searchResults.map((result, index) => (
              <div
                key={index}
                className={totalsearchCSS.resultItem}
                onClick={() => {
                  if (result.userinfo) {
                    handleDMSelect(result.userinfo);
                  } else {
                    handleChannelSelect(result);
                  }
                }}
              >
                {result.userinfo ? (
                  <div
                    className={`${totalsearchCSS.dmContact} ${totalsearchCSS.item}`}
                  >
                    <p>DM Contact: {result.userinfo.uusername}</p>
                    <p>Email: {result.userinfo.uemail}</p>
                  </div>
                ) : (
                  <div
                    className={`${totalsearchCSS.channel} ${totalsearchCSS.item}`}
                  >
                    <p>Channel: {result.channelname}</p>
                    <p>Created by: {result.channelinfo.createdby}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
};

export default Totalsearch;
