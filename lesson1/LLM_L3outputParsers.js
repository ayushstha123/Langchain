const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser, CommaSeparatedListOutputParser, StructuredOutputParser } = require("@langchain/core/output_parsers")
const { z } = require("zod")
const dotenv = require("dotenv");
dotenv.config();

//Step 1. we instantiate our model
const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API,
    temperature: 0.5,
    maxOutputTokens: 1200,
});


async function main() {
    async function callStringOutputParser() { //    step 2. // Create a prompt template
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", "Generate a dad joke thats very funny based on the word provided by the user."],
            ["human", "{input}"],]
        );
        //create parser
        const parser = new StringOutputParser();
        //create chain
        const chain = prompt.pipe(model).pipe(parser);

        //call chain 
        return await chain.invoke({
            input: "back end developers",
        });
    }

    async function callListOutputParser() {
        const prompt = ChatPromptTemplate.fromTemplate(`
                Provide 5 synomyms ,seperated by commas, for the following words`);
        const outputParser = new CommaSeparatedListOutputParser();
        const chain = prompt.pipe(model).pipe(outputParser);
        return await chain.invoke({
            word: "happiness"
        })
    }
    //structured output parser
    async function callStructureParser() {
        const prompt = ChatPromptTemplate.fromTemplate(`
                Extract information from the following phrase.
                Formatting Instructions:{format_instructions}
                Phrase:{phrase}`);
        const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
            name: "The name of the person",
            age: "The age of the person"
        });
        const chain = prompt.pipe(model).pipe(outputParser)
        return await chain.invoke({
            phrase: "Max is 30 years old",
            format_instructions: outputParser.getFormatInstructions(),
        })
    }

    async function callZodOutputParser() {
        const prompt = ChatPromptTemplate.fromTemplate(`
                Extract information from the following phrase.
                Formatting Instructions:{format_instructions}
                Phrase:{phrase}`);
        const outputParser =StructuredOutputParser.fromZodSchema(
            z.object({
            name: z.string(),
            age: z.number(),
            postion:z.string(),
            recipie:z.string().describe("name of recipie"),
            ingredients:z.array(z.string().describe("ingredients")),
        }));
        const chain = prompt.pipe(model).pipe(outputParser)
        return await chain.invoke({
            phrase: "Max is 30 years old and is a backend developer. Max has a recipe of his grandma of making the premium chuwela ( a  nepali dish) which has 10 ingredients. they are meat, garlic, onion, ginger etc",
            format_instructions: outputParser.getFormatInstructions(),
        })
    }

    //const response=await callStringOutputParser();
    // const response=await callListOutputParser();
    // const response = await callStructureParser();
    const response = await callZodOutputParser();

    console.log(response);

}

main();
