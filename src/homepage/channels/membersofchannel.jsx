import { useContext, useEffect, useState } from "react";
import supabase from "../../supabase";
import channelmembersCSS from "./membersofchannel.module.css";
import { Allconvers } from "../../context api/context";
import { ImCross } from "react-icons/im";
import { Channelcontext } from "../../context api/channelcontext";
import { fetchchannelmember, Getuserdetails } from "../../database";
import { BsThreeDotsVertical } from "react-icons/bs";

const Showmembers = () => {
  const { showmembers, setShowmembers } = useContext(Allconvers);
  const [members, setMembers] = useState([]);
  const [refreshmem, setrefreshmem] = useState(false);
  const { channel_data } = useContext(Channelcontext);
  const [fetchdone, setfetchdone] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchMemAndDetails = async () => {
      const members = await fetchchannelmember(channel_data.channel_id);
      const memberIds = members[0].channel_members;
      const detailedMembers = await Promise.all(
        //here Promis.all is used as we can map only resolved ie static data so we wait till the async data
        memberIds.map(async (memberId) => {
          //becomes completely fetched and static and then map the arrays.
          try {
            const memberDetails = await Getuserdetails(memberId.member_id);
            return memberDetails; // Return the full member object
          } catch (error) {
            console.error(error);
            return null; // Handle errors by returning null to avoid rendering empty elements
          }
        })
      );
      setMembers(detailedMembers.filter(Boolean)); // Filter out null values from errors
      setrefreshmem(false);
      setfetchdone(true);
    };

    fetchMemAndDetails();
  }, [channel_data.channel_id, refreshmem]);

  useEffect(() => {
    const fetchmem = async () => {
      const currentmem = await fetchchannelmember(channel_data.channel_id);
      const currentmember = currentmem[0].channel_members;
      const detailedMembers = await Promise.all(
        currentmember.map(async (memberId) => {
          try {
            const memberDetails = await Getuserdetails(memberId.member_id);
            return memberDetails; // Return the full member object
          } catch (error) {
            console.error(error);
            return null; // Handle errors by returning null to avoid rendering empty elements
          }
        })
      );
      setMembers(detailedMembers.filter(Boolean)); // Filter out null values from errors
    };
    fetchmem();
  }, []);

  useEffect(() => {
    console.log(members);
  }, [members]);

  useEffect(() => {
    if (username == "") {
      setrefreshmem(true);
    }
  }, [username]);

  useEffect(() => {
    const memb = () => {
      const me = supabase
        .channel("custom-filter-member")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "channels_message",
            filter: `channel_id=eq.${channel_data.channel_id}`,
          },
          (payload) => {
            setrefreshmem(true);
          }
        )
        .subscribe();

      // Cleanup function to unsubscribe from the channel to avoid data leakage
      return () => {
        supabase.removeChannel(me);
      };
    };
    memb();
  }, [channel_data.channel_id]);

  const handleInput = (e) => {
    if (e.code === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    setfetchdone(false);
    const currentmembers = await fetchchannelmember(channel_data.channel_id);
    const currentmems = currentmembers[0].channel_members;
    const matcheds = currentmems.filter((currentmem) =>
      currentmem.member_name.toLowerCase().includes(username.toLowerCase())
    );
    const detailedMembers = await Promise.all(
      matcheds.map(async (memberId) => {
        try {
          const memberDetails = await Getuserdetails(memberId.member_id);
          return memberDetails; // Return the full member object
        } catch (error) {
          console.error(error);
          return null; // Handle errors by returning null to avoid rendering empty elements
        }
      })
    );
    setMembers(detailedMembers.filter(Boolean)); // Filter out null values from errors
    setfetchdone(true);
  };

  return (
    <div className={channelmembersCSS.body}>
      <div className={channelmembersCSS.box}>
        <div className={channelmembersCSS.head}>
          <h1 className={channelmembersCSS.h1}>Members of Channel</h1>
          <ImCross
            size={16}
            onClick={() => {
              setShowmembers(false);
            }}
            style={{ cursor: "pointer" }}
          />
        </div>
        <div className={channelmembersCSS.inputbox}>
          <input
            type="text"
            className={channelmembersCSS.input}
            placeholder="Search for a member"
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleInput}
          />
        </div>
        <div className={channelmembersCSS.memberslist}>
          {fetchdone && members.length > 0 ? (
            members.map((member) => (
              <div key={member[0]?.id} className={channelmembersCSS.member}>
                {member ? (
                  <>
                    <img
                      src={member[0]?.avatar_url}
                      alt={member[0]?.username}
                      className={channelmembersCSS.memimg}
                    />
                    <div className={channelmembersCSS.meminfo}>
                      <span className={channelmembersCSS.infospan1}>
                        {member[0]?.username}
                      </span>
                      <span className={channelmembersCSS.infospan2}>
                        {member[0]?.email}
                      </span>
                    </div>
                    <BsThreeDotsVertical />
                  </>
                ) : (
                  <p>Error fetching details</p>
                )}
              </div>
            ))
          ) : (
            <p>Searching....</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Showmembers;
