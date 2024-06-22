import supabase from "../../supabase";
import assigntaskselfCSS from "./mytodolist.module.css";
import { Allconvers } from "../../context api/context";
import { useContext, useState, useEffect } from "react";
import { ImCross } from "react-icons/im";
import { fetchusertodo,insert_taskid } from "../../database.jsx"; // Import your utility functions
import { v4 as uuid } from "uuid";

const Assigntaskself = () => {
  const { setassigntaskself, currentUser } = useContext(Allconvers);
  const [taskName, setTaskName] = useState("");
  const [dueDateTime, setDueDateTime] = useState("");
  const [noDueDate, setNoDueDate] = useState(false); // State to track if "No Due Date" option is selected
  const [taskDescription, setTaskDescription] = useState("");
  const [user_todo, setUserTodo] = useState([]);
  const [refreshuserlist, setrefreshuserlist] = useState(false);
  // Notification states
  const [showNotification, setShowNotification] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  useEffect(() => {
    const fetchUserTodoList = async () => {
      const receivedUserTodo = await fetchusertodo(currentUser[0].id);
      setUserTodo(receivedUserTodo);
      setrefreshuserlist(false);
    };
    fetchUserTodoList();
  }, [currentUser[0].id, refreshuserlist]);

  useEffect(() => {
    console.log(refreshuserlist), [refreshuserlist];
  });
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
            filter: `id=eq.${currentUser[0].id}`,
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
  }, [currentUser[0].id]);

  const handleSubmit = async () => {
    try {
      // Check if required fields are filled
      if (!taskName || (!noDueDate && !dueDateTime) || !taskDescription) {
        setShowNotification(true);
        // Hide notification after 2.5 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 2500);
        return;
      }

      const assignedOn = new Date().toISOString(); // Current timestamp
      const task_id = uuid(); // Generate a random UUID

      let todoListData = {};

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
        .eq("id", currentUser[0].id);
        await insert_taskid(task_id)

      // Clear input fields and reset states after successful submission
      setTaskName("");
      setDueDateTime("");
      setNoDueDate(false);
      setTaskDescription("");
      setShowSuccessNotification(true);
      // Hide success notification after 3 seconds
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 3000);
    } catch (error) {
      console.error("Error assigning task:", error.message);
    }
  };

  return (
    <div className={assigntaskselfCSS.body}>
      <div className={assigntaskselfCSS.box}>
        <ImCross
          size={16}
          onClick={() => {
            setassigntaskself(false);
          }}
          className={assigntaskselfCSS.closeIcon}
        />
        <div className={assigntaskselfCSS.head}>
          <h1>Add my Tasks</h1>
        </div>
        <div className={assigntaskselfCSS.taskName}>
          <label>Task Name:</label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required // Ensure task name is compulsory
          />
          <span className={assigntaskselfCSS.requiredLabel}>* Required</span>
        </div>
        <div className={assigntaskselfCSS.dueDateTime}>
          <label>Due Date and Time:</label>
          <div className={assigntaskselfCSS.dueDateTimeOptions}>
            <input
              type="datetime-local"
              value={dueDateTime}
              onChange={(e) => {
                setDueDateTime(e.target.value);
                setNoDueDate(false); // Ensure "No Due Date" is unchecked when a due date is selected
              }}
            />
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
                style={{ cursor: "pointer", marginLeft: "10px" }}
              />
              No Due Date
            </label>
          </div>
          <span className={assigntaskselfCSS.requiredLabel}>* Required</span>
        </div>
        <div className={assigntaskselfCSS.taskDescription}>
          <label>Task Description:</label>
          <textarea
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
          <span className={assigntaskselfCSS.requiredLabel}>* Required</span>
        </div>
        <div className={assigntaskselfCSS.submitButton}>
          <button onClick={handleSubmit}>Assign</button>
        </div>
        {showNotification && (
          <div className={assigntaskselfCSS.notification}>
            "Please fill all required details."
          </div>
        )}
        {showSuccessNotification && (
          <div className={assigntaskselfCSS.notification}>
            Task added successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default Assigntaskself;
