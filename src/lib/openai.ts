import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openAIModel = process.env.OPENAI_MODEL || "gpt-5-nano";
