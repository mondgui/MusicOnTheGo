// backend/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to MusicOnTheGo Backend API!");
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
