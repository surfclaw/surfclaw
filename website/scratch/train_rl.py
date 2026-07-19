import torch
import json
import re
from datasets import Dataset
from transformers import AutoTokenizer
from peft import LoraConfig
from trl import GRPOTrainer, GRPOConfig
from unsloth import FastLanguageModel

# 1. Configuration
model_name = "./surfllm_lora_weights"
max_seq_length = 2048
dataset_path = "./surfllm_dataset.json"
output_dir = "./surfllm_rl_weights"

# 2. Load Model & Tokenizer using Unsloth
print("Loading model and tokenizer in 4-bit...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = model_name,
    max_seq_length = max_seq_length,
    load_in_4bit = True,
)

# 3. LoRA Configuration for RL
peft_config = LoraConfig(
    r = 16,
    lora_alpha = 16,
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_dropout = 0.0,
    bias = "none",
    task_type = "CAUSAL_LM",
)

# 4. Load Dataset
with open(dataset_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

# Convert into a format suitable for GRPO
# GRPO expects prompts and optional reference answers
formatted_data = []
for item in raw_data:
    # Get the user prompt (usually the first message)
    prompt = next((m["content"] for m in item["messages"] if m["role"] == "user"), None)
    # Get the expected assistant response (ground truth)
    reference = next((m["content"] for m in item["messages"] if m["role"] == "assistant"), None)
    
    if prompt and reference:
        formatted_data.append({
            "prompt": prompt,
            "reference": reference
        })

dataset = Dataset.from_list(formatted_data)

# 5. Define Rule-Based Reward Functions (Verifiers)

def format_reward_func(prompts, completions, **kwargs):
    """Reward function that checks if the model output follows the <think>...</think> reasoning format."""
    rewards = []
    for completion in completions:
        # Check if the output has <think> and </think> tags
        has_think_open = "<think>" in completion
        has_think_close = "</think>" in completion
        
        # Verify the structure is correct: <think> reasoning </think> content
        pattern = r"^<think>.*?</think>\s*.*"
        matches_structure = re.match(pattern, completion, re.DOTALL)
        
        if has_think_open and has_think_close and matches_structure:
            rewards.append(1.0)
        else:
            rewards.append(0.0)
    return rewards

def code_syntax_reward_func(prompts, completions, **kwargs):
    """Reward function that checks if the model output contains valid code syntax block if required."""
    rewards = []
    for completion in completions:
        # Check for code blocks (e.g. ```python or ```json)
        has_code_block = "```" in completion
        
        # Reward valid markdown structures
        if has_code_block:
            rewards.append(0.5)
        else:
            rewards.append(0.0)
    return rewards

def json_validity_reward_func(prompts, completions, **kwargs):
    """Reward function that checks if the assistant output contains a parsable JSON code block if requested."""
    rewards = []
    for prompt, completion in zip(prompts, completions):
        # Only check JSON if the prompt asks for JSON output
        if "json" in prompt.lower() or "schema" in prompt.lower():
            # Extract JSON block
            json_pattern = r"```json\s*(.*?)\s*```"
            match = re.search(json_pattern, completion, re.DOTALL)
            if match:
                json_str = match.group(1).strip()
                try:
                    json.loads(json_str)
                    rewards.append(1.5)  # High reward for structurally valid JSON
                except json.JSONDecodeError:
                    rewards.append(-0.5) # Penalty for malformed JSON
            else:
                rewards.append(0.0)
        else:
            rewards.append(0.0)
    return rewards

# 6. GRPO Config
training_args = GRPOConfig(
    output_dir = output_dir,
    learning_rate = 5e-6,
    adam_beta1 = 0.9,
    adam_beta2 = 0.99,
    weight_decay = 0.1,
    warmup_ratio = 0.03,
    lr_scheduler_type = "cosine",
    logging_steps = 1,
    bf16 = True,
    per_device_train_batch_size = 1,
    gradient_accumulation_steps = 8,
    num_generations = 4, # GRPO group size (number of completions per prompt to contrast)
    max_prompt_length = 512,
    max_completion_length = 512,
    max_steps = 30, # Budget-optimized step limit
    save_steps = 15,
    push_to_hub = True,
    hub_model_id = "SURFCLAW/surfclaw",
    hub_token = os.getenv("HF_TOKEN"),
    hub_strategy = "every_save",
)

# 7. Initialize and Run GRPO Trainer
print("Initializing GRPOTrainer...")
trainer = GRPOTrainer(
    model = model,
    reward_funcs = [format_reward_func, code_syntax_reward_func, json_validity_reward_func],
    args = training_args,
    train_dataset = dataset,
    peft_config = peft_config,
)

print("Starting GRPO Reinforcement Learning loop...")
trainer.train()

print("RL Training complete. Saving adapters...")
model.save_pretrained(output_dir)
tokenizer.save_pretrained(output_dir)
print("GRPO Weights saved successfully!")
