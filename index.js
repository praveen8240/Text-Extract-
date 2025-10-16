import express from "express";
import multer from "multer";
import fs from "fs";
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const upload = multer({ dest: "uploads/" }); // temp upload folder
const textract = new TextractClient({ region: process.env.AWS_REGION || "us-east-1" });

// Utility to guess Aadhaar details from text
function extractDetailsFromText(text) {
  const details = {};


  // Date of Birth
  const dobMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
  if (dobMatch) details.dob = dobMatch[1];

  // Gender
  const genderMatch = text.match(/\b(Male|Female)\b/i);
  if (genderMatch) details.gender = genderMatch[1];

  // Aadhaar number (12-digit)
  const aadhaarMatch = text.match(/\b\d{4}\s\d{4}\s\d{4}\b/);
  if (aadhaarMatch) details.aadhaarNumber = aadhaarMatch[0];


  let name = null;
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    if (/DOB|Date|Birth|MALE|FEMALE/i.test(lines[i])) {
      // Look backwards for English-only name
      for (let j = i - 1; j >= 0; j--) {
        if (/^[A-Za-z\s]+$/.test(lines[j]) && lines[j].length > 3) {
          name = lines[j].trim();
          break;
        }
      }
      if (name) break;
    }
  }
  if (name) details.name = name;


  return details;
}

app.post("/extract", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileBytes = fs.readFileSync(req.file.path);

    const command = new DetectDocumentTextCommand({
      Document: { Bytes: fileBytes },
    });

    const response = await textract.send(command);
    const text = response.Blocks
      .filter((b) => b.BlockType === "LINE")
      .map((b) => b.Text)
      .join("\n");

    const extracted = extractDetailsFromText(text);

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      extracted,
    //   rawText: text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to extract text" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
