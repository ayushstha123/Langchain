const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const model=new ChatGoogleGenerativeAI({
    apiKey:process.env.GOOGLE_API,
})