const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { sendToGroqAPI } = require("./groqApi");

puppeteer.use(StealthPlugin());

async function scrapeAWS(provider, url, estimateTokens) {
  console.log(`\nStarting AWS scrape for ${provider}...`);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const selectors = {
    AWS_AI21: "#aws-element-8e1c58c4-f2ec-4314-beb0-7f6431fbce93-panel-1",
    AWS_Nova:
      "#aws-element-07bb2914-791a-419c-ad4a-7ee6120b377e > div > main > div > table",
    AWS_Anthropic:
      "#aws-element-8e1c58c4-f2ec-4314-beb0-7f6431fbce93-panel-3 > div > div > div > div > div:nth-child(4) > table",
    AWS_Cohere:
      "#aws-element-8e1c58c4-f2ec-4314-beb0-7f6431fbce93-panel-4 > div > div > div > div > div:nth-child(3) > table",
    AWS_Llama33:
      "#aws-element-ff34e968-4b7a-447b-96cf-bbb6c68f44bf > div > main > div > table",
    AWS_Llama32:
      "#aws-element-23008e66-aab0-4ddf-9eae-62412a5fadf8 > div > main > div > table",
    AWS_Llama31:
      "#aws-element-4be3a45b-086f-41df-aa0e-39dad9642ebf > div > main > div > table",
    AWS_Mistral: "#aws-element-8e1c58c4-f2ec-4314-beb0-7f6431fbce93-panel-6",
  };

  try {
    await page.goto(url, { waitUntil: "networkidle0" });

    const selector = selectors[provider];
    if (!selector) {
      throw new Error(`No selector defined for provider: ${provider}`);
    }

    // Handle potential modal close
    const modalCloseButtonSelector = "[id^='floating-ui-'] > div > button";
    const modalCloseButton = await page.$(modalCloseButtonSelector);
    if (modalCloseButton) {
      console.log("Modal detected, attempting to close it...");
      await modalCloseButton.click();
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("Modal closed.");
    }

    await page.waitForSelector(selector);

    let extractedData;
    if (selector.endsWith("table")) {
      // Extract table HTML if token count is low
      extractedData = await page.evaluate((selector) => {
        const tableElement = document.querySelector(selector);
        return tableElement ? tableElement.outerHTML.trim() : "";
      }, selector);

      console.log(`Extracted table HTML for ${provider}`);
    } else {
      // Extract text content because table HTML token count is too high
      extractedData = await page.evaluate((selector) => {
        const parentElement = document.querySelector(selector);
        if (!parentElement) return "";

        const childElements = Array.from(parentElement.querySelectorAll("*"));
        const meaningfulTexts = childElements
          .filter((el) => el.innerText && el.innerText.trim())
          .map((el) => el.innerText.trim());

        return meaningfulTexts.join("\n");
      }, selector);

      console.log(`Extracted text for ${provider}`);
    }

    if (!extractedData) {
      console.log(`No relevant content found for ${provider}.`);
      return null;
    }

    // Estimate tokens in the extracted text
    const tokenCount = estimateTokens(extractedData);
    console.log(`Estimated tokens for ${provider}: ${tokenCount}`);
    console.log(`\nRAW_INPUT\n${extractedData}\n\n`);

    // Send extracted data to Groq API
    const groqResponse = await sendToGroqAPI(provider, extractedData);
    console.log(`Groq API response for ${provider}:\n${groqResponse}`);

    return groqResponse;
  } catch (err) {
    console.error(`Error scraping ${provider}:`, err);
    return null;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeAWS };
