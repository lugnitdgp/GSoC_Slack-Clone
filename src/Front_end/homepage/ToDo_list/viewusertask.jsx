import React, { useContext, useState, useEffect } from "react";
import { ImCross } from "react-icons/im";
import supabase from "../../supabase";
import viewusertaskCSS from "./viewusertask.module.css";
import { Allconvers } from "../../context api/context";
import { fetchusertodo } from "../../database";

const Viewutask = () => {
  const { currentUser, setViewtask } = useContext(Allconvers);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsAdmin(true);
    }
    const fetchTasks = async () => {
      const fetchedTasks = await fetchusertodo(currentUser[0].id);
      setTasks(fetchedTasks);
    };
    fetchTasks();
    // Refresh tasks every minute to update time remaining
    const interval = setInterval(fetchTasks, 60000); // Update every minute
    return () => clearInterval(interval); // Clean up interval on component unmount
  }, [currentUser]);
  useEffect(() => {
    const fetchTasks = async () => {
      const fetchedTasks = await fetchusertodo(currentUser[0].id);
      setTasks(fetchedTasks);
      setRefresh(false);
    };
    fetchTasks();
  }, [refresh]);
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
    const { error: dele } = await supabase
      .from("Mails_sent")
      .delete()
      .eq("task_id", task_id);
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
      .from("Todo_list")
      .update({ todo_list: updatedTasks })
      .eq("id", currentUser[0].id);
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

  useEffect(() => {
    const usertodoupdate = () => {
      const usrdupd = supabase
        .channel("user-todo-update")
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
            console.log("refreshed");
            setRefresh(true);
          }
        )
        .subscribe();

      // Cleanup function to unsubscribe from the channel to avoid data leakage
      return () => {
        supabase.removeChannel(usrdupd);
      };
    };
    usertodoupdate();
  }, [currentUser[0]]);

  return (
    <>
      <div className={viewusertaskCSS.body}>
        <div className={viewusertaskCSS.box}>
          <div className={viewusertaskCSS.head}>
            <h1 className={viewusertaskCSS.heading}>My Tasks</h1>
            <ImCross
              size={16}
              onClick={() => {
                setViewtask(false);
              }}
              className={viewusertaskCSS.closeIcon}
            />
          </div>
          <div className={viewusertaskCSS.tasks}>
            <div className={viewusertaskCSS.todo}>
              <h2 className={viewusertaskCSS.sectionHeading}>To Do</h2>
              <ul className={viewusertaskCSS.taskList}>
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
                        className={viewusertaskCSS.taskItem}
                      >
                        <div className={viewusertaskCSS.taskContainer}>
                          <div className={viewusertaskCSS.taskInfo}>
                            <h3>{task.taskname}</h3>
                            <p>{task.task_description}</p>
                            <p
                              className={`${viewusertaskCSS.taskMeta} ${
                                isPastDue
                                  ? viewusertaskCSS.taskMetaPastDue
                                  : viewusertaskCSS.taskMetaNotPastDue
                              } ${
                                !task.duedate && viewusertaskCSS.taskMetaNone
                              }`}
                            >
                              Due Date: {dueDateDisplay}
                            </p>
                            <p className={viewusertaskCSS.taskMeta}>
                              Assigned By:{" "}
                              {task.assigned_byid === currentUser[0].id
                                ? `${task.assigned_by} (You)`
                                : `${task.assigned_by}`}
                            </p>
                            <p className={viewusertaskCSS.taskMeta}>
                              Assigned on:{" "}
                              {new Date(task.assignedon).toLocaleDateString()}
                            </p>
                          </div>
                          <div className={viewusertaskCSS.taskActions}>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => markAsDone(task.task_id)}
                                  className={viewusertaskCSS.button}
                                >
                                  Done
                                </button>
                                <button
                                  onClick={() => removeTask(task.task_id)}
                                  className={viewusertaskCSS.removebutton}
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
            <div className={viewusertaskCSS.done}>
              <h2 className={viewusertaskCSS.sectionHeading}>Done</h2>
              <ul className={viewusertaskCSS.taskList}>
                {sortedTasks
                  .filter((task) => task.taskdone)
                  .map((task) => (
                    <li key={task.task_id} className={viewusertaskCSS.taskItem}>
                      <div className={viewusertaskCSS.taskContainer}>
                        <div className={viewusertaskCSS.taskInfo}>
                          <h3>{task.taskname}</h3>
                          <p>{task.task_description}</p>
                          <p className={viewusertaskCSS.taskMeta}>
                            Due Date:{" "}
                            {task.duedate
                              ? new Date(task.duedate).toLocaleDateString()
                              : "None"}
                          </p>
                          <p className={viewusertaskCSS.taskMeta}>
                            Assigned By:{" "}
                            {task.assigned_byid === currentUser[0].id
                              ? `${task.assigned_by} (You)`
                              : `${task.assigned_by}`}
                          </p>
                          <p className={viewusertaskCSS.taskMeta}>
                            Assigned on:{" "}
                            {new Date(task.assignedon).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={viewusertaskCSS.taskActions}>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => undoTask(task.task_id)}
                                className={viewusertaskCSS.button}
                              >
                                Undone
                              </button>
                              <button
                                onClick={() => removeTask(task.task_id)}
                                className={viewusertaskCSS.removebutton}
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
};

export default Viewutask;
