import { useContext, useEffect, useState } from "react";
import { Allconvers } from "../context api/context";
import {
  fetchusertodo,
  mailtimestampupd,
  fetchmailsentmsg,
  fetchmailbool,
} from "../database";
import supabase from "../supabase";

const TodoListChanges = () => {
  const { currentUser } = useContext(Allconvers);
  const [todoList, setTodoList] = useState([]);
  const [refresh, setRefresh] = useState(false);

 
    useEffect(() => {
      const fetching = async () => {
        const fetched = await fetchusertodo(currentUser[0]?.id);
        setTodoList(fetched);
        console.log("Todo list refreshed");
        setRefresh(false);
      };
      fetching();
    }, [currentUser[0], refresh]);

    useEffect(() => {
      const checking = async () => {
        await checkAndSendUserEmail(todoList);
        console.log(todoList);
      };
      checking();
    }, [todoList]);

    const checkAndSendUserEmail = async (tasks) => {
      try {
        const now = new Date();

        for (const task of tasks) {
          if (task?.duedate) {
            const dueDate = new Date(task.duedate);
            const timeDifference = dueDate.getTime() - now.getTime(); // Difference in milliseconds
            const minutesDifference = Math.floor(timeDifference / (1000 * 60)); // Convert to minutes

            const thresholds = [
              { threshold: 24 * 60, message: "1 day" },
              { threshold: 12 * 60, message: "12 hours" },
              { threshold: 60, message: "1 hour" },
              { threshold: 30, message: "30 minutes" },
            ];

            thresholds.sort((a, b) => a.threshold - b.threshold);

            // Fetch already sent messages for this task
            const thresholds_sent = await fetchmailsentmsg(task.task_id);
            const mailbool = await fetchmailbool(task.task_id);
            console.log(mailbool);
            // Flag to check if an email has been sent
            let emailSent = false;

            for (const { threshold, message } of thresholds) {
              if (minutesDifference <= threshold && minutesDifference > 0) {
                // Send email only if this threshold hasn't been sent for this task
                if (
                  !thresholds_sent?.includes(message) &&
                  !emailSent &&
                  !mailbool
                ) {
                  const response = await fetch(
                    `${
                      import.meta.env.VITE_Backend_URL
                    }/api/sendUserEmail`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        to: currentUser[0].email,
                        subject: `Task Due Soon (${message} left)`,
                        message: `Task "${task.taskname}" is due soon. Due Date: ${task.duedate}`,
                      }),
                    }
                  );

                  if (response.ok) {
                    // Record the sent threshold for this task in the database
                    await mailtimestampupd(task.task_id, message);
                    console.log(`Email sent successfully for ${message}`);
                    emailSent = true; // Set flag to true after sending email so that only 1 mail be sent
                  } else {
                    throw new Error(`Failed to send email for ${message}`);
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking and sending emails:", error);
      }
    };

    useEffect(() => {
      const userlistupd = () => {
        const userlistupds = supabase
          .channel("user_task_list")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "Todo_list",
              select: "todo_list",
              filter: `id=eq.${currentUser[0]?.id}`,
            },
            (payload) => {
              setRefresh(true);
              console.log("Received todo list changes");
            }
          )
          .subscribe();

        // Cleanup function to unsubscribe from the channel to avoid data leakage
        return () => {
          supabase.removeChannel(userlistupds);
        };
      };

      userlistupd();
    }, [currentUser[0]?.id]);
  return <></>
};

export default TodoListChanges;
