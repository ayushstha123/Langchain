// Text splitter 
// we use text splitter due to limitation placed by llm so that  only specific information can get to llm 

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");
const { RecursiveCharacterTextSplitter}=require("langchain/text_splitter")
const { Document } = require("langchain/document");
const {GoogleGenerativeAIEmbeddings}=require("@langchain/google-genai")
const {MemoryVectorStore} = require("langchain/vectorstores/memory")
const {createRetrievalChain}=require("langchain/chains/retrieval")

const https = require('https');
const cheerio = require('cheerio');
const dotenv = require("dotenv");

async function scrapeWebpage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let htmlData = '';

            res.on('data', (chunk) => {
                htmlData += chunk;
            });

            res.on('end', () => {
                const $ = cheerio.load(htmlData);
                const content = [];
                $('p, h1, h2, h3, h4, h5, h6').each((index, element) => {
                    content.push($(element).text());
                });
                resolve(content.join(' '));
            });

        }).on('error', (err) => {
            reject('Error fetching the webpage: ' + err);
        });
    });
}

dotenv.config();
const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API,
    temperature: 0.5,
    maxOutputTokens: 1200,
});

async function main() {
    const prompt = ChatPromptTemplate.fromTemplate(`
    Answer the user's question based on the following context:
    Context: {context}
    
    Question: {input}
    
    Answer:
    `);

    const chain = await createStuffDocumentsChain({
        llm: model,
        prompt,
    });

    const scrapedContent = await scrapeWebpage("https://v03.api.js.langchain.com/types/langchain.chains_retrieval.CreateRetrievalChainParams.html");
    // Create a Document object
    const doc = new Document({ pageContent: scrapedContent });

    const splitter=new RecursiveCharacterTextSplitter({
        chunkSize:200,
        chunkOverlap:20,
    });

    const splitDocs=await splitter.splitDocuments([doc]);

    // console.log(splitDocs);

    const embeddings=new GoogleGenerativeAIEmbeddings({
        apiKey:process.env.GOOGLE_API
    });
    
    // create vector store
    const vectorStore=await MemoryVectorStore.fromDocuments(
        splitDocs,
        embeddings
    );

    const retrievers=vectorStore.asRetriever({
        k:4,
    }); // to pass query and retirver will return list of documents as an array

    const retirevalChain=await createRetrievalChain({
        combineDocsChain:chain,
        retriever:retrievers,
    })
    const response = await retirevalChain.invoke({
        input: "BaseRetriever ?",
        // context: [doc]  // Pass an array with the document (no need because retirval chain will deal with it)
    });
    console.log(doc.pageContent.length);
    console.log(response);
}

main().catch(console.error);