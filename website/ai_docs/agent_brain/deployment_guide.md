# SurfLLM GPU 배포 및 모델 학습 가이드 (GPU Deployment & Training Guide)

본 문서는 **프라임 인텔렉트(Prime Intellect)**의 GPU Compute Exchange를 통해 저렴한 GPU 노드를 대여하여 SurfLLM의 SFT(지도학습) 및 GRPO(강화학습) 학습을 수행하고, 최종 가중치(`.safetensors`)를 컴파일하여 허깅페이스(Hugging Face)에 가드 라이선스로 배포하는 실행 가이드입니다.

---

## 1. 프라임 인텔렉트 GPU 대여 (Prime Intellect GPU Rental)

우리 아키텍처의 핵심 파트너인 **Prime Intellect (https://www.primeintellect.ai/)**는 전 세계 유휴 GPU 자원을 통합하여 가장 저렴한 가격에 입찰할 수 있는 **탈중앙화 GPU 컴퓨팅 거래소**입니다. 

1.  **회원가입 및 빌링 설정:**
    *   [Prime Intellect Console](https://app.primeintellect.ai/)에 접속하여 가입합니다.
    *   빌링(Billing) 탭에서 일반 신용카드 혹은 해외결제 카드를 등록합니다 (대출이나 가상자산 없이 일반 피아트 결제).
2.  **GPU 인스턴스 대여:**
    *   `Instances` 메뉴에서 `Create Instance`를 클릭합니다.
    *   **하드웨어 선택:** `A100 80GB` 또는 `RTX 4090` 1대를 선택합니다. Prime Intellect의 실시간 Compute Exchange 입찰가를 통해 전 세계 마켓 중 가장 저렴한 노드(시간당 약 $0.20 ~ $1.00 수준)를 선택할 수 있습니다.
    *   **OS 이미지 선택:** `PyTorch` 템플릿(CUDA 12.1 또는 12.4 지원 이미지)을 선택하여 생성합니다.
    *   인스턴스 생성이 완료되면 제공되는 **SSH 접속 명령어(예: `ssh root@... -p ...`)**를 복사합니다.

---

## 2. 개발 환경 구축 (Dependencies Setup)

대여한 Prime Intellect 인스턴스에 SSH로 접속한 뒤, 다음 명령어를 실행하여 필요한 드라이버 패키지를 초고속 설치합니다.

```bash
# 1. 패키지 업데이트 및 git 설치
apt-get update && apt-get install -y git
pip install --upgrade pip

# 2. uv 패키지 매니저 설치 (초고속 의존성 설치용)
pip install uv

# 3. Unsloth 및 필수 학습 라이브러리 설치 (CUDA 12.1 기준)
uv pip install --system \
    "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git" \
    "trl>=0.8.6" \
    peft \
    accelerate \
    bitsandbytes \
    transformers \
    datasets \
    hf_transfer

# 4. 허깅페이스 고속 다운로드/업로드 환경 설정
export HF_HUB_ENABLE_HF_TRANSFER=1
```

---

## 3. 학습 파일 업로드 (Code Transfer)

로컬의 `scratch/` 폴더 내에 있는 다음 3개의 파일을 Prime Intellect GPU 서버의 작업 디렉토리로 업로드합니다:
*   [surfllm_dataset.json](file:///C:/Users/YG/Desktop/surfrobot/scratch/surfllm_dataset.json) (학습 데이터셋)
*   [train_sft.py](file:///C:/Users/YG/Desktop/surfrobot/scratch/train_sft.py) (Phase 1 SFT 실행 스크립트)
*   [train_rl.py](file:///C:/Users/YG/Desktop/surfrobot/scratch/train_rl.py) (Phase 2 GRPO RL 실행 스크립트)

*업로드 팁: SCP 명령어를 사용하여 업로드하거나, 깃허브 프라이빗 리포지토리를 사용해 서버에서 `git clone`으로 내려받을 수 있습니다.*
```bash
# 로컬 터미널에서 SCP로 업로드하는 예시 (SSH 포트번호와 호스트 주소는 PI 콘솔 정보 입력)
scp -P 포트번호 C:/Users/YG/Desktop/surfrobot/scratch/* root@IP주소:/root/
```

---

## 4. 모델 트레이닝 실행 (Model Training Execution)

대여한 GPU 서버는 클라우드에서 독립적으로 가동되므로, **명령어를 백그라운드로 실행해 두면 대표님이 PC를 끄고 잠을 자는 동안에도 훈련이 멈추지 않고 100% 자동 완료**됩니다.

### A. 백그라운드 훈련 시작 (SFT 및 RL 연동 실행)
터미널이 끊겨도 훈련이 유지되도록 `nohup` 명령어를 사용하여 SFT와 RL을 차례로 실행합니다. SSH 터미널에 아래 한 줄을 복사하여 입력합니다:

```bash
# SFT 실행 후, 완료되면 즉시 RL이 백그라운드에서 이어서 가동됩니다.
nohup sh -c "python train_sft.py && python train_rl.py" > training.log 2>&1 &
```

### B. 훈련 상태 모니터링 및 로그 확인
컴퓨터를 끄기 전이나 잠에서 깨어난 후, 아래 명령어로 실시간 진행 상황(훈련 로그)을 모니터링할 수 있습니다:

```bash
# 실시간 훈련 로그 모니터링 (Ctrl + C로 빠져나올 수 있습니다)
tail -f training.log
```

*   **결과물:** 훈련이 모두 완료되면 `surfllm_lora_weights` 및 `surfllm_rl_weights` 폴더가 차례로 생성되고 가중치가 저장됩니다. 완료 여부는 `tail training.log`를 쳤을 때 `GRPO Weights saved successfully!` 문구가 찍혀있는지로 확인 가능합니다.

---

## 5. 최종 가중치 병합 및 내보내기 (Weights Merge)

서빙 혹은 B2B 배포를 위해 LoRA 어댑터를 베이스 모델과 병합(Merge)하여 단일 `.safetensors` 파일들로 컴파일합니다.

서버 내에서 파이썬 REPL을 열고 아래 코드를 실행하거나, 별도 스크립트(`merge.py`)를 만들어 돌립니다:

```python
from unsloth import FastLanguageModel

# 1. 강화학습 완료된 어댑터 가중치 로드
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "./surfllm_rl_weights", # RL 결과물 경로
    max_seq_length = 2048,
    load_in_4bit = True,
)

# 2. 16비트 정밀도로 가중치 완전 병합 후 로컬에 저장
merged_path = "./surfllm_final_merged"
print("Merging weights to 16bit safetensors...")
model.save_pretrained_merged(merged_path, tokenizer, save_method = "merged_16bit")
print(f"Merged weights saved to {merged_path}")
```

---

## 6. 허깅페이스 Hub 업로드 및 B2B 게이팅 (HF Gated Upload)

대기업/금융사 고객을 타겟으로 상용 판매하기 위해 가중치를 비공개 혹은 승인된 사용자만 다운로드할 수 있는 **Gated Repo**로 올립니다.

```bash
# 1. 허깅페이스 로그인 (토큰 입력 필요, Write 권한 권장)
huggingface-cli login

# 2. 병합 완료 파일 업로드 실행
python -c "
from huggingface_hub import HfApi
api = HfApi()
api.upload_folder(
    folder_path='./surfllm_final_merged',
    repo_id='사용자ID/surfllm-106b-reasoning',
    repo_type='model'
)
print('Upload completed!')
"
```

### Hugging Face Gating 설정 방법:
1.  허깅페이스 모델 페이지(`https://huggingface.co/사용자ID/surfllm-106b-reasoning`) 접속.
2.  `Settings` 탭으로 이동.
3.  `Gated model (Access Request)` 옵션 활성화.
4.  라이선스 동의 문구 및 기업명/연락처 입력을 필수로 설정하여, 승인한 B2B 고객만 가중치를 다운로드할 수 있도록 통제합니다.
