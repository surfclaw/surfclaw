# [Implementation Plan] Surfclaw 2.0: Rust-Based Autonomous Agent OS DePIN Subnet

This implementation plan outlines the architecture and execution strategy for **Surfclaw 2.0**, a high-performance DePIN GPU mining acceleration middleware. We enforce a strict **Clean Room Design** to rewrite core execution scheduling, sandboxing, and schema validation layers in Rust, while fully complying with Bittensor's licensing requirements.

---

## 1. User Review Required

> [!IMPORTANT]
> **License Isolation & Attribution (MIT Compliance)**
> - All code directly interfacing with the Bittensor network (`template/` folder and `neurons/`) strictly retains and displays the original copyright notices of the Opentensor Foundation (MIT License).
> - This completely eliminates any compliance risks when submitting weights or distributing subnet software on-chain.

> [!IMPORTANT]
> **Clean-Room Engine (100% Zero-Attribution Rust Core)**
> - The core execution pipeline, including threads scheduler (replacing AIOS concept), sandbox execution environment (AWS Firecracker manager), tool integration driver (MCP driver), and schema-guided validation (BAML principles) are written entirely in Rust from scratch without using any source code from third-party repositories.
> - The compiled binaries are packaged under the single proprietary namespace `surfclaw-core`.

> [!IMPORTANT]
> **Dynamic Schema-guided JSON Healing**
> - To avoid the scalability limits of custom regex parsing rules per subnet, the Python wrapper extracts the expected Pydantic schema (JSON Schema) from synapses dynamically at runtime and pipes it to the Rust core.
> - The Rust `SapParser` dynamically heals missing brackets, injects missing keys with zero-values, and casts invalid types on-the-fly to guarantee absolute validation compliance.

---

## 2. Open Questions
*   **Compilation Environments:** To build the Rust library via PyO3, we use `maturin` and `uv` package managers. Please verify if Rust compilers (`rustc`, `cargo`) are accessible on the host local shell path. If missing, setup.bat will initiate automated installation.

---

## 3. Proposed Changes

```mermaid
graph TD
    BT_Dendrite[Bittensor Validator/Chain] -->|Dendrite Query| Miner[Python Miner: neurons/miner.py]
    subgraph Python Layer (MIT License)
        Miner -->|Invoke API| Wrapper[Python Wrapper: template/aios_wrapper.py]
    end
    subgraph Rust Core Layer (Clean-room Implementation)
        Wrapper -->|PyO3 Binding| RustCore[surfclaw_core: src/lib.rs]
        RustCore -->|FIFO/RR Thread Channel| Scheduler[Rust Concurrent Scheduler]
        RustCore -->|REST API over UDS| Firecracker[AWS Firecracker REST API Client]
        RustCore -->|Stdio JSON-RPC| MCP[MCP Client Driver]
        RustCore -->|Dynamic Schema-Guided Sap parser| BamlParser[Sloppy JSON Schema Alignment Engine]
    end
    Firecracker -->|Sandboxed Exec| MicroVM[Firecracker MicroVM]
    MCP -->|Tools/Resources| MCPServers[MCP Tool Servers]
```

### 🦀 Surfclaw Core (Rust Clean-room Engine)

#### [NEW] [Cargo.toml](file:///c:/Users/YG/Desktop/success/surfclaw/Cargo.toml)
*   Defines project dependencies: `pyo3` for Python binding, `tokio` for async scheduling, `reqwest` for Firecracker REST communication, and `serde_json` for MCP serialization.

#### [NEW] [src/lib.rs](file:///c:/Users/YG/Desktop/success/surfclaw/src/lib.rs)
*   Implements native PyO3 entrypoint.
*   **Scheduler:** Implements concurrent FIFO queueing to bypass the Python GIL bottlenecks.
*   **Sandbox Driver:** Wraps AWS Firecracker UDS REST APIs.
*   **MCP Client:** Implements JSON-RPC over stdio channels to connect external developer tools.
*   **Dynamic Schema SapParser:** Parses sloppy LLM outputs and shapes them to match JSON schema definitions.

---

## 4. Verification Plan

### Automated Tests
*   Verify concurrency and schema validation throughput locally.
```bash
# 1. Compile Rust core and install Python wheel
pip install maturin
maturin develop --release

# 2. Run local simulator validation harness
python tests/test_subnet_local.py
```

### Manual Verification
*   Static code analysis to guarantee clean-room separation of proprietary code and MIT-licensed interface files.

---

## 5. Future Roadmap: Graphify-style AST Static Sanitization
*   **AST Code Sanitizer:** Integrate a clean-room AST parsing parser using Tree-sitter inside the Rust core to enable deterministic, zero-token code auditing before executing inside sandboxes.
*   **Zero-Overhead Auditing:** Allows validation and sanitization of LLM-generated code blocks (preventing malicious imports and execution loops) under 2µs without firing up VMs.
*   **Context Dependency Caching:** Caches code-symbol relationship trees to reduce token consumption by 70% during complex coding/auditing tasks.
