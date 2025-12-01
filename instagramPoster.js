import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import dotenv from "dotenv";
import { createCanvas } from "canvas";
import fs from "fs";
dotenv.config();

// ---------------- Cloudinary Setup --------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ---------------- Instagram API Credentials --------------------
const IG_ID = process.env.IG_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Generate random quote using Groq API
async function getRandomQuote() {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  
  const headers = {
    "Authorization": `Bearer ${GROQ_API_KEY}`,
    "Content-Type": "application/json"
  };
  
  const data = {
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: "Give me a short unique motivational quote (max 15 words). Return only the quote without any quotation marks."
      }
    ]
  };
  
  try {
    const response = await axios.post(url, data, { headers });
    const quote = response.data.choices[0].message.content.trim().replace(/['"]/g, '');
    console.log("Generated Quote:", quote);
    return quote;
  } catch (error) {
    console.error("Error generating quote:", error.response?.data || error.message);
    throw error;
  }
}

// Generate random color
function randomColor() {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256)
  };
}

// Create gradient and add text to canvas
function generateQuoteImage(quote, outputPath = "./quote.jpg") {
  const width = 1080;
  const height = 1080;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Generate random gradient colors
  const startColor = randomColor();
  const endColor = randomColor();
  
  // Create vertical gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `rgb(${startColor.r}, ${startColor.g}, ${startColor.b})`);
  gradient.addColorStop(1, `rgb(${endColor.r}, ${endColor.g}, ${endColor.b})`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Set up text properties
  ctx.font = 'normal 60px arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Word wrap function
  function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  }
  
  const maxWidth = width - 100;
  const lines = wrapText(quote, maxWidth);
  const lineHeight = 70;
  const totalHeight = lines.length * lineHeight;
  const startY = (height - totalHeight) / 2 + lineHeight / 2;
  
  // Draw text shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2 + 3, startY + index * lineHeight + 3);
  });
  
  ctx.fillStyle = 'white';
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });
  
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Image saved as ${outputPath}`);
  
  return outputPath;
}

async function uploadToCloudinary(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "instagram_posts",
      resource_type: "image",
      type: "upload",
      access_mode: "public",
      transformation: [
        {
          quality: "auto:good",
          fetch_format: "jpg"
        }
      ]
    });
    
    console.log("Cloudinary upload successful!");
    console.log("Image URL:", result.secure_url);
    
    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
}

async function createMediaObject(imageUrl, caption) {
  const url = `https://graph.facebook.com/v24.0/${IG_ID}/media`;

  const params = {
    image_url: imageUrl,
    caption: caption,
    access_token: ACCESS_TOKEN
  };

  try {
    console.log("Creating Instagram media object...");
    
    const res = await axios.post(url, params, {
      validateStatus: (status) => status < 400,
      timeout: 30000
    });

    console.log("Media creation response:", res.data);
    return res.data.id;

  } catch (err) {
    console.error("✗ Error creating image object:", err.response?.data || err.message);
    throw err;
  }
}

async function publishMedia(creationId) {
  const url = `https://graph.facebook.com/v24.0/${IG_ID}/media_publish`;

  try {
    const publishUrl = `${url}?creation_id=${creationId}&access_token=${ACCESS_TOKEN}`;
    
    const response = await axios.post(publishUrl, {}, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Publish response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Error publishing media:", err.response?.data || err.message);
    throw err;
  }
}

export async function generateAndPostToInstagram() {
  try {
    console.log("===Generating random quote ===");
    const quote = await getRandomQuote();
    
    console.log("===Creating quote image ===");
    const imagePath = generateQuoteImage(quote);
    
    console.log("===Uploading image to Cloudinary ===");
    const imageUrl = await uploadToCloudinary(imagePath);
    
    console.log("===Creating Instagram media object ===");
    const creationId = await createMediaObject(imageUrl, quote);
    console.log("Creation ID:", creationId);
    
    console.log("===Publishing to Instagram ===");
    const response = await publishMedia(creationId);
    
    console.log("Successfully posted to Instagram!");
    
    return {
      success: true,
      postId: response.id,
      quote: quote,
      imageUrl: imageUrl
    };
    
  } catch (err) {
    console.error(" Error:", err.message);
    throw err;
  }
}

const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule) {
  generateAndPostToInstagram()
    .then(result => {
      console.log("\nResult:", result);
      process.exit(0);
    })
    .catch(err => {
      console.error("\nFailed:", err);
      process.exit(1);
    });
}
