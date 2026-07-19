from huggingface_hub import HfApi
import sys
import os
token = os.getenv("HF_TOKEN")
api = HfApi(token=token)

try:
    user_info = api.whoami()
    username = user_info["name"]
    repo_id = f"{username}/surfclaw"
    print(f"Authenticated user: {username}")
    
    # Check if repo exists
    try:
        files = api.list_repo_files(repo_id=repo_id)
        print("SUCCESS: Repository exists!")
        print("Files in repository:")
        for f in files:
            print(f" - {f}")
    except Exception as e:
        print(f"Repository {repo_id} does not exist or cannot be accessed: {e}")
        
except Exception as e:
    print(f"HF Authentication failed: {e}")
