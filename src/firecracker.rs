#![allow(dead_code)]

use std::io;

pub struct FirecrackerClient {
    pub socket_path: String,
}

impl FirecrackerClient {
    pub fn new(socket_path: &str) -> Self {
        Self {
            socket_path: socket_path.to_string(),
        }
    }

    #[cfg(unix)]
    fn send_request(&self, method: &str, path: &str, body: &str) -> Result<String, io::Error> {
        use std::os::unix::net::UnixStream;
        use std::io::{Write, Read};

        let mut stream = UnixStream::connect(&self.socket_path)?;
        let request = format!(
            "{} {} HTTP/1.1\r\n\
             Host: localhost\r\n\
             Content-Type: application/json\r\n\
             Content-Length: {}\r\n\
             Connection: close\r\n\r\n\
             {}",
            method, path, body.len(), body
        );
        stream.write_all(request.as_bytes())?;
        
        let mut response = String::new();
        stream.read_to_string(&mut response)?;
        Ok(response)
    }

    #[cfg(not(unix))]
    fn send_request(&self, method: &str, path: &str, body: &str) -> Result<String, io::Error> {
        // Windows Mock Fallback for local compilation & testing
        let mock_resp = "HTTP/1.1 204 No Content\r\n\
                         Server: FirecrackerMock/1.0\r\n\r\n".to_string();
        println!(
            "[Windows Mock UDS] {} {} | Body: {}",
            method, path, body
        );
        Ok(mock_resp)
    }

    /// 가상 머신에 주입할 Linux 커널 이미지와 커널 매개변수를 전송합니다.
    pub fn set_boot_source(&self, kernel_path: &str, boot_args: &str) -> Result<(), String> {
        let body = serde_json::json!({
            "kernel_image_path": kernel_path,
            "boot_args": boot_args
        }).to_string();

        let resp = self.send_request("PUT", "/boot-source", &body)
            .map_err(|e| format!("UDS Connection failed: {}", e))?;

        if resp.contains("204 No Content") || resp.contains("200 OK") {
            Ok(())
        } else {
            Err(format!("Firecracker API Error: {}", resp))
        }
    }

    /// 가상 머신의 루트 파일 시스템(rootfs.ext4) 드라이브를 바인딩합니다.
    pub fn set_root_drive(&self, drive_path: &str) -> Result<(), String> {
        let body = serde_json::json!({
            "drive_id": "rootfs",
            "path_on_host": drive_path,
            "is_root_device": true,
            "is_read_only": false
        }).to_string();

        let resp = self.send_request("PUT", "/drives/rootfs", &body)
            .map_err(|e| format!("UDS Connection failed: {}", e))?;

        if resp.contains("204 No Content") || resp.contains("200 OK") {
            Ok(())
        } else {
            Err(format!("Firecracker API Error: {}", resp))
        }
    }

    /// VM 기동(InstanceStart) 신호를 전송하여 에이전트 샌드박스를 시작합니다.
    pub fn start_instance(&self) -> Result<(), String> {
        let body = serde_json::json!({
            "action_type": "InstanceStart"
        }).to_string();

        let resp = self.send_request("PUT", "/actions", &body)
            .map_err(|e| format!("UDS Connection failed: {}", e))?;

        if resp.contains("204 No Content") || resp.contains("200 OK") {
            Ok(())
        } else {
            Err(format!("Firecracker API Error: {}", resp))
        }
    }
}
