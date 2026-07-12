import fs from 'fs';
import path from 'path';

const datasetFile = "C:/Users/YG/Desktop/surfrobot/scratch/surfllm_dataset.json";

try {
  console.log("Starting dataset validation...");
  
  if (!fs.existsSync(datasetFile)) {
    throw new Error(`Dataset file not found at: ${datasetFile}`);
  }

  const raw = fs.readFileSync(datasetFile, 'utf-8');
  const dataset = JSON.parse(raw);

  if (!Array.isArray(dataset)) {
    throw new Error("Dataset is not a JSON array.");
  }

  if (dataset.length !== 5000) {
    throw new Error(`Expected exactly 5,000 samples, but found ${dataset.length}.`);
  }

  // Sample structure checking
  dataset.forEach((sample, idx) => {
    if (!sample.id) throw new Error(`Missing ID at index ${idx}`);
    if (!sample.category) throw new Error(`Missing category at index ${idx}`);
    if (!sample.messages || !Array.isArray(sample.messages)) {
      throw new Error(`Missing or invalid messages array at index ${idx}`);
    }

    if (sample.messages.length < 2) {
      throw new Error(`Messages array has less than 2 items at index ${idx}`);
    }

    const userMsg = sample.messages[0];
    const assistantMsg = sample.messages[1];

    if (userMsg.role !== 'user' || !userMsg.content) {
      throw new Error(`Invalid user message structure at index ${idx}`);
    }

    if (assistantMsg.role !== 'assistant' || !assistantMsg.content) {
      throw new Error(`Invalid assistant message structure at index ${idx}`);
    }

    // Verify reasoning tags presence
    if (!assistantMsg.content.includes('<think>') || !assistantMsg.content.includes('</think>')) {
      throw new Error(`Assistant response is missing R1 reasoning tags <think>...</think> at index ${idx}`);
    }
  });

  console.log("✓ Success: Dataset validation complete!");
  console.log(`- Path: ${datasetFile}`);
  console.log(`- File Size: ${(fs.statSync(datasetFile).size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`- Total Valid Samples: ${dataset.length}`);
  console.log(`- Reasoning Traces verified: Yes (100% compliant)`);
} catch (err) {
  console.error("✗ Validation Failed:", err.message);
  process.exit(1);
}
