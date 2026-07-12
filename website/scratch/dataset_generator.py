import json
import random
import os

# Define template categories for the SurfLLM multi-task trace dataset
categories = ["graphify", "mempalace", "xgboost", "autogluon", "gluonts", "elegantrl"]

# 1. Graphify Templates
graphify_systems = ["user_auth", "payment_gateway", "product_catalog", "notification_service", "billing_engine", "websocket_server"]
graphify_libraries = ["sqlalchemy", "redis", "celery", "pydantic", "fastapi", "pytest"]

def gen_graphify():
    system = random.choice(graphify_systems)
    libs = random.sample(graphify_libraries, k=2)
    user_prompt = f"Map the codebase dependencies and draw import hierarchies for the `{system}` component."
    
    thinking = (
        f"<think>\n"
        f"Goal: Trace imports and dependencies for the `{system}` module.\n"
        f"Step 1: Check entry point `{system}/main.py` or `{system}/__init__.py`.\n"
        f"Step 2: Parse import statements recursively. Detect internal imports and external libraries: {', '.join(libs)}.\n"
        f"Step 3: Construct directed graph representations of imports. Check for circular dependencies.\n"
        f"Step 4: Formulate clean, hierarchical tree output.\n"
        f"</think>"
    )
    
    response = (
        f"Codebase dependency mapping completed for `{system}`:\n\n"
        f"Structure Hierarchy:\n"
        f"├── `{system}/` (Entrypoint)\n"
        f"│   ├── `config.py` -> external: `{libs[0]}`\n"
        f"│   ├── `models.py` -> external: `{libs[1]}`\n"
        f"│   └── `services.py` -> imports `models.py`\n\n"
        f"Graph Summary: Node Count: 4, Edge Count: 3. No circular dependencies detected."
    )
    
    return [
        {"role": "user", "content": user_prompt},
        {"role": "assistant", "content": f"{thinking}\n{response}"}
    ]

# 2. MemPalace Templates
mempalace_keys = ["user_session", "cart_state", "checkout_step", "auth_token", "temp_upload_ref", "cache_headers"]

def gen_mempalace():
    key = random.choice(mempalace_keys)
    val = f"session_token_0x{random.randint(100000, 999999):x}"
    user_prompt = f"Retrieve user session drawer status and update the cache variable `{key}` with value `{val}`."
    
    thinking = (
        f"<think>\n"
        f"Goal: Retrieve context variables from memory drawers and update memory mapping for `{key}`.\n"
        f"Step 1: Inspect memory cabinet index. Locate target variable `{key}`.\n"
        f"Step 2: Check current expiration status (TTL). Current state is valid.\n"
        f"Step 3: Overwrite variable state in drawer slot with new value: `{val}`.\n"
        f"Step 4: Recalculate context hierarchy and return updated status log.\n"
        f"</think>"
    )
    
    response = (
        f"Memory mapping updated successfully.\n\n"
        f"Drawer Logs:\n"
        f"- Target Drawer: `Context_Level_1` (Internal Memory)\n"
        f"- Variable: `{key}`\n"
        f"- Previous State: `NULL` or `Expired`\n"
        f"- New State: `{val}` (TTL: 3600s)\n"
        f"- Index Reference: `slot_0x{random.randint(10, 99):x}`"
    )
    
    return [
        {"role": "user", "content": user_prompt},
        {"role": "assistant", "content": f"{thinking}\n{response}"}
    ]

# 3. XGBoost Templates
def gen_xgboost():
    features = random.randint(10, 50)
    iterations = random.choice([50, 100, 200, 500])
    lr = random.choice([0.01, 0.05, 0.1, 0.2])
    max_depth = random.choice([3, 5, 6, 8])
    user_prompt = f"Run an XGBoost regression model training loop. Features: {features}, Iterations: {iterations}, Learning Rate: {lr}, Max Depth: {max_depth}."
    
    thinking = (
        f"<think>\n"
        f"Goal: Train XGBoost regressor with {features} features.\n"
        f"Step 1: Initialize booster parameters. `learning_rate`={lr}, `max_depth`={max_depth}, `objective`='reg:squarederror'.\n"
        f"Step 2: Loop iterations from 0 to {iterations - 1}.\n"
        f"Step 3: Log train-rmse and validation-rmse at interval milestones.\n"
        f"Step 4: Compute feature importance scores and plot tree splits.\n"
        f"</think>"
    )
    
    # Generate mock training log
    log = ""
    for i in range(0, iterations, max(1, iterations // 4)):
        log += f"[iter {i}]  train-rmse: {(0.85/(i+1)):.5f}  val-rmse: {(0.92/(i+1)):.5f}\n"
    
    response = (
        f"XGBoost training successfully converged.\n\n"
        f"Training Progress:\n"
        f"{log}"
        f"Feature Importance (Top 3):\n"
        f"1. Feature_04: 0.4215 (Gain)\n"
        f"2. Feature_12: 0.2319 (Gain)\n"
        f"3. Feature_01: 0.1084 (Gain)\n\n"
        f"Model saved to booster weights checkpoint."
    )
    
    return [
        {"role": "user", "content": user_prompt},
        {"role": "assistant", "content": f"{thinking}\n{response}"}
    ]

# 4. AutoGluon Templates
autogluon_presets = ["best_quality", "high_quality", "medium_quality"]

def gen_autogluon():
    preset = random.choice(autogluon_presets)
    time_limit = random.choice([60, 120, 300])
    user_prompt = f"Execute AutoGluon AutoML model selection and ensembling fit. Preset: {preset}, Time Limit: {time_limit}s."
    
    thinking = (
        f"<think>\n"
        f"Goal: Run AutoGluon Fit on tabular dataset using preset `{preset}`.\n"
        f"Step 1: Initialize tabular predictor. Parse features and target labels.\n"
        f"Step 2: Train base models: RandomForest, ExtraTrees, LightGBM, CatBoost, XGBoost, NeuralNet.\n"
        f"Step 3: Run hyperparameter tuning within the {time_limit} seconds limit.\n"
        f"Step 4: Perform weighted ensemble selection (Stacking L1/L2).\n"
        f"Step 5: Compile leaderboard sorted by validation score.\n"
        f"</think>"
    )
    
    response = (
        f"AutoGluon fitting process completed.\n\n"
        f"Leaderboard (Sorted by accuracy):\n"
        f"1. WeightedEnsemble_L2 | score: 0.9421 | fit_time: 14.5s\n"
        f"2. LightGBM           | score: 0.9218 | fit_time: 4.2s\n"
        f"3. CatBoost           | score: 0.9105 | fit_time: 8.9s\n"
        f"4. RandomForest       | score: 0.8842 | fit_time: 3.1s\n\n"
        f"Ensemble weights compiled. Ready for batch inference."
    )
    
    return [
        {"role": "user", "content": user_prompt},
        {"role": "assistant", "content": f"{thinking}\n{response}"}
    ]

# 5. GluonTS Templates
gluonts_frequencies = ["1H", "1D", "7D", "1M"]

def gen_gluonts():
    freq = random.choice(gluonts_frequencies)
    prediction_length = random.choice([24, 30, 48])
    user_prompt = f"Run GluonTS probabilistic forecasting pipeline. Frequency: {freq}, Prediction Length: {prediction_length}."
    
    thinking = (
        f"<think>\n"
        f"Goal: Generate probabilistic forecast using GluonTS DeepAR estimator.\n"
        f"Step 1: Check time-series dataset. Set frequency to `{freq}`.\n"
        f"Step 2: Set target prediction window length to {prediction_length} steps.\n"
        f"Step 3: Initialize trainer and run epochs. Optimize Negative Log-Likelihood.\n"
        f"Step 4: Generate sample paths and compute quantiles (p10, p50, p90).\n"
        f"</think>"
    )
    
    response = (
        f"GluonTS DeepAR Forecast compiled.\n\n"
        f"Forecast Metrics:\n"
        f"- Mean Absolute Scaled Error (MASE): 0.684\n"
        f"- Symmetric Mean Absolute Percentage Error (sMAPE): 4.21%\n\n"
        f"Forecast Quantile Outputs (Next 3 steps):\n"
        f"Step 1: p10=10.25 | p50=12.42 | p90=14.85\n"
        f"Step 2: p10=10.45 | p50=12.65 | p90=15.10\n"
        f"Step 3: p10=10.50 | p50=12.80 | p90=15.35"
    )
    
    return [
        {"role": "user", "content": user_prompt},
        {"role": "assistant", "content": f"{thinking}\n{response}"}
    ]

# 6. ElegantRL Templates
elegantrl_algorithms = ["DDPG", "PPO", "SAC", "TD3"]

def gen_elegantrl():
    algo = random.choice(elegantrl_algorithms)
    episodes = random.randint(100, 500)
    user_prompt = f"Run ElegantRL training run for algorithmic trading environment. Algorithm: {algo}, Episodes: {episodes}."
    
    thinking = (
        f"<think>\n"
        f"Goal: Train ElegantRL agent with `{algo}` policy inside financial portfolio env.\n"
        f"Step 1: Define state spaces (closing prices, technical indicators) and action spaces (buy/sell weights).\n"
        f"Step 2: Initialize Actor-Critic networks.\n"
        f"Step 3: Loop trading episodes, storing transactions in ReplayBuffer.\n"
        f"Step 4: Update policy gradients, logging rewards and cumulative portfolio returns.\n"
        f"</think>"
    )
    
    response = (
        f"ElegantRL policy optimization complete.\n\n"
        f"Training Logs (Milestones):\n"
        f"- Episode 50: Avg Reward = -0.42 | Cumulative Return = -2.1%\n"
        f"- Episode 150: Avg Reward = 0.55  | Cumulative Return = +4.8%\n"
        f"- Episode {episodes}: Avg Reward = 1.42  | Cumulative Return = +14.2%\n\n"
        f"Policy weights saved. Max drawdown restricted below 5%."
    )
    
    return [
        {"role": "user", "content": user_prompt},
        {"role": "assistant", "content": f"{thinking}\n{response}"}
    ]

# Main Dataset Generator Loop
def generate_dataset(num_samples=5000):
    dataset = []
    
    for i in range(num_samples):
        category = random.choice(categories)
        if category == "graphify":
            messages = gen_graphify()
        elif category == "mempalace":
            messages = gen_mempalace()
        elif category == "xgboost":
            messages = gen_xgboost()
        elif category == "autogluon":
            messages = gen_autogluon()
        elif category == "gluonts":
            messages = gen_gluonts()
        elif category == "elegantrl":
            messages = gen_elegantrl()
            
        dataset.append({
            "id": f"surfllm_trace_{i:04d}",
            "category": category,
            "messages": messages
        })
        
    return dataset

if __name__ == "__main__":
    output_dir = "C:/Users/YG/Desktop/surfrobot/scratch"
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "surfllm_dataset.json")
    
    print("Generating 5,000 multi-task execution traces...")
    dataset = generate_dataset(5000)
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)
        
    print(f"Dataset successfully compiled and saved to: {output_file}")
    print(f"Total samples: {len(dataset)}")
