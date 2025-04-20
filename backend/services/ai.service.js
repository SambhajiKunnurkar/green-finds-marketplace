import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
    },
    systemInstruction: `
    
    `
 });


export const generateResult = async (prompt) => {






const result = await model.generateContent(prompt);
// console.log(result.response.text());
return result.response.text();

}




