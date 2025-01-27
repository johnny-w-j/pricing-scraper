const moment = require("moment");
const { scrapeGeneral } = require("./generalScraper");
const { scrapeOpenAI } = require("./openaiScraper");
const { scrapeAWS } = require("./awsScraper");
const { estimateTokens, processAndAppendContent, delay } = require("./helper");

// Reusable function to process a map of providers
async function processProviders(map, scrapeFunction, resultFilePath) {
  for (const [provider, url] of map) {
    console.log(`Processing ${provider}...`);
    const result = await scrapeFunction(provider, url, estimateTokens);
    processAndAppendContent(provider, result, resultFilePath);
    console.log(
      `Waiting for 60 seconds before processing the next provider...`
    );
    await delay(60000); // Delay for 60 seconds
  }
}

async function main() {
  console.log("Starting the scraping process...");

  // Create a timestamped result file
  const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
  const resultFilePath = `result_${timestamp}.txt`;

  // Maps for API providers and their pricing URLs
  const generalMap = new Map([
    ["DeepSeek", "https://api-docs.deepseek.com/quick_start/pricing"],
    ["Groq", "https://groq.com/pricing"],
    ["Anthropic", "https://www.anthropic.com/pricing#anthropic-api"],
    ["AI21Labs", "https://www.ai21.com/pricing"],
    ["Mistral", "https://mistral.ai/technology/#pricing"],
    ["Cohere", "https://cohere.com/pricing"],
    [
      "Azure",
      "https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/#pricing",
    ],
    [
      "GoogleCloud_Gemini",
      "https://cloud.google.com/skus?hl=en&filter=gemini&currency=USD",
    ],
    [
      "GoogleCloud_Llama",
      "https://cloud.google.com/skus?hl=en&filter=llama&currency=USD",
    ],
  ]);
  const openAIMap = new Map([
    ["OpenAI_4o", "https://openai.com/api/pricing"],
    ["OpenAI_4omini", "https://openai.com/api/pricing"],
    ["OpenAI_o1", "https://openai.com/api/pricing"],
    ["OpenAI_o1mini", "https://openai.com/api/pricing"],
    ["OpenAI_other", "https://openai.com/api/pricing"],
  ]);
  const awsMap = new Map([
    ["AWS_AI21", "https://aws.amazon.com/bedrock/pricing"],
    ["AWS_Nova", "https://aws.amazon.com/bedrock/pricing"],
    ["AWS_Anthropic", "https://aws.amazon.com/bedrock/pricing"],
    ["AWS_Cohere", "https://aws.amazon.com/bedrock/pricing"],
    ["AWS_Llama33", "https://aws.amazon.com/bedrock/pricing"],
    ["AWS_Llama32", "https://aws.amazon.com/bedrock/pricing"],
    ["AWS_Llama31", "https://aws.amazon.com/bedrock/pricing"],
    ["AWS_Mistral", "https://aws.amazon.com/bedrock/pricing"],
  ]);

  try {
    // Process each map with the corresponding scraper function
    await processProviders(openAIMap, scrapeOpenAI, resultFilePath);
    await processProviders(awsMap, scrapeAWS, resultFilePath);
    await processProviders(generalMap, scrapeGeneral, resultFilePath);

    console.log("Scraping process completed for all providers.");
  } catch (err) {
    console.error("An error occurred during the scraping process:", err);
  }
}

main();
