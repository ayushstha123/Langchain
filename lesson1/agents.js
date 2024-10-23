const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { AgentExecutor, createOpenAIFunctionsAgent  } = require("langchain/agents");
const {TavilySearchResults}= require("@langchain/community/tools/tavily_search");
const dotenv = require("dotenv");
dotenv.config();

// Instantiate our model 
const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API,
    temperature: 0.7,
});

async function main() {
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant called MAX👦"],
        ["human", "{input}"],
        new MessagesPlaceholder("agent_scratchpad"),
    ]);

    //instantiate tavily search tool
    const searchTools=new TavilySearchResults(
        {
            apiKey: process.env.TAVILY_API,}
    );
    // Create and assign tools
    const tools = [
        searchTools
    ];
    
    
    // Create agent
    const agent = await createOpenAIFunctionsAgent ({
        llm: model,
        prompt,
        tools,
    });

    // Run agent
    const agentExecutor = new AgentExecutor({
        agent,
        tools,
    });

    // Call agent 
    const response = await agentExecutor.invoke({
        input: "Hello, what is the price of NIMB in NEPSE in 2022/october?"   
    });

    console.log(response);
}

main().catch(console.error);