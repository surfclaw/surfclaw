#![allow(dead_code)]

use std::collections::{VecDeque, HashMap};
use std::sync::{Arc, Mutex, Condvar};
use std::time::{Duration, Instant};

#[derive(Debug, Clone, PartialEq)]
pub enum TaskStatus {
    Pending,
    Running,
    Suspended,
    Completed,
    Failed,
}

#[derive(Debug, Clone)]
pub struct AgentTask {
    pub id: String,
    pub agent_name: String,
    pub task_input: String,
    pub tools: Vec<String>,
    pub status: TaskStatus,
    pub vram_required: f32,
    pub steps_completed: usize,
    pub response: Option<String>,
    pub execution_time: f64,
}

pub struct Scheduler {
    vram_limit: f32,
    current_vram: Arc<Mutex<f32>>,
    queue: Arc<Mutex<VecDeque<AgentTask>>>,
    condvar: Arc<Condvar>,
    // CMU Self-tuning 사상을 반영한 에이전트별 실행 시간 이력 DB
    history: Arc<Mutex<HashMap<String, Vec<f64>>>>,
}

impl Scheduler {
    pub fn new(vram_limit: f32) -> Self {
        Self {
            vram_limit,
            current_vram: Arc::new(Mutex::new(0.0)),
            queue: Arc::new(Mutex::new(VecDeque::new())),
            condvar: Arc::new(Condvar::new()),
            history: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn submit(&self, mut task: AgentTask) {
        let mut q = self.queue.lock().unwrap();
        task.status = TaskStatus::Pending;
        q.push_back(task);
        self.condvar.notify_all();
    }

    /// FIFO 스케줄링 방식으로 대기 중인 태스크를 처리할 수 있는지 할당을 검증하고 획득합니다.
    pub fn dispatch_fifo(&self, max_wait: Duration) -> Option<AgentTask> {
        let mut q = self.queue.lock().unwrap();
        let start = Instant::now();

        loop {
            if let Some(pos) = q.iter().position(|t| t.status == TaskStatus::Pending || t.status == TaskStatus::Suspended) {
                let task = &q[pos];
                let mut vram = self.current_vram.lock().unwrap();
                if *vram + task.vram_required <= self.vram_limit {
                    *vram += task.vram_required;
                    let mut dispatched = q.remove(pos).unwrap();
                    dispatched.status = TaskStatus::Running;
                    return Some(dispatched);
                }
            }

            let elapsed = start.elapsed();
            if elapsed >= max_wait {
                return None;
            }

            let timeout = max_wait - elapsed;
            let result = self.condvar.wait_timeout(q, timeout).unwrap();
            q = result.0;
            if result.1.timed_out() {
                return None;
            }
        }
    }

    /// 연산 완료 후 리소스를 반납하고 태스크 상태 및 실행 지연 시간 이력을 기록합니다.
    pub fn release(&self, task_id: &str, agent_name: &str, _response: String, success: bool, exec_time: f64, vram_used: f32) {
        // VRAM 반납
        let mut vram = self.current_vram.lock().unwrap();
        if *vram >= vram_used {
            *vram -= vram_used;
        } else {
            *vram = 0.0;
        }
        self.condvar.notify_all();

        // CMU Self-tuning: 에이전트별 실행 시간(exec_time) 이력 누적
        let mut hist = self.history.lock().unwrap();
        let entry = hist.entry(agent_name.to_string()).or_default();
        entry.push(exec_time);
        if entry.len() > 10 {
            entry.remove(0); // 최근 10개의 지연 기록만 유지 (메모리 관리 및 이동평균 최신화)
        }

        println!(
            "[Rust Core] Task {} completed (success: {}). Exec time: {:.4}s | Avg historical time: {:.4}s",
            task_id, success, exec_time, entry.iter().sum::<f64>() / entry.len() as f64
        );
    }

    /// 특정 에이전트의 역사적 평균 실행 시간 조회
    pub fn get_average_execution_time(&self, agent_name: &str) -> f64 {
        let hist = self.history.lock().unwrap();
        if let Some(runtimes) = hist.get(agent_name) {
            if runtimes.is_empty() {
                return 0.0;
            }
            return runtimes.iter().sum::<f64>() / runtimes.len() as f64;
        }
        0.0
    }

    pub fn get_allocated_vram(&self) -> f32 {
        *self.current_vram.lock().unwrap()
    }
}
