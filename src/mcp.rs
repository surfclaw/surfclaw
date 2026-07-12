use std::process::{Command, Child, Stdio};
use std::io::{BufReader, BufRead, Write};
use serde_json::{Value, json};

pub struct McpClient {
    child: Option<Child>,
    reader: Option<BufReader<std::process::ChildStdout>>,
    writer: Option<std::process::ChildStdin>,
    request_id: i64,
}

impl McpClient {
    pub fn new() -> Self {
        Self {
            child: None,
            reader: None,
            writer: None,
            request_id: 1,
        }
    }

    /// 외부 MCP 도구 서버 프로세스를 Stdio 파이프로 안전하게 구동합니다.
    pub fn start(&mut self, command: &str, args: Vec<String>) -> Result<(), String> {
        let mut child = Command::new(command)
            .args(&args)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| format!("MCP Server spawn failed: {}", e))?;

        let stdout = child.stdout.take().ok_or("Failed to map MCP stdout")?;
        let stdin = child.stdin.take().ok_or("Failed to map MCP stdin")?;

        self.reader = Some(BufReader::new(stdout));
        self.writer = Some(stdin);
        self.child = Some(child);

        Ok(())
    }

    /// JSON-RPC 2.0 요청 전송 및 응답 수신 동기 트랜잭션 처리
    fn send_request(&mut self, method: &str, params: Value) -> Result<Value, String> {
        let id = self.request_id;
        self.request_id += 1;

        let request = json!({
            "jsonrpc": "2.0",
            "method": method,
            "params": params,
            "id": id
        }).to_string() + "\n";

        let writer = self.writer.as_mut().ok_or("MCP Writer connection closed")?;
        writer.write_all(request.as_bytes()).map_err(|e| e.to_string())?;
        writer.flush().map_err(|e| e.to_string())?;

        let reader = self.reader.as_mut().ok_or("MCP Reader connection closed")?;
        let mut response_line = String::new();
        reader.read_line(&mut response_line).map_err(|e| e.to_string())?;

        let resp: Value = serde_json::from_str(&response_line)
            .map_err(|e| format!("JSON-RPC Parse Error: {}", e))?;

        if let Some(err) = resp.get("error") {
            return Err(format!("MCP JSON-RPC Remote Error: {}", err));
        }

        resp.get("result")
            .cloned()
            .ok_or_else(|| "Invalid JSON-RPC Response result key missing".to_string())
    }

    /// MCP Handshake 초기화 수행
    pub fn initialize(&mut self) -> Result<(), String> {
        let params = json!({
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "Surfclaw-Core-Agent",
                "version": "2.0"
            }
        });

        self.send_request("initialize", params)?;
        self.send_request("notifications/initialized", json!({}))?;
        Ok(())
    }

    /// 서버가 제공하는 도구 목록 획득
    pub fn list_tools(&mut self) -> Result<Vec<String>, String> {
        let result = self.send_request("tools/list", json!({}))?;
        let mut tools_list = Vec::new();
        if let Some(tools) = result.get("tools").and_then(|t| t.as_array()) {
            for tool in tools {
                if let Some(name) = tool.get("name").and_then(|n| n.as_str()) {
                    tools_list.push(name.to_string());
                }
            }
        }
        Ok(tools_list)
    }

    /// 특정 도구 실행 및 결과 반환
    pub fn call_tool(&mut self, name: &str, arguments: Value) -> Result<String, String> {
        let params = json!({
            "name": name,
            "arguments": arguments
        });

        let result = self.send_request("tools/call", params)?;
        if let Some(content) = result.get("content").and_then(|c| c.as_array()) {
            let mut results_text = String::new();
            for item in content {
                if let Some(text) = item.get("text").and_then(|t| t.as_str()) {
                    results_text.push_str(text);
                }
            }
            Ok(results_text)
        } else {
            Err("No content returned from tool call".to_string())
        }
    }
}

impl Drop for McpClient {
    fn drop(&mut self) {
        if let Some(mut child) = self.child.take() {
            let _ = child.kill();
        }
    }
}
