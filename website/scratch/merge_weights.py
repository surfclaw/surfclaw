import torch
from unsloth import FastLanguageModel
import os

print("==========================================")
print("  SurfLLM 16bit Weight Merger & Exporter")
print("==========================================")

from huggingface_hub import HfApi, login

# 1. Configuration
lora_model_path = "./surfllm_rl_weights"
export_path = "./surfllm_final_16bit"
hf_token = os.getenv("HF_TOKEN")

if not os.path.exists(lora_model_path):
    print(f"Error: LoRA weights not found at {lora_model_path}")
    exit(1)

# 2. Login to Hugging Face
print("Logging in to Hugging Face...")
try:
    login(token=hf_token)
    api = HfApi(token=hf_token)
    username = api.whoami()["name"]
    repo_id = f"{username}/surfclaw"
    print(f"Successfully authenticated as: {username}")
    print(f"Target repository: {repo_id}")
except Exception as e:
    print(f"Error authenticating with Hugging Face: {e}")
    exit(1)

# 3. Load Base Model and LoRA Adapters
print(f"Loading base model with adapters from: {lora_model_path}...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = lora_model_path,
    max_seq_length = 2048,
    dtype = None,
    load_in_4bit = False, # Set to False for merging to 16bit
)

# 4. Merge and Save to 16bit (safetensors format)
print(f"Merging weights and saving 16bit model to: {export_path}...")
model.save_pretrained_merged(
    export_path, 
    tokenizer, 
    save_method = "merged_16bit"
)

# 5. Push to Hugging Face Hub (Merged 16bit)
print(f"Pushing merged 16bit model to Hugging Face Hub: {repo_id}...")
try:
    model.push_to_hub_merged(
        repo_id,
        tokenizer,
        save_method = "merged_16bit",
        token = hf_token,
        private = True
    )
    print("==========================================")
    print("  [SUCCESS] 16bit Merge & Hugging Face Upload Complete!")
    print("  Your model is now safe in Hugging Face Gated Repository.")
    print("==========================================")
except Exception as e:
    print(f"Error uploading to Hugging Face: {e}")
    print("Local merged files are saved at:", export_path)
    exit(1)
