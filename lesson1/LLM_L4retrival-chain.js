const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");
const { Document } = require("langchain/document");
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
    modelName: "gemini-pro",
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

    const scrapedContent = await scrapeWebpage("https://commons.wikimedia.org/wiki/Main_Page");
    // Create a Document object
    const doc = new Document({ pageContent: scrapedContent });

    const response = await chain.invoke({
        input: "Summarize the page",
        context: [doc]  // Pass an array with the document
    });
    console.log(doc.pageContent.length);
    console.log(response);
}

main().catch(console.error);