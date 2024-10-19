const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const dotenv =require ("dotenv");
dotenv.config();
const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API,
    temperature: 0.5,
    maxOutputTokens: 1200,
    verbose: true,
});

async function main() {
    try {
        const res = await model.invoke("write a quote by charles Butwoski", {temperature: 0.5}); // Use `.call()` instead of `.stream()`

        console.log(res.text);
    } catch (error) {
        console.error("Error occurred:", error);
    }
}

main();

  
  
