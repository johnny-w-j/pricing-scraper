const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { sendToGroqAPI } = require("./groqApi");

puppeteer.use(StealthPlugin());

async function scrapeOpenAI(provider, url, estimateTokens) {
  console.log(`\nStarting OpenAI scrape for ${provider}...`);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const selectors = {
    OpenAI_4o: "#\\33 NVJSNqBOl7IxF8wHwFl8x",
    OpenAI_4omini: "#MKm0TAT0sEESKMml2k65u",
    OpenAI_o1: "#\\32 2wmoBV0tcLNLWL3xTd6IC",
    OpenAI_o1mini: "#\\31 qowDyyKff0UlJXeTDw3fn",
    OpenAI_other: "#\\35 xnebq2BIlTUisMXUllDlm",
  };

  try {
    await page.goto(url, { waitUntil: "networkidle0" });
    const selector = selectors[provider];

    await page.waitForSelector(selector);

    const filteredText = await page.evaluate((selector) => {
      const parentDiv = document.querySelector(selector);
      if (!parentDiv) return "";

      const childTexts = Array.from(parentDiv.querySelectorAll("div"))
        .filter((div) => div.innerText.trim())
        .map((div) => div.innerText.trim());

      return childTexts.join("\n");
    }, selector);

    console.log(`Filtered text for ${provider}:\n${filteredText}`);

    // Estimate tokens in the extracted text
    const tokenCount = estimateTokens(filteredText);
    console.log(`Estimated tokens for ${provider}: ${tokenCount}`);
    console.log(`\nRAW_INPUT\n${filteredText}\n\n`);

    // Send extracted data to Groq API
    const groqResponse = await sendToGroqAPI(provider, filteredText);
    console.log(`Groq API response for ${provider}:\n${groqResponse}`);

    return groqResponse;
  } catch (err) {
    console.error(`Error scraping ${provider}:`, err);
    return null;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeOpenAI };
