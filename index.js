const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000; // Your Express server port

// Route to fetch timetable from FastAPI
app.get("/get-timetable", async (req, res) => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/"); // FastAPI endpoint
    res.json(response.data); // Send response back to client
  } catch (error) {
    console.error("Error fetching data from FastAPI:", error.message);
    res.status(500).json({ error: "Failed to fetch data from FastAPI" });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Express server running on http://127.0.0.1:${PORT}`);
});
