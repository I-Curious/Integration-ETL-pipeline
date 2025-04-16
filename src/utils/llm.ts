import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function applyLLMTransformation(fieldName: string, value: any): Promise<string> {
  const prompt = `Extract and format the following "${fieldName}" appropriately from the input: "${value}". 
Only return the transformed value.`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful transformer of messy user data into clean structured values." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });

  return response.choices[0].message.content?.trim() ?? "";
}
