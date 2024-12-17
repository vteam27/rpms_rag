import dotenv from "dotenv";

dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};

Object.freeze(config);

export default config;
