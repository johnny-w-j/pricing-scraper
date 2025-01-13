const fs = require("fs");

// Helper function to estimate token count
function estimateTokens(text) {
  return text.split(/\s+|(?=\W)|(?<=\W)/g).filter(Boolean).length;
}

// Helper function to process and append content to the result file
function processAndAppendContent(provider, result, resultFilePath) {
  if (result) {
    const updatedContent = result
      .split("\n")
      .filter(Boolean) // Remove empty lines
      .map((line) => `${line}; ${provider}`) // Add provider name
      .join("\n");

    fs.appendFileSync(resultFilePath, `${updatedContent}\n\n`);
    console.log(`Appended content for ${provider} to ${resultFilePath}`);
  } else {
    console.log(`No content found for ${provider}`);
  }
}

// Helper function to delay execution
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { estimateTokens, processAndAppendContent, delay };
