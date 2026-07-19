from unsloth import FastLanguageModel
import torch
from datasets import Dataset
import json
from trl import SFTTrainer
from transformers import TrainingArguments
from unsloth import is_bfloat16_supported

# 1. Configuration & Hyperparameters
max_seq_length = 2048  # Supports long codebase indexing traces
dtype = None           # Auto-detection (float16 for Tesla T4/V100, bfloat16 for Ampere/Ada/Hopper)
load_in_4bit = True    # Reduces GPU memory usage by 4x, runs on a single RTX 3090/4090

# 2. Load Pre-trained Base Model & Tokenizer
print("Loading PrimeIntellect/INTELLECT-3 in 4-bit...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "PrimeIntellect/INTELLECT-3",
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)

# 3. Apply QLoRA PEFT Adapters (Targeting key attention & MLP matrices)
print("Applying LoRA parameters...")
model = FastLanguageModel.get_peft_model(
    model,
    r = 16,
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_alpha = 16,
    lora_dropout = 0,
    bias = "none",
    use_gradient_checkpointing = "unsloth",
    random_state = 3407,
    use_rslora = False,
    loftq_config = None,
)

# 4. Load and Format Dataset
print("Formatting multi-task dataset...")
dataset_path = "./surfllm_dataset.json"

with open(dataset_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

# Convert messages array into Chat template format
def format_prompts(examples):
    texts = []
    for messages in examples["messages"]:
        # Map list of dicts to standard chat format
        formatted = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
        texts.append(formatted)
    return { "text" : texts }

# Convert JSON list to HF Dataset
raw_dataset = Dataset.from_list(raw_data)
formatted_dataset = raw_dataset.map(format_prompts, batched=True)

# 5. Define SFT Trainer & Arguments
print("Initializing trainer...")
trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = formatted_dataset,
    dataset_text_field = "text",
    max_seq_length = max_seq_length,
    dataset_num_proc = 2,
    packing = False, # Can speed up training for short sequences
    args = TrainingArguments(
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4,
        warmup_steps = 5,
        max_steps = 30, # ~1 epoch for 5k dataset with batch size 8
        learning_rate = 2e-4,
        fp16 = not is_bfloat16_supported(),
        bf16 = is_bfloat16_supported(),
        logging_steps = 1,
        optim = "adamw_8bit",
        weight_decay = 0.01,
        lr_scheduler_type = "linear",
        seed = 3407,
        output_dir = "./surfllm_outputs",
        push_to_hub = True,
        hub_model_id = "SURFCLAW/surfclaw-sft",
        hub_token = os.getenv("HF_TOKEN"),
        hub_strategy = "every_save",
        save_steps = 15,
    ),
)

# 6. Run SFT Training
print("Starting Unsloth SFT Training Loop...")
trainer_stats = trainer.train()

print("Training complete!")
print(f"Time elapsed: {trainer_stats.metrics['train_runtime']:.2f} seconds")
print(f"Peak GPU memory reserved: {torch.cuda.max_memory_reserved() / (1024**3):.2f} GB")

# 7. Save Model Weights & Tokenizer
output_model_path = "./surfllm_lora_weights"
print(f"Saving fine-tuned LoRA adapter weights to: {output_model_path}")
model.save_pretrained(output_model_path)
tokenizer.save_pretrained(output_model_path)

print("Phase 1 SFT Weight compilation successful!")
