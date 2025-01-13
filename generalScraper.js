const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { sendToGroqAPI } = require("./groqApi");

puppeteer.use(StealthPlugin());

async function scrapeGeneral(provider, url, estimateTokens) {
  console.log(`\nStarting general scrape for ${provider}...`);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle0" });

    // Extract the main text content of the page
    const pageText = await page.evaluate(() => document.body.innerText);
    if (!pageText) {
      console.log(`No text content found for ${provider}.`);
      return null;
    }

    // Estimate tokens in the extracted text
    const tokenCount = estimateTokens(pageText);
    console.log(`Estimated tokens for ${provider}: ${tokenCount}`);
    console.log(`\nRAW_INPUT\n${pageText}\n\n`);

    // Send extracted text to Groq API for processing
    const groqResponse = await sendToGroqAPI(provider, pageText);
    console.log(`Groq API response for ${provider}:\n${groqResponse}`);

    return groqResponse;
  } catch (err) {
    console.error(`Error scraping ${provider}:`, err);
    return null;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeGeneral };
