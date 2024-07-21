import { Allconvers } from "../../context api/context";
import googlecalendarCSS from "./googlecalendar.module.css";
import { useState, useEffect, useContext } from "react";
import { ImCross } from "react-icons/im";

const Googlecalendar = () => {
  const [events, setEvents] = useState([]);
  const { opencalendarevents, setopencalendarevents } = useContext(Allconvers);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("today"); // State to track selected time period
  const [refresh, setrefresh] = useState(false);

  useEffect(() => {
    fetchEvents(selectedTimePeriod);
    console.log(refresh);
    // Fetch events for the initial selected time period when component mounts
  }, [selectedTimePeriod]);
  useEffect(() => {
    if (refresh) {
      fetchEvents(selectedTimePeriod);
      console.log(refresh);
      setrefresh(false);
    } // Fetch events for the initial selected time period when component mounts
  }, [refresh]);

  // Function to fetch events from Google Calendar based on time period
  const fetchEvents = async (timePeriod) => {
    try {
      let timeMin, timeMax;

      switch (timePeriod) {
        case "today":
          // Get current date in IST
          const currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 IST

          // Construct timeMin for the start of current day in IST
          timeMin = currentDate.toISOString();

          // Construct timeMax for the end of current day in IST (23:59:59)
          const todayMax = new Date(currentDate);
          todayMax.setDate(todayMax.getDate() + 1); // Move to tomorrow
          todayMax.setHours(0, 0, 0, 0); // Set time to 00:00:00 of tomorrow (IST)
          timeMax = todayMax.toISOString();
          break;

        case "tomorrow":
          // Get tomorrow's date in IST
          const tomorrowDate = new Date();
          tomorrowDate.setDate(tomorrowDate.getDate() + 1);
          tomorrowDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 IST tomorrow

          // Construct timeMin for the start of tomorrow in IST
          timeMin = tomorrowDate.toISOString();

          // Construct timeMax for the end of tomorrow in IST (23:59:59)
          const tomorrowMax = new Date(tomorrowDate);
          tomorrowMax.setDate(tomorrowMax.getDate() + 1); // Move to the day after tomorrow
          tomorrowMax.setHours(0, 0, 0, 0); // Set time to 23:59:59 of the day after tomorrow (IST)
          timeMax = tomorrowMax.toISOString();
          break;

        case "thisweek":
          // Get the start and end of the current week in IST (Sunday to Saturday)
          const today = new Date();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay()); // Adjust for day of the week
          startOfWeek.setHours(0, 0, 0, 0); // Set time to 00:00:00 IST on start of week

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(endOfWeek.getDate() + 7); // Add 6 days to get next Saturday
          endOfWeek.setHours(0, 0, 0, 0); // Set time to 23:59:59 of next Saturday (IST)

          // Construct timeMin for the start of this week in IST
          timeMin = startOfWeek.toISOString();

          // Construct timeMax for the end of this week in IST (excluding events after 23:59:59 of next Saturday)
          timeMax = endOfWeek.toISOString();
          break;

        default:
          // Default to today's events if no valid timePeriod provided
          console.warn(
            "Invalid time period provided. Defaulting to today's events."
          );
          const defaultDate = new Date();
          defaultDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 IST
          // ... (rest of the logic for today's events)
          break;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_Backend_URL
        }/api/events?timeMin=${encodeURIComponent(
          timeMin
        )}&timeMax=${encodeURIComponent(timeMax)}`
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        setSelectedTimePeriod(timePeriod); // Update selected time period state
      } else {
        console.error("Failed to fetch events:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Function to handle adding a new event
  const handleAddEvent = async (eventData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_Backend_URL}/api/createEvent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        }
      );

      if (response.ok) {
        // After adding the event successfully, update the refresh state to trigger a re-fetch
        setrefresh(true);
        console.log("Refresh state after event addition:", refresh); // This should log 'true' after event addition
      } else {
        console.log("Failed to add event:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  // Function to handle deleting an event
  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_Backend_URL
        }/api/eventsdelete/${eventId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        console.log("Event deleted successfully!");
        const updatedEvents = events.filter((event) => event.id !== eventId); // Assuming event.id is used for comparison
        setEvents(updatedEvents);
      } else {
        console.error("Failed to delete event:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // Render function for displaying events
  const renderEvents = () => {
    return (
      <div>
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className={googlecalendarCSS.eventfetched}>
              <p className={googlecalendarCSS.phead}>{event.summary}</p>
              <p className={googlecalendarCSS.date}>
                <p className={googlecalendarCSS.datehead}>Start:</p>
                {new Date(event.start.dateTime).toLocaleString()}
              </p>
              <p className={googlecalendarCSS.date}>
                <p className={googlecalendarCSS.datehead}>End:</p>{" "}
                {new Date(event.end.dateTime).toLocaleString()}
              </p>
              {event.description && (
                <p className={googlecalendarCSS.description}>
                  {event.description}
                </p>
              )}
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className={googlecalendarCSS.deleteevent}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No events found.</p>
        )}
      </div>
    );
  };

  return (
    <div className={googlecalendarCSS.container}>
      <div className={googlecalendarCSS.box}>
        <div className={googlecalendarCSS.header}>
          <ImCross
            className={googlecalendarCSS.closeIcon}
            onClick={() => setopencalendarevents(false)}
          />
        </div>
        <div className={googlecalendarCSS.left}>
          <h2 className={googlecalendarCSS.heading}>Add Event</h2>
          {/* Form for adding event */}
          <form
            className={googlecalendarCSS.form}
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const summary = formData.get("summary");
              const description = formData.get("description");
              const startDateTime = new Date(
                formData.get("startDateTime")
              ).toISOString();
              const endDateTime = new Date(
                formData.get("endDateTime")
              ).toISOString();

              handleAddEvent({
                summary,
                description,
                startDateTime,
                endDateTime,
              });

              e.target.reset(); // Reset form fields after submission
            }}
          >
            <input
              type="text"
              name="summary"
              placeholder="Event Name"
              required
              className={googlecalendarCSS.input}
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              className={googlecalendarCSS.input}
            />
            <input
              type="datetime-local"
              name="startDateTime"
              required
              className={googlecalendarCSS.input}
            />
            <input
              type="datetime-local"
              name="endDateTime"
              required
              className={googlecalendarCSS.input}
            />
            <button type="submit" className={googlecalendarCSS.button}>
              Add Event
            </button>
          </form>
        </div>
        <div className={googlecalendarCSS.right}>
          <h2 className={googlecalendarCSS.heading}>Fetched Events</h2>
          {/* Event filtering buttons */}
          <div className={googlecalendarCSS.filterButtons}>
            <button
              className={
                selectedTimePeriod === "today"
                  ? googlecalendarCSS.activeButton
                  : googlecalendarCSS.button
              }
              onClick={() => fetchEvents("today")}
            >
              Today's Events
            </button>
            <button
              className={
                selectedTimePeriod === "tomorrow"
                  ? googlecalendarCSS.activeButton
                  : googlecalendarCSS.button
              }
              onClick={() => fetchEvents("tomorrow")}
            >
              Tomorrow's Events
            </button>
            <button
              className={
                selectedTimePeriod === "thisweek"
                  ? googlecalendarCSS.activeButton
                  : googlecalendarCSS.button
              }
              onClick={() => fetchEvents("thisweek")}
            >
              This Week's Events
            </button>
          </div>
          {/* Display fetched events */}
          <div className={googlecalendarCSS.eventsContainer}>
            {events.length > 0 ? (
              renderEvents()
            ) : (
              <p className={googlecalendarCSS.noEvents}>No events found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Googlecalendar;
