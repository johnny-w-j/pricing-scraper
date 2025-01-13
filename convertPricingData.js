const fs = require("fs");

// Function to parse the data into an array of objects
function parsePricingData(data) {
  const lines = data.split("\n").filter((line) => line.trim() !== ""); // Split and remove empty lines
  const pricingData = [];

  lines.forEach((line) => {
    const parts = line.split(";").map((part) => part.trim()); // Split by ';' and trim spaces
    if (parts.length === 4) {
      const [model, inputCost, outputCost, provider] = parts;

      pricingData.push({
        model,
        inputCost: parseFloat(inputCost.replace("$", "")) || 0,
        outputCost: parseFloat(outputCost.replace("$", "")) || 0,
        provider,
      });
    }
  });

  return pricingData;
}

// Read input data from a file
const inputFilePath = "pricingData.txt"; // Update with your file path
fs.readFile(inputFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  // Parse the data
  const parsedData = parsePricingData(data);

  // Output the result as a JSON file
  const outputFilePath = "pricingData.json";
  fs.writeFile(outputFilePath, JSON.stringify(parsedData, null, 2), (err) => {
    if (err) {
      console.error("Error writing JSON file:", err);
    } else {
      console.log(`Pricing data saved to ${outputFilePath}`);
    }
  });
});
