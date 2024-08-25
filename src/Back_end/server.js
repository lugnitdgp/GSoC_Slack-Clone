// app.js
const express = require("express");
const cors = require("cors");
const apiRouter = require("./Routes/apiroutes");
require("dotenv").config();

const app = express();
const Port = process.env.Port;
console.log(Port);

// Middleware to parse JSON bodies and enable CORS
app.use(express.json());
app.use(cors());

// Use routes defined in apiRouter
app.use("/api", apiRouter);

// Start the Express server
app.listen(Port, () => {
  console.log(`Server is running at http://localhost:${Port}`);
});
