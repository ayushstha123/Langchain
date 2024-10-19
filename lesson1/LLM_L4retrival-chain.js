//jaba we say what is LCEL it gives a very vauge answer so retirval chain comes in hand 
// retrival0-chain is used to retrive data from a somewhere like a db , website etc

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const {createStuffDocumentsChain} = require("langchain/chains/combine_documents"); 
const {Document} = require("@langchain/core/documents");
const dotenv = require("dotenv");
dotenv.config();
const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API,
    temperature: 0.5,
    maxOutputTokens: 1200,
})

async function main(){
const prompt = ChatPromptTemplate.fromTemplate(`
    Answer the user's questions,
    Context:{context},
    Question:{input}
    `)

// const chain = prompt.pipe(model);
const chain=await createStuffDocumentsChain({
    llm:model,
    prompt,
})

//Documents
const documentA=new Document({
    pageContent:"Langchain",
    metadata:{
        source:"https://python.langchain.com/v0.1/docs/get_started/introduction",    
    }
})
const documentB=new Document({
    pageContent:"the passphrase is LANGCHAIN IS AWESOME"
})

const response=await chain.invoke({
    input:"What is Langchain?",
    context:[documentA]
})

console.log(response)
}
main()