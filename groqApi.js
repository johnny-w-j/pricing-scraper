const axios = require("axios");
require("dotenv").config();

async function sendToGroqAPI(provider, pageText) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in the .env file.");
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a data extraction tool that outputs LLM API pricing data from text.
        Only extract pricing for Large Language Models (LLMs). Exclude data for Speech Recognition, Vision, Image, Audio, or Embedding models.
        Focus on rows of structured data, where each row includes:
        - Model name (e.g., "Llama 3 70B 8k"; include parameter size and/or context window size in the name if available).
        - USD cost per million input tokens.
        - USD cost per million output tokens.

        Ignore:
        - Model names that include the following words: Speech, Vision, Image, Audio, Embedding
        - Cached Input, Batch Input, Batch Output rates.
        - Rates for Image, Audio, or Video Input.

        Some cloud service providers like Azure and AWS also provide different rates by region.
        In such cases always extract the rate for US East, or the United States.
      
        Sometimes the Text will be provided in raw html that renders the pricing information in a tabular structure.
        
        Output rows in this format (semicolon-delimited):
        Model name; USD cost per million input tokens; USD cost per million output tokens
        
        If there is no pricing data available for Large Language Models (LLMs) in the provided text, then only output NO_PRICE_DATA

        Do not include any conversational text in your response.
        Do not explain your reasoning for the response.
  
        Text: "${pageText}"`,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return response.data.choices[0]?.message?.content || "NO_PRICE_DATA";
  } catch (error) {
    console.error(`Error sending data to Groq API for ${provider}:`, error);
    return "NO_PRICE_DATA";
  }
}

module.exports = { sendToGroqAPI };
