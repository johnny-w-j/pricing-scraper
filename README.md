# LLM Pricing Scraper

Scrapes LLM API pricing data from provider webpages using Puppeteer, and processes it with Groq's Llama 3.3 70B endpoint to extract pricing information in a structured format. This app is designed to stay under the free-tier rate limits.

## Data Format

The extracted data is organized as follows:
  
Model Name | Input Cost ($ USD / M tokens) | Output Cost ($ USD / M tokens) | API Provider  
  
## Why This Project?

To explore the challenges and potential of using large language models (LLMs) to automate web scraping and data extraction.  
Learn more in this [Medium article](https://medium.com/@johnny.w.jang_33335/how-easy-is-it-to-scrape-text-with-llms-013e6c1415bb?source=friends_link&sk=f8bf9f7ad5a00ed6f66f6de92fbd98c4).

## View Extracted Data

Check out the processed data in this [Next.js Vercel app](https://llm-api-pricing.vercel.app/).

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Install npm dependences
4. Run the scraper using: node mainScraper.js
