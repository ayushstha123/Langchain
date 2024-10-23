const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { AgentExecutor, createOpenAIFunctionsAgent  } = require("langchain/agents");
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

    // Create and assign tools
    const tools = [
        // Add your tools here, for example:
        // new Calculator(),
        // new WebBrowser(),
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
        input: "Hello, can you introduce yourself?"   
    });

    console.log(response);
}

main().catch(console.error);