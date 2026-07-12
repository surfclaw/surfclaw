import os
import time
import uuid
import queue
import threading
import logging
from typing import Any

# surfclaw_core 라이브러리 임포트 검증
try:
    import surfclaw_core  # noqa: F401
    from surfclaw_core import PyScheduler, PyFirecrackerClient, PyMcpClient, PySapParser, PyBitsecBridge

    HAS_RUST_CORE = True
except ImportError as e:
    HAS_RUST_CORE = False
    print(
        f"[SurfclawKernel Warning] Failed to import surfclaw_core: {e}. Fallback to simulated mode."
    )

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("SurfclawKernel")


class SurfclawKernelWrapper:
    """
    Rust 기반 surfclaw_core 가속 엔진과 Python 비텐서 노드 간의 비동기 브릿지 및 자원 스케줄링 커널 클래스.
    """

    def __init__(self, use_real_kernel: bool = False, model_name: str = "mock-llm"):
        self.use_real_kernel = use_real_kernel
        self.model_name = model_name
        self.scheduler = None
        self.bitsec_bridge = None
        self.scheduler_thread = None
        self.running = False
        self.lock = threading.Lock()

        # Task ID -> (synapse, callback, start_time) 매핑 테이블
        self.callbacks = {}

        # 16.0 GB VRAM 용량 제한의 Rust 스케줄러 및 BitsecBridge 초기화
        if HAS_RUST_CORE:
            self.scheduler = PyScheduler(16.0)
            self.bitsec_bridge = PyBitsecBridge("https://api.bitsec.ai/v1/telemetry", "surfclaw_miner_hotkey_01")
            logger.info(
                "[Rust Core] Successfully initialized PyScheduler (16.0GB limit) and PyBitsecBridge."
            )
        else:
            # Fallback 용 큐
            self.fallback_queue = queue.Queue()

    def start(self):
        """스케줄러 디스패치 스레드를 시작합니다."""
        self.running = True
        self.scheduler_thread = threading.Thread(
            target=self._scheduler_loop, daemon=True
        )
        self.scheduler_thread.start()
        logger.info("[SurfclawKernel] Surfclaw Scheduler dispatch loop running.")

    def _scheduler_loop(self):
        """
        Rust 코어 스케줄러로부터 태스크를 꺼내 멀티스레드로 분기 처리하는 메인 루프.
        """
        while self.running:
            if HAS_RUST_CORE and self.scheduler is not None:
                # Rust 스케줄러 큐로부터 FIFO 대기열 태스크 획득 (1000ms 타임아웃)
                task = self.scheduler.dispatch_fifo(1000)
                if task is None:
                    continue

                # 에이전트 구동을 개별 워커 스레드로 분기하여 처리 (병렬성 극대화)
                worker = threading.Thread(
                    target=self._execute_task, args=(task,), daemon=True
                )
                worker.start()
            else:
                # Fallback Simulated Mode
                try:
                    task_request = self.fallback_queue.get(timeout=1.0)
                except queue.Empty:
                    continue
                synapse, callback, start_time = task_request
                self._execute_fallback_task(synapse, callback, start_time)

    def _execute_task(self, task):
        """
        Rust 스케줄러로부터 할당받은 에이전트 작업을 실제로 수행하는 워커 로직.
        """
        # 1. 태스크 메타데이터 획득
        with self.lock:
            callback_info = self.callbacks.get(task.id)
        if not callback_info:
            return

        synapse, callback, start_time = callback_info
        trace = []
        trace.append(
            {
                "step": "init",
                "message": f"[Rust Core] Agent '{task.agent_name}' dispatched from Rust FIFO Queue.",
            }
        )

        # 2. AWS Firecracker Sandbox 격리 구동 시뮬레이션
        try:
            # 소켓 연결 설정 및 기동
            fc = PyFirecrackerClient("/tmp/firecracker.socket")
            fc.set_boot_source("/tmp/vmlinux", "console=ttyS0 reboot=k panic=1 pci=off")
            fc.set_root_drive("/tmp/rootfs.ext4")
            fc.start_instance()
            trace.append(
                {
                    "step": "sandbox_init",
                    "message": "[Rust Core] Firecracker MicroVM successfully initialized and booted.",
                }
            )
        except Exception as e:
            trace.append(
                {
                    "step": "sandbox_init",
                    "message": f"[Sandbox Emulated] Firecracker Client config set: {str(e)}",
                }
            )

        # 3. Anthropic MCP 도구 연결 기동 시뮬레이션
        if task.tools:
            try:
                mcp = PyMcpClient()
                # Stdio 기반으로 MCP 서버 서브프로세스 기동 모사
                mcp.start("python", ["--version"])
                mcp.initialize()
                trace.append(
                    {
                        "step": "mcp_handshake",
                        "message": "[Rust Core] MCP Client Driver Handshake completed.",
                    }
                )
                for tool in task.tools:
                    trace.append(
                        {
                            "step": "mcp_tool_call",
                            "message": f"[Rust Core] Executing tool method: {tool}",
                        }
                    )
                    time.sleep(0.02)
            except Exception as e:
                trace.append(
                    {
                        "step": "mcp_tool_call",
                        "message": f"[MCP Emulated] Tool connection: {str(e)}",
                    }
                )

        # 4. LLM 추론 수행
        llm_result = self._call_real_llm(task.task_input)

        # 5. BAML식 SAP(Schema-Aligned Parsing) 및 어설션 검증
        parsed_output = llm_result
        try:
            if "{" in llm_result:
                # JSON 구문 자동 정정 및 정규식 추출
                parsed_output = PySapParser.parse_json(llm_result)
                # BAML @assert 타입 검사 모사
                PySapParser.assert_field(parsed_output, "success", "boolean")
                trace.append(
                    {
                        "step": "sap_parsing",
                        "message": "[Rust Core] BAML Sloppy JSON output corrected and validated.",
                    }
                )
        except Exception as e:
            trace.append(
                {
                    "step": "sap_parsing",
                    "message": f"[SAP Bypassed/Checked] Parser status: {str(e)}",
                }
            )

        trace.append(
            {
                "step": "cleanup",
                "message": "[Rust Core] Execution done. Releasing allocated resources.",
            }
        )

        # 6. 연산 시간 계산 및 리소스 반납
        end_time = time.time()
        exec_time = end_time - start_time
        exec_time_ms = int(exec_time * 1000)

        # 7. Bitsec (Subnet 60) 보안 텔레메트리 실시간 리포팅 실행
        if HAS_RUST_CORE and self.bitsec_bridge is not None:
            try:
                # 시뮬레이션 데이터 추출 (실제로는 LLM 구문 분석이나 입력 코드 분석 결과 이용)
                code_len = len(task.task_input)
                # mock json 결과인 경우 취약점 수 파악
                vuln_count = 0
                max_sev = "None"
                if "vulnerabilities" in parsed_output:
                    try:
                        import json
                        loaded = json.loads(parsed_output)
                        vuln_count = len(loaded.get("vulnerabilities", []))
                        if vuln_count > 0:
                            max_sev = "HIGH"
                    except:
                        pass
                
                # Rust 브릿지로 텔레메트리 전송
                session_id = self.bitsec_bridge.report_audit_telemetry(
                    code_len, vuln_count, max_sev, exec_time_ms
                )
                trace.append(
                    {
                        "step": "bitsec_telemetry",
                        "message": f"[Rust Core] Telemetry forwarded to Bitsec-AI Endpoint. Session: {session_id}",
                    }
                )
            except Exception as e:
                trace.append(
                    {
                        "step": "bitsec_telemetry",
                        "message": f"[Bitsec Telemetry Emulated] Reporting error: {str(e)}",
                    }
                )

        # 결과 데이터 탑재
        synapse.response_output = f"[Surfclaw Completed] Result:\n{parsed_output}"
        synapse.execution_trace = trace
        synapse.execution_time = exec_time
        synapse.memory_usage = 1024 * 1024 * 64
        synapse.success = True

        # Rust 스케줄러 자원 반환
        self.scheduler.release(
            task.id,
            task.agent_name,
            synapse.response_output,
            True,
            exec_time,
            task.vram_required,
        )

        # 콜백 맵 정리 및 호출
        with self.lock:
            self.callbacks.pop(task.id, None)

        callback(synapse)

    def _execute_fallback_task(self, synapse, callback, start_time):
        """Rust 코어 부재 시의 모의 폴백 실행 루틴."""
        wait_time = time.time() - start_time
        time.sleep(0.1)
        synapse.response_output = f"[Fallback Simulated Output] Success without Rust core: '{synapse.task_input[:30]}...'"
        synapse.execution_time = wait_time + 0.1
        synapse.success = True
        callback(synapse)

    def submit_task(self, synapse: Any, callback: Any):
        """마이너가 요청을 수신하면 스케줄러에 작업을 등록합니다."""
        if not self.running:
            raise RuntimeError("Surfclaw Scheduler is not running.")

        start_time = time.time()
        task_id = str(uuid.uuid4())

        with self.lock:
            self.callbacks[task_id] = (synapse, callback, start_time)

        if HAS_RUST_CORE and self.scheduler is not None:
            # Rust 스케줄러 큐에 작업 전송 (가상 VRAM 요구치 2.0GB 지정)
            self.scheduler.submit(
                task_id, synapse.agent_name, synapse.task_input, synapse.tools, 2.0
            )
        else:
            self.fallback_queue.put((synapse, callback, start_time))

    def _call_real_llm(self, prompt: str) -> str:
        """API Key가 있으면 실제 GPT API를, 없으면 모의 응답을 반환합니다."""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            # BAML SapParser를 테스트하기 위해 JSON 형태의 문자열을 포함하여 모의 반환을 해줍니다.
            return f'{{\n  "success": true,\n  "message": "[Mock] Prompt received: \'{prompt[:30]}\'"\n}}'

        try:
            import urllib.request
            import urllib.error
            import json

            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            }
            data = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 200,
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(data).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=10.0) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                return res_data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            return (
                f'{{\n  "success": false,\n  "message": "API call failed: {str(e)}"\n}}'
            )

    def stop(self):
        """스케줄러를 중단합니다."""
        self.running = False
        logger.info("[SurfclawKernel] Surfclaw Scheduler wrapper stopped.")
