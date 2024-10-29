const express = require("express");
const cors = require("cors");
const router = express.Router();
const { sendUserEmail } = require("../utils/sendUsermail");
const session = require("express-session");
const { google } = require("googleapis");
const calendar = google.calendar("v3");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
router.use(express.json());
const client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const checkTokensMiddleware = async (req, res, next) => {
  //even though this function is not called still using the express sessions if the request exits in the session
  const tokens = req.session.tokens; //then the fetching data when expiry occurs still happens
  if (!tokens || !tokens.access_token || !tokens.refresh_token) {
    return res.status(401).json({ error: "OAuth2 tokens not set" });
  }

  if (tokens.expiry_date <= Date.now()) {
    try {
      const newAccessToken = await refreshTokens(tokens);
      tokens.access_token = newAccessToken;
      req.session.tokens = tokens;
      client.setCredentials(tokens);
      next(); //used to continue to the next into the rputes like the middleware continues tghe function
    } catch (error) {
      console.error("Error refreshing tokens:", error);
      res.status(401).json({ error: "Failed to refresh OAuth2 tokens" });
    }
  } else {
    client.setCredentials(tokens);
    next();
  }
};

async function refreshTokens(tokens) {
  const refreshToken = tokens.refresh_token;
  const { credentials } = await client.refreshToken(refreshToken);
  const newAccessToken = credentials.access_token;
  const newExpiryDate = credentials.expiry_date;
  tokens.access_token = newAccessToken;
  tokens.expiry_date = newExpiryDate;
  return newAccessToken;
}

router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
  })
);

router.use(cors());

// Route to update user's online status
async function updateUserStatus(userId, status) {
  const { error } = await supabase
    .from("user_data")
    .update({ online_status: status })
    .eq("id", userId);

  if (error) {
    console.error("Error updating online status:", error);
    throw error;
  }
}

// Route to handle session expiration and set online status to false
router.use(async (req, res, next) => {
  const sessionUser = req.session.userId;
  if (!sessionUser) {
    await updateUserStatus(sessionUser, false);
  }
  next();
});

router.post("/sendUserEmail", async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    await sendUserEmail(to, subject, message);

    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email");
  }
});

router.get("/googleauth", (req, res) => {
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
  });
  res.status(200).json({ url: authUrl });
});

router.get("/googleauth/redirect", async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    req.session.tokens = tokens;

    // Retrieve user info and update status
    const oauth2 = google.oauth2({ auth: client, version: "v2" });
    const userInfo = await oauth2.userinfo.get();
    const userId = userInfo.data.id;

    await updateUserStatus(userId, true); // Mark user as online
    res.redirect(process.env.Front_endURL);
  } catch (error) {
    console.error("Error handling OAuth2 redirect:", error);
    res.status(500).send("Error handling OAuth2 redirect");
  }
});

router.get("/events", async (req, res) => {
  try {
    const { timeMin, timeMax } = req.query;
    const response = await calendar.events.list({
      auth: client,
      calendarId: "primary",
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || undefined,
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items;
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.post("/createEvent", async (req, res) => {
  try {
    const { summary, description, startDateTime, endDateTime } = req.body;

    const event = {
      summary: summary,
      description: description,
      start: {
        dateTime: startDateTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "Asia/Kolkata",
      },
    };

    const response = await calendar.events.insert({
      auth: client,
      calendarId: "primary",
      requestBody: event,
    });

    const createdEvent = response.data;
    res.status(200).json({ message: "Event added successfully" });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});
router.delete("/eventsdelete/:eventId", async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const deletedEvent = await calendar.events.delete({
      auth: client,
      calendarId: "primary",
      eventId,
    });

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
