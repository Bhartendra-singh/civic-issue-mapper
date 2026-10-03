import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
// const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });


const callGeminiWithRetry = async (prompt, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            const isOverloaded = error.message?.includes('503') || error.message?.includes('overloaded');

            if (isOverloaded && i < retries) {
                console.log(`Gemini overloaded, retrying... (attempt ${i + 1})`);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                continue;
            }
            throw error;
        }
    }
};


export const parseQueryToFilter = async (userQuery) => {
    const prompt = `
You are an assistant for a civic-issue-reporting app.
The Report collection has these fields:
- category: one of "pothole", "garbage", "waterlogging", "streetlight", "drain", "other"
- status: one of "pending", "in-progress", "resolved", "reopened"

User query: "${userQuery}"

Respond with ONLY a JSON object (no extra text, no markdown) containing 
the relevant filter fields from: category, status.
If no specific category or status is mentioned, omit that field.

Example output: {"category": "pothole", "status": "pending"}
`;

    const text = await callGeminiWithRetry(prompt);
    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(cleaned);
};


export const generateAnswer = async (userQuery, data) => {
    const prompt = `
You are an assistant for a civic-issue-reporting app admin dashboard.

User asked: "${userQuery}"

Here is the relevant data from the database:
${JSON.stringify(data, null, 2)}

Write a short, clear, natural-language answer (2-3 sentences max) 
based on this data. Be direct and helpful.
`;

    return await callGeminiWithRetry(prompt);
};