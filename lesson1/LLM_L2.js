const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");

const dotenv = require("dotenv");
dotenv.config();

const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API,
    temperature: 0.5,
    maxOutputTokens: 1200,
    verbose: true,
});

async function main() {
    try {
        // Create a prompt template
        const prompt = ChatPromptTemplate.fromMessages([
            ["system","Generate a dad joke thats very funny based on the word provided by the user."],
            ["human","{input}"],]
        );
        //create chain
        const chain=prompt.pipe(model)
        //call chain 
        const res=await chain.invoke({
            input:"back end developers",
        });
        console.log(res?.content) // use .text instead of .content

    } catch (error) {
        console.error("Error occurred:", error);
    }
}

main();
