#![allow(unsafe_op_in_unsafe_fn)]

use pyo3::prelude::*;
use pyo3::exceptions::PyRuntimeError;
use std::time::Duration;

mod scheduler;
mod firecracker;
mod mcp;
mod parser;
mod bitsec_bridge;

use scheduler::{Scheduler, AgentTask, TaskStatus};
use firecracker::FirecrackerClient;
use mcp::McpClient;
use parser::SapParser;
use bitsec_bridge::BitsecBridge;

#[pyclass]
#[derive(Clone)]
pub struct PyTask {
    #[pyo3(get, set)]
    pub id: String,
    #[pyo3(get, set)]
    pub agent_name: String,
    #[pyo3(get, set)]
    pub task_input: String,
    #[pyo3(get, set)]
    pub tools: Vec<String>,
    #[pyo3(get, set)]
    pub vram_required: f32,
    #[pyo3(get, set)]
    pub status: String,
}

#[pyclass]
pub struct PyScheduler {
    inner: Scheduler,
}

#[pymethods]
impl PyScheduler {
    #[new]
    pub fn new(vram_limit: f32) -> Self {
        Self {
            inner: Scheduler::new(vram_limit),
        }
    }

    pub fn submit(&self, id: String, agent_name: String, task_input: String, tools: Vec<String>, vram_required: f32) {
        let task = AgentTask {
            id,
            agent_name,
            task_input,
            tools,
            status: TaskStatus::Pending,
            vram_required,
            steps_completed: 0,
            response: None,
            execution_time: 0.0,
        };
        self.inner.submit(task);
    }

    pub fn dispatch_fifo(&self, timeout_ms: u64) -> Option<PyTask> {
        let task = self.inner.dispatch_fifo(Duration::from_millis(timeout_ms))?;
        let status_str = match task.status {
            TaskStatus::Pending => "Pending",
            TaskStatus::Running => "Running",
            TaskStatus::Suspended => "Suspended",
            TaskStatus::Completed => "Completed",
            TaskStatus::Failed => "Failed",
        };
        Some(PyTask {
            id: task.id,
            agent_name: task.agent_name,
            task_input: task.task_input,
            tools: task.tools,
            vram_required: task.vram_required,
            status: status_str.to_string(),
        })
    }

    pub fn release(&self, task_id: String, agent_name: String, response: String, success: bool, exec_time: f64, vram_used: f32) {
        self.inner.release(&task_id, &agent_name, response, success, exec_time, vram_used);
    }

    pub fn get_average_execution_time(&self, agent_name: String) -> f64 {
        self.inner.get_average_execution_time(&agent_name)
    }

    pub fn get_allocated_vram(&self) -> f32 {
        self.inner.get_allocated_vram()
    }
}

#[pyclass]
pub struct PyFirecrackerClient {
    inner: FirecrackerClient,
}

#[pymethods]
impl PyFirecrackerClient {
    #[new]
    pub fn new(socket_path: &str) -> Self {
        Self {
            inner: FirecrackerClient::new(socket_path),
        }
    }

    pub fn set_boot_source(&self, kernel_path: &str, boot_args: &str) -> PyResult<()> {
        self.inner.set_boot_source(kernel_path, boot_args)
            .map_err(PyRuntimeError::new_err)
    }

    pub fn set_root_drive(&self, drive_path: &str) -> PyResult<()> {
        self.inner.set_root_drive(drive_path)
            .map_err(PyRuntimeError::new_err)
    }

    pub fn start_instance(&self) -> PyResult<()> {
        self.inner.start_instance()
            .map_err(PyRuntimeError::new_err)
    }
}

#[pyclass]
pub struct PyMcpClient {
    inner: McpClient,
}

#[pymethods]
impl PyMcpClient {
    #[new]
    pub fn new() -> Self {
        Self {
            inner: McpClient::new(),
        }
    }

    pub fn start(&mut self, command: &str, args: Vec<String>) -> PyResult<()> {
        self.inner.start(command, args)
            .map_err(PyRuntimeError::new_err)
    }

    pub fn initialize(&mut self) -> PyResult<()> {
        self.inner.initialize()
            .map_err(PyRuntimeError::new_err)
    }

    pub fn list_tools(&mut self) -> PyResult<Vec<String>> {
        self.inner.list_tools()
            .map_err(PyRuntimeError::new_err)
    }

    pub fn call_tool(&mut self, name: &str, arguments_json_str: &str) -> PyResult<String> {
        let args_val: serde_json::Value = serde_json::from_str(arguments_json_str)
            .map_err(|e| PyRuntimeError::new_err(format!("Invalid arguments JSON: {}", e)))?;
        
        self.inner.call_tool(name, args_val)
            .map_err(PyRuntimeError::new_err)
    }
}

impl Default for PyMcpClient {
    fn default() -> Self {
        Self::new()
    }
}

#[pyclass]
pub struct PySapParser;

#[pymethods]
impl PySapParser {
    #[staticmethod]
    pub fn parse_json(text: &str) -> PyResult<String> {
        let val = SapParser::parse_json(text)
            .map_err(PyRuntimeError::new_err)?;
        Ok(val.to_string())
    }

    #[staticmethod]
    pub fn assert_field(json_str: &str, path: &str, expected_type: &str) -> PyResult<()> {
        let val: serde_json::Value = serde_json::from_str(json_str)
            .map_err(|e| PyRuntimeError::new_err(format!("Invalid JSON: {}", e)))?;
        SapParser::assert_field(&val, path, expected_type)
            .map_err(PyRuntimeError::new_err)
    }
}

#[pyclass]
pub struct PyBitsecBridge {
    inner: BitsecBridge,
}

#[pymethods]
impl PyBitsecBridge {
    #[new]
    pub fn new(endpoint: &str, hotkey: &str) -> Self {
        Self {
            inner: BitsecBridge::new(endpoint, hotkey),
        }
    }

    pub fn report_audit_telemetry(
        &self,
        code_size_bytes: usize,
        vulns_count: usize,
        max_severity: &str,
        exec_time_ms: u64,
    ) -> PyResult<String> {
        self.inner.report_audit_telemetry(code_size_bytes, vulns_count, max_severity, exec_time_ms)
            .map_err(PyRuntimeError::new_err)
    }
}

#[pymodule]
fn surfclaw_core(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<PyTask>()?;
    m.add_class::<PyScheduler>()?;
    m.add_class::<PyFirecrackerClient>()?;
    m.add_class::<PyMcpClient>()?;
    m.add_class::<PySapParser>()?;
    m.add_class::<PyBitsecBridge>()?;
    Ok(())
}
