import fs from 'fs';
import path from 'path';

const categories = ["graphify", "mempalace", "xgboost", "autogluon", "gluonts", "elegantrl"];

// Helpers
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sample = (arr, k) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, k);
};
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 1. Graphify Templates
const graphifySystems = ["user_auth", "payment_gateway", "product_catalog", "notification_service", "billing_engine", "websocket_server"];
const graphifyLibraries = ["sqlalchemy", "redis", "celery", "pydantic", "fastapi", "pytest"];

function genGraphify() {
  const system = choice(graphifySystems);
  const libs = sample(graphifyLibraries, 2);
  const userPrompt = `Map the codebase dependencies and draw import hierarchies for the \`${system}\` component.`;
  
  const thinking = 
    `<think>\n` +
    `Goal: Trace imports and dependencies for the \`${system}\` module.\n` +
    `Step 1: Check entry point \`${system}/main.py\` or \`${system}/__init__.py\`.\n` +
    `Step 2: Parse import statements recursively. Detect internal imports and external libraries: ${libs.join(', ')}.\n` +
    `Step 3: Construct directed graph representations of imports. Check for circular dependencies.\n` +
    `Step 4: Formulate clean, hierarchical tree output.\n` +
    `</think>`;
    
  const response = 
    `Codebase dependency mapping completed for \`${system}\`:\n\n` +
    `Structure Hierarchy:\n` +
    `├── \`${system}/\` (Entrypoint)\n` +
    `│   ├── \`config.py\` -> external: \`${libs[0]}\`\n` +
    `│   ├── \`models.py\` -> external: \`${libs[1]}\`\n` +
    `│   └── \`services.py\` -> imports \`models.py\`\n\n` +
    `Graph Summary: Node Count: 4, Edge Count: 3. No circular dependencies detected.`;
    
  return [
    { role: "user", content: userPrompt },
    { role: "assistant", content: `${thinking}\n${response}` }
  ];
}

// 2. MemPalace Templates
const mempalaceKeys = ["user_session", "cart_state", "checkout_step", "auth_token", "temp_upload_ref", "cache_headers"];

function genMemPalace() {
  const key = choice(mempalaceKeys);
  const val = `session_token_0x${randInt(100000, 999999).toString(16)}`;
  const userPrompt = `Retrieve user session drawer status and update the cache variable \`${key}\` with value \`${val}\`.`;
  
  const thinking = 
    `<think>\n` +
    `Goal: Retrieve context variables from memory drawers and update memory mapping for \`${key}\`.\n` +
    `Step 1: Inspect memory cabinet index. Locate target variable \`${key}\`.\n` +
    `Step 2: Check current expiration status (TTL). Current state is valid.\n` +
    `Step 3: Overwrite variable state in drawer slot with new value: \`${val}\`.\n` +
    `Step 4: Recalculate context hierarchy and return updated status log.\n` +
    `</think>`;
    
  const response = 
    `Memory mapping updated successfully.\n\n` +
    `Drawer Logs:\n` +
    `- Target Drawer: \`Context_Level_1\` (Internal Memory)\n` +
    `- Variable: \`${key}\`\n` +
    `- Previous State: \`NULL\` or \`Expired\`\n` +
    `- New State: \`${val}\` (TTL: 3600s)\n` +
    `- Index Reference: \`slot_0x${randInt(10, 99).toString(16)}\``;
    
  return [
    { role: "user", content: userPrompt },
    { role: "assistant", content: `${thinking}\n${response}` }
  ];
}

// 3. XGBoost Templates
function genXGBoost() {
  const features = randInt(10, 50);
  const iterations = choice([50, 100, 200, 500]);
  const lr = choice([0.01, 0.05, 0.1, 0.2]);
  const maxDepth = choice([3, 5, 6, 8]);
  const userPrompt = `Run an XGBoost regression model training loop. Features: ${features}, Iterations: ${iterations}, Learning Rate: ${lr}, Max Depth: ${maxDepth}.`;
  
  const thinking = 
    `<think>\n` +
    `Goal: Train XGBoost regressor with ${features} features.\n` +
    `Step 1: Initialize booster parameters. \`learning_rate\`=${lr}, \`max_depth\`=${maxDepth}, \`objective\`='reg:squarederror'.\n` +
    `Step 2: Loop iterations from 0 to ${iterations - 1}.\n` +
    `Step 3: Log train-rmse and validation-rmse at interval milestones.\n" +` +
    `Step 4: Compute feature importance scores and plot tree splits.\n` +
    `</think>`;
    
  let log = "";
  const step = Math.max(1, Math.floor(iterations / 4));
  for (let i = 0; i < iterations; i += step) {
    log += `[iter ${i}]  train-rmse: ${(0.85 / (i + 1)).toFixed(5)}  val-rmse: ${(0.92 / (i + 1)).toFixed(5)}\n`;
  }
  
  const response = 
    `XGBoost training successfully converged.\n\n` +
    `Training Progress:\n` +
    `${log}` +
    `Feature Importance (Top 3):\n` +
    `1. Feature_04: 0.4215 (Gain)\n` +
    `2. Feature_12: 0.2319 (Gain)\n` +
    `3. Feature_01: 0.1084 (Gain)\n\n` +
    `Model saved to booster weights checkpoint.`;
    
  return [
    { role: "user", content: userPrompt },
    { role: "assistant", content: `${thinking}\n${response}` }
  ];
}

// 4. AutoGluon Templates
const autogluonPresets = ["best_quality", "high_quality", "medium_quality"];

function genAutoGluon() {
  const preset = choice(autogluonPresets);
  const timeLimit = choice([60, 120, 300]);
  const userPrompt = `Execute AutoGluon AutoML model selection and ensembling fit. Preset: ${preset}, Time Limit: ${timeLimit}s.`;
  
  const thinking = 
    `<think>\n` +
    `Goal: Run AutoGluon Fit on tabular dataset using preset \`${preset}\`.\n` +
    `Step 1: Initialize tabular predictor. Parse features and target labels.\n` +
    `Step 2: Train base models: RandomForest, ExtraTrees, LightGBM, CatBoost, XGBoost, NeuralNet.\n` +
    `Step 3: Run hyperparameter tuning within the ${timeLimit} seconds limit.\n` +
    `Step 4: Perform weighted ensemble selection (Stacking L1/L2).\n` +
    `Step 5: Compile leaderboard sorted by validation score.\n` +
    `</think>`;
    
  const response = 
    `AutoGluon fitting process completed.\n\n` +
    `Leaderboard (Sorted by accuracy):\n` +
    `1. WeightedEnsemble_L2 | score: 0.9421 | fit_time: 14.5s\n` +
    `2. LightGBM           | score: 0.9218 | fit_time: 4.2s\n` +
    `3. CatBoost           | score: 0.9105 | fit_time: 8.9s\n` +
    `4. RandomForest       | score: 0.8842 | fit_time: 3.1s\n\n` +
    `Ensemble weights compiled. Ready for batch inference.`;
    
  return [
    { role: "user", content: userPrompt },
    { role: "assistant", content: `${thinking}\n${response}` }
  ];
}

// 5. GluonTS Templates
const gluontsFrequencies = ["1H", "1D", "7D", "1M"];

function genGluonTS() {
  const freq = choice(gluontsFrequencies);
  const predictionLength = choice([24, 30, 48]);
  const userPrompt = `Run GluonTS probabilistic forecasting pipeline. Frequency: ${freq}, Prediction Length: ${predictionLength}.`;
  
  const thinking = 
    `<think>\n` +
    `Goal: Generate probabilistic forecast using GluonTS DeepAR estimator.\n` +
    `Step 1: Check time-series dataset. Set frequency to \`${freq}\`.\n` +
    `Step 2: Set target prediction window length to ${predictionLength} steps.\n` +
    `Step 3: Initialize trainer and run epochs. Optimize Negative Log-Likelihood.\n` +
    `Step 4: Generate sample paths and compute quantiles (p10, p50, p90).\n` +
    `</think>`;
    
  const response = 
    `GluonTS DeepAR Forecast compiled.\n\n` +
    `Forecast Metrics:\n` +
    `- Mean Absolute Scaled Error (MASE): 0.684\n` +
    `- Symmetric Mean Absolute Percentage Error (sMAPE): 4.21%\n\n` +
    `Forecast Quantile Outputs (Next 3 steps):\n` +
    `Step 1: p10=10.25 | p50=12.42 | p90=14.85\n` +
    `Step 2: p10=10.45 | p50=12.65 | p90=15.10\n` +
    `Step 3: p10=10.50 | p50=12.80 | p90=15.35`;
    
  return [
    { role: "user", content: userPrompt },
    { role: "assistant", content: `${thinking}\n${response}` }
  ];
}

// 6. ElegantRL Templates
const elegantrlAlgorithms = ["DDPG", "PPO", "SAC", "TD3"];

function genElegantRL() {
  const algo = choice(elegantrlAlgorithms);
  const episodes = randInt(100, 500);
  const userPrompt = `Run ElegantRL training run for algorithmic trading environment. Algorithm: ${algo}, Episodes: ${episodes}.`;
  
  const thinking = 
    `<think>\n` +
    `Goal: Train ElegantRL agent with \`${algo}\` policy inside financial portfolio env.\n` +
    `Step 1: Define state spaces (closing prices, technical indicators) and action spaces (buy/sell weights).\n` +
    `Step 2: Initialize Actor-Critic networks.\n" +` +
    `Step 3: Loop trading episodes, storing transactions in ReplayBuffer.\n` +
    `Step 4: Update policy gradients, logging rewards and cumulative portfolio returns.\n` +
    `</think>`;
    
  const response = 
    `ElegantRL policy optimization complete.\n\n` +
    `Training Logs (Milestones):\n` +
    `- Episode 50: Avg Reward = -0.42 | Cumulative Return = -2.1%\n` +
    `- Episode 150: Avg Reward = 0.55  | Cumulative Return = +4.8%\n` +
    `- Episode ${episodes}: Avg Reward = 1.42  | Cumulative Return = +14.2%\n\n` +
    `Policy weights saved. Max drawdown restricted below 5%.`;
    
  return [
    { role: "user", content: userPrompt },
    { role: "assistant", content: `${thinking}\n${response}` }
  ];
}

function generateDataset(numSamples = 5000) {
  const dataset = [];
  for (let i = 0; i < numSamples; i++) {
    const category = choice(categories);
    let messages;
    if (category === "graphify") messages = genGraphify();
    else if (category === "mempalace") messages = genMemPalace();
    else if (category === "xgboost") messages = genXGBoost();
    else if (category === "autogluon") messages = genAutoGluon();
    else if (category === "gluonts") messages = genGluonTS();
    else if (category === "elegantrl") messages = genElegantRL();

    dataset.push({
      id: `surfllm_trace_${i.toString().padStart(4, '0')}`,
      category,
      messages
    });
  }
  return dataset;
}

const outputDir = "C:/Users/YG/Desktop/surfrobot/scratch";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
const outputFile = path.join(outputDir, "surfllm_dataset.json");

console.log("Generating 5,000 multi-task execution traces via Node...");
const dataset = generateDataset(5000);
fs.writeFileSync(outputFile, JSON.stringify(dataset, null, 2), 'utf-8');

console.log(`Dataset successfully compiled and saved to: ${outputFile}`);
console.log(`Total samples: ${dataset.length}`);
