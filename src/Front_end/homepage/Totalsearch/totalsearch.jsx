import { useState, useEffect, useContext } from "react";
import { fetchUserDmChats, fetchUserchannelsbyid } from "../../database";
import totalsearchCSS from "./totalsearch.module.css";
import { Allconvers } from "../../context api/context";
import { Channelcontext } from "../../context api/channelcontext.jsx";
import { Chatcontext } from "../../context api/chatcontext";

const Totalsearch = () => {
  const { currentUser, setDm, setChannelchat, setConformdm, setchat } =
    useContext(Allconvers);
  const { dispatch } = useContext(Chatcontext);
  const { dispatchchannel } = useContext(Channelcontext);
  const [dmcontacts, setdmcontacts] = useState([]);
  const [channels, setchannels] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

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
      <input
        type="text"
        value={search}
        onChange={handleInput}
        onClick={() => setSearchResults([])}
        onBlur={handleBlur}
        placeholder="Search a Channel or Contact...."
        className={totalsearchCSS.input}
      />
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
};

export default Totalsearch;
