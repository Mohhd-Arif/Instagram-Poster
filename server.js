import express from "express";
import cors from "cors";
import { generateAndPostToInstagram } from "./instagramPoster.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/post-instagram-quote", async (req, res) => {
  try {
    console.log("Received request to post Instagram quote...");
    
    const result = await generateAndPostToInstagram();
    
    res.json({
      success: true,
      message: "Successfully posted to Instagram!",
      data: result
    });
  } catch (err) {
    console.error("Error posting to Instagram:", err);
    res.status(500).json({
      success: false,
      message: "Error posting to Instagram",
      error: err.message
    });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
