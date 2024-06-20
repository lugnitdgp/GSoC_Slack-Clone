import React, { useContext, useState, useEffect } from "react";
import { ImCross } from "react-icons/im";
import supabase from "../../supabase";
import viewchanneltaskCSS from "./viewchanneltask.module.css";
import { Channelcontext } from "../../context api/channelcontext";
import { Allconvers } from "../../context api/context";
import { fetchchanneltodo } from "../../database";

const Viewchanneltask = () => {
  const { channel_data } = useContext(Channelcontext);
  const { currentUser, setViewchanneltask } = useContext(Allconvers);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tasks, setTasks] = useState([]);

  if (channel_data?.channel_id) {
    useEffect(() => {
      // Check if current user is admin
      const isAdminUser = channel_data.channeladmins.some(
        (admin) => admin.id === currentUser[0].id
      );
      setIsAdmin(isAdminUser);
      // Fetch tasks for the channel
      const fetchTasks = async () => {
        const fetchedTasks = await fetchchanneltodo(channel_data.channel_id);
        setTasks(fetchedTasks);
      };
      fetchTasks();
      // Refresh tasks every minute to update time remaining
      const interval = setInterval(fetchTasks, 60000); // Update every minute
      return () => clearInterval(interval); // Clean up interval on component unmount
    }, [channel_data, currentUser]);

    // Function to calculate time remaining until due date
    const calculateTimeRemaining = (dueDate) => {
      if (!dueDate)
        return {
          days: null,
          hours: null,
          minutes: null,
          seconds: null,
          distance: null,
        };
      const now = new Date().getTime();
      const dueTime = new Date(dueDate).getTime();
      const distance = dueTime - now;
      // Calculate days, hours, minutes, and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      return { days, hours, minutes, seconds, distance };
    };
    const markAsDone = async (task_id) => {
      const updatedTasks = tasks.map(
        (
          task //to set the tasks done
        ) => (task.task_id === task_id ? { ...task, taskdone: true } : task)
      );
      setTasks(updatedTasks);
      await updateTasks(updatedTasks);
    };
    const removeTask = async (task_id) => {
      //to remove the tasks from the db
      const updatedTasks = tasks.filter((task) => task.task_id !== task_id);
      setTasks(updatedTasks);
      await updateTasks(updatedTasks);
    };
    const undoTask = async (task_id) => {
      //to bring back tasks back into To Do
      const updatedTasks = tasks.map((task) =>
        task.task_id === task_id ? { ...task, taskdone: false } : task
      );
      setTasks(updatedTasks);
      await updateTasks(updatedTasks);
    };
    const updateTasks = async (updatedTasks) => {
      await supabase
        .from("Channel_todolist")
        .update({ todo_list: updatedTasks })
        .eq("id", channel_data.channel_id);
    };
    // Sort tasks by due date (nearest due date first), with "None" due date at the bottom
    const sortedTasks = tasks.slice().sort((a, b) => {
      //slice is used so that a new copy be created which decreses the risk of db data changing
      if (!a.duedate && !b.duedate) return 0; // Both have no due date
      if (!a.duedate) return 1; // a has no due date, place it after b
      if (!b.duedate) return -1; // b has no due date, place it after a

      const dueDateA = new Date(a.duedate).getTime();
      const dueDateB = new Date(b.duedate).getTime();
      return dueDateA - dueDateB; // Ascending order (nearest due date first)
    });

    return (
      <>
        <div className={viewchanneltaskCSS.body}>
          <div className={viewchanneltaskCSS.box}>
            <div className={viewchanneltaskCSS.head}>
              <h1 className={viewchanneltaskCSS.heading}>Channel Tasks</h1>
              <ImCross
                size={16}
                onClick={() => {
                  setViewchanneltask(false);
                }}
                className={viewchanneltaskCSS.closeIcon}
              />
            </div>
            <div className={viewchanneltaskCSS.tasks}>
              <div className={viewchanneltaskCSS.todo}>
                <h2 className={viewchanneltaskCSS.sectionHeading}>To Do</h2>
                <ul className={viewchanneltaskCSS.taskList}>
                  {sortedTasks //calls the sorting function for the filtered tasks
                    .filter((task) => !task.taskdone)
                    .map((task) => {
                      const { days, hours, minutes, seconds, distance } =
                        calculateTimeRemaining(task.duedate); //time left is calculated to change the due date color accordingly
                      const isPastDue = distance < 0;
                      const dueDateDisplay = task.duedate
                        ? new Date(task.duedate).toLocaleDateString() //to show date according to local date string
                        : "None";

                      return (
                        //now returning the filtered and then sorted tasks
                        <li
                          key={task.task_id}
                          className={viewchanneltaskCSS.taskItem}
                        >
                          <div className={viewchanneltaskCSS.taskContainer}>
                            <div className={viewchanneltaskCSS.taskInfo}>
                              <h3>{task.taskname}</h3>
                              <p>{task.task_description}</p>
                              <p
                                className={`${viewchanneltaskCSS.taskMeta} ${
                                  isPastDue
                                    ? viewchanneltaskCSS.taskMetaPastDue
                                    : viewchanneltaskCSS.taskMetaNotPastDue
                                } ${
                                  !task.duedate &&
                                  viewchanneltaskCSS.taskMetaNone
                                }`}
                              >
                                Due Date: {dueDateDisplay}
                              </p>
                              <p className={viewchanneltaskCSS.taskMeta}>
                                Assigned By: {task.assigned_by}
                              </p>
                              <p className={viewchanneltaskCSS.taskMeta}>
                                Assigned on:{" "}
                                {new Date(task.assignedon).toLocaleDateString()}
                              </p>
                            </div>
                            <div className={viewchanneltaskCSS.taskActions}>
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => markAsDone(task.task_id)}
                                    className={viewchanneltaskCSS.button}
                                  >
                                    Done
                                  </button>
                                  <button
                                    onClick={() => removeTask(task.task_id)}
                                    className={viewchanneltaskCSS.removebutton}
                                  >
                                    Remove
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
              <div className={viewchanneltaskCSS.done}>
                <h2 className={viewchanneltaskCSS.sectionHeading}>Done</h2>
                <ul className={viewchanneltaskCSS.taskList}>
                  {sortedTasks
                    .filter((task) => task.taskdone)
                    .map((task) => (
                      <li
                        key={task.task_id}
                        className={viewchanneltaskCSS.taskItem}
                      >
                        <div className={viewchanneltaskCSS.taskContainer}>
                          <div className={viewchanneltaskCSS.taskInfo}>
                            <h3>{task.taskname}</h3>
                            <p>{task.task_description}</p>
                            <p className={viewchanneltaskCSS.taskMeta}>
                              Due Date:{" "}
                              {task.duedate
                                ? new Date(task.duedate).toLocaleDateString()
                                : "None"}
                            </p>
                            <p className={viewchanneltaskCSS.taskMeta}>
                              Assigned By: {task.assigned_by}
                            </p>
                            <p className={viewchanneltaskCSS.taskMeta}>
                              Assigned on:{" "}
                              {new Date(task.assignedon).toLocaleDateString()}
                            </p>
                          </div>
                          <div className={viewchanneltaskCSS.taskActions}>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => undoTask(task.task_id)}
                                  className={viewchanneltaskCSS.button}
                                >
                                  Undone
                                </button>
                                <button
                                  onClick={() => removeTask(task.task_id)}
                                  className={viewchanneltaskCSS.removebutton}
                                >
                                  Remove
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return <></>;
  }
};

export default Viewchanneltask;
