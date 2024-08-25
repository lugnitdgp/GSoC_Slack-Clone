import supabase from "../../supabase";
import assigntaskCSS from "./assigntask.module.css";
import { Allconvers } from "../../context api/context";
import { Channelcontext } from "../../context api/channelcontext";
import { useContext, useState, useEffect } from "react";
import { ImCross } from "react-icons/im";
import {
  fetchchannelmember,
  Getuserdetails,
  fetchchanneltodo,
  fetchusertodo,
  insert_taskid,
} from "../../database.jsx"; // Import your utility functions
import { v4 as uuid } from "uuid";

const Assigntask = () => {
  const { setAssigntask, currentUser, setloader } = useContext(Allconvers);
  const { channel_data } = useContext(Channelcontext);
  const [assignToMember, setAssignToMember] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState(null); // State to store selected member ID
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembermail, setSelectedMembermail] = useState(null);
  const [taskName, setTaskName] = useState("");
  const [dueDateTime, setDueDateTime] = useState("");
  const [noDueDate, setNoDueDate] = useState(false); // State to track if "No Due Date" option is selected
  const [taskDescription, setTaskDescription] = useState("");
  const [fetchdone, setFetchDone] = useState(false);
  const [members, setMembers] = useState([]);
  const [user_todo, setUserTodo] = useState([]);
  const [channel_todo, setChannelTodo] = useState([]);
  const [refreshuserlist, setrefreshuserlist] = useState(false);
  const [refreshchannellist, setrefreshchannellist] = useState(false);

  // Notification states
  const [showNotification, setShowNotification] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  if (channel_data?.channel_id) {
    useEffect(() => {
      const fetchUserTodoList = async () => {
        const receivedUserTodo = await fetchusertodo(selectedMemberId);
        setUserTodo(receivedUserTodo);
        setrefreshuserlist(false);
      };
      fetchUserTodoList();
    }, [selectedMemberId, refreshuserlist]);

    useEffect(() => {
      const fetchChannelTodoList = async () => {
        const receivedChannelTodo = await fetchchanneltodo(
          channel_data.channel_id
        );
        setChannelTodo(receivedChannelTodo);
        setrefreshchannellist(false);
      };
      fetchChannelTodoList();
    }, [channel_data, refreshchannellist]);
    useEffect(() => {
      console.log(refreshchannellist);
    }, [refreshchannellist]);
    useEffect(() => {
      console.log(refreshuserlist);
    }, [refreshuserlist]);
    useEffect(() => {
      const chanlistupd = () => {
        const channellistupd = supabase
          .channel("channel_list")
          .on(
            "postgres_changes",
            {
              event: "*", //channels are used to listen to real time changes
              schema: "public", //here we listen to the changes in realtime and update the postgres changes here
              table: "Channel_todolist",
              select: "todo_list",
              filter: `id=eq.${channel_data.channel_id}`,
            },
            (payload) => {
              setrefreshchannellist(true);
            }
          )
          .subscribe();

        // Cleanup function to unsubscribe from the channel to avoid data leakage
        return () => {
          supabase.removeChannel(channellistupd);
        };
      };

      chanlistupd();
    }, [channel_data.channel_id]);
    useEffect(() => {
      const userlistupd = () => {
        const userlistupds = supabase
          .channel("user_list")
          .on(
            "postgres_changes",
            {
              event: "*", //channels are used to listen to real time changes
              schema: "public", //here we listen to the changes in realtime and update the postgres changes here
              table: "Todo_list",
              select: "todo_list",
              filter: `id=eq.${selectedMemberId}`,
            },
            (payload) => {
              setrefreshuserlist(true);
            }
          )
          .subscribe();

        // Cleanup function to unsubscribe from the channel to avoid data leakage
        return () => {
          supabase.removeChannel(userlistupds);
        };
      };
      userlistupd();
    }, [selectedMemberId]);

    // Function to handle search query change
    const handleSearchChange = async (e) => {
      setSearchQuery(e.target.value);
      setFetchDone(false);
      const currentmembers = await fetchchannelmember(channel_data.channel_id);
      const currentmems = currentmembers[0].channel_members;
      const matchedMembers = currentmems.filter((currentmem) =>
        currentmem.member_name
          .toLowerCase()
          .includes(e.target.value.toLowerCase())
      );
      const detailedMembers = await Promise.all(
        matchedMembers.map(async (member) => {
          try {
            const memberDetails = await Getuserdetails(member.member_id);
            return memberDetails;
          } catch (error) {
            console.error(error);
            return null;
          }
        })
      );
      setMembers(detailedMembers.filter(Boolean));
      setFetchDone(true);
    };
    const handleSubmit = async () => {
      setloader(true)
      try {
        setloader(true);
        // Check if required fields are filled
        if (
          !taskName ||
          (assignToMember && !selectedMemberId) ||
          (!noDueDate && !dueDateTime) ||
          !taskDescription
        ) {
          setShowNotification(true);
          setloader(false)
          // Hide notification after 2.5 seconds
          setTimeout(() => {
            setShowNotification(false);
          }, 2500);
          return;
        }

        const assignedOn = new Date().toISOString(); // Current timestamp
        const task_id = uuid(); // Generate a random UUID

        let todoListData = {};
        setloader(true)
        if (!assignToMember) {
          setloader(true);
          todoListData = [
            ...channel_todo,
            {
              task_id,
              taskname: taskName,
              duedate: noDueDate ? null : dueDateTime || null,
              assignedon: assignedOn,
              task_description: taskDescription,
              taskdone: false,
              assigned_by: currentUser[0].username,
              assigned_byid: currentUser[0].id,
            },
          ];
          
          await supabase
            .from("Channel_todolist")
            .update({ todo_list: todoListData })
            .eq("id", channel_data.channel_id);
          await insert_taskid(task_id);
        } else {
          setloader(true);
          todoListData = [
            ...user_todo,
            {
              task_id,
              taskname: taskName,
              duedate: noDueDate ? null : dueDateTime || null,
              assignedon: assignedOn,
              task_description: taskDescription,
              taskdone: false,
              assigned_by: currentUser[0].username,
              assigned_byid: currentUser[0].id,
            },
          ];
          
          await supabase
            .from("Todo_list")
            .update({ todo_list: todoListData })
            .eq("id", selectedMemberId);
          await insert_taskid(task_id);
          try {
            const response = await fetch(
              `${import.meta.env.VITE_Backend_URL}/api/sendUserEmail`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  to: selectedMembermail,
                  subject: `New Task Assigned`,
                  message: `Task "${taskName}" was assigned to you by "${
                    currentUser[0].username
                  }". Due Date: ${noDueDate ? null : dueDateTime || null}`,
                }),
              }
            );
            if (!response.ok) {
              throw new Error("Failed to send email");
            }
            console.log("Email sent successfully");
          } catch (error) {
            console.error("Error sending email:", error);
          }
        }

        // Clear input fields and reset states after successful submission
        setTaskName("");
        setDueDateTime("");
        setNoDueDate(false);
        setTaskDescription("");
        setSelectedMemberId(null);
        setShowSuccessNotification(true);

        // Hide success notification after 3 seconds
        setTimeout(() => {
          setShowSuccessNotification(false);
        }, 3000);

        // Reset search query and member list
        setSearchQuery("");
        setMembers([]);
        setFetchDone(false);
        setloader(false)
      } catch (error) {
        console.error("Error assigning task:", error.message);
        setloader(false)
      }
    };

    return (
      <div className={assigntaskCSS.body}>
        <div className={assigntaskCSS.box}>
          <ImCross
            size={16}
            onClick={() => {
              setAssigntask(false);
            }}
            className={assigntaskCSS.closeIcon}
          />
          <div className={assigntaskCSS.head}>
            <h1>Assign a Task</h1>
          </div>
          <div className={assigntaskCSS.assignTo}>
            <div className={assigntaskCSS.checkboxes}>
              <label>
                <input
                  type="checkbox"
                  checked={assignToMember}
                  onChange={() => {
                    setAssignToMember(true);
                    setSelectedMemberId(null); // Reset selected member when switching to Everyone
                  }}
                  style={{ cursor: "pointer" }}
                />
                Assign to Member
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={!assignToMember}
                  onChange={() => {
                    setAssignToMember(false);
                    setNoDueDate(false); // Reset "No Due Date" option when switching to Everyone
                    setDueDateTime(""); // Reset due date when switching to Everyone
                  }}
                  style={{ cursor: "pointer" }}
                />
                Assign to Everyone
              </label>
            </div>

            {assignToMember && (
              <div className={assigntaskCSS.searchBox}>
                <input
                  type="text"
                  placeholder="Search for a member..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <div className={assigntaskCSS.searchResults}>
                  {fetchdone && members.length > 0 ? (
                    members.map((member) => (
                      <div
                        key={member[0]?.id}
                        className={assigntaskCSS.member}
                        onClick={() => {
                          setSelectedMemberId(member[0]?.id);
                          setSelectedMembermail(member[0]?.email);
                        }}
                      >
                        {member ? (
                          <>
                            <img
                              src={member[0]?.avatar_url}
                              alt={member[0]?.username}
                              className={assigntaskCSS.memimg}
                            />
                            <div className={assigntaskCSS.meminfo}>
                              <span className={assigntaskCSS.infospan1}>
                                {member[0]?.username}
                              </span>
                              <span className={assigntaskCSS.infospan2}>
                                {member[0]?.email}
                              </span>
                              {selectedMemberId === member[0]?.id && (
                                <span
                                  className={assigntaskCSS.selectionIndicator}
                                >
                                  Selected
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                    ))
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className={assigntaskCSS.taskName}>
            <label>Task Name:</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required // Ensure task name is compulsory
            />
            <span className={assigntaskCSS.requiredLabel}>* Required</span>
          </div>
          <div className={assigntaskCSS.dueDateTime}>
            <label>Due Date and Time:</label>
            <div className={assigntaskCSS.dueDateTimeOptions}>
              <input
                type="datetime-local"
                value={dueDateTime}
                onChange={(e) => {
                  setDueDateTime(e.target.value);
                  setNoDueDate(false); // Ensure "No Due Date" is unchecked when a due date is selected
                }}
              />
              <div className={assigntaskCSS.datelabel}>
                <label>
                  <input
                    type="checkbox"
                    checked={noDueDate}
                    onChange={(e) => {
                      setNoDueDate(e.target.checked);
                      if (e.target.checked) {
                        setDueDateTime(""); // Reset due date when "No Due Date" is checked
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  />
                  No Due
                </label>
              </div>
            </div>
            <span className={assigntaskCSS.requiredLabel}>* Required</span>
          </div>
          <div className={assigntaskCSS.taskDescription}>
            <label>Task Description:</label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
            <span className={assigntaskCSS.requiredLabel}>* Required</span>
          </div>
          <div className={assigntaskCSS.submitButton}>
            <button onClick={handleSubmit}>Assign</button>
          </div>
          {showNotification && (
            <div className={assigntaskCSS.notification}>
              {assignToMember
                ? "Please select a member to assign the task and fill required details."
                : "Please fill all required details."}
            </div>
          )}

          {showSuccessNotification && (
            <div className={assigntaskCSS.notification}>
              Task assigned successfully!
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

export default Assigntask;
