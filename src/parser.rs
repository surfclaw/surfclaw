use regex::Regex;
use serde_json::Value;

pub struct SapParser;

impl SapParser {
    /// LLM 답변 텍스트 내에서 JSON 블록을 추출하고 느슨하게(Sloppy) 보정하여 파싱합니다.
    pub fn parse_json(input: &str) -> Result<Value, String> {
        // 1. { } 형태의 JSON 패턴 추출
        let re_json = Regex::new(r"(?s)\{.*\}").map_err(|e| e.to_string())?;
        let mat = re_json.find(input).ok_or_else(|| "No JSON block found in LLM output text".to_string())?;
        let mut raw_json = mat.as_str().to_string();

        // 2. 임의의 탭, 공백, 개행 문자를 동반한 trailing comma 보정 (예: , \n\t } -> \n\t } 또는 , ] -> ])
        let re_comma_brace = Regex::new(r",\s*([\}])").map_err(|e| e.to_string())?;
        raw_json = re_comma_brace.replace_all(&raw_json, "$1").to_string();

        let re_comma_bracket = Regex::new(r",\s*(\])").map_err(|e| e.to_string())?;
        raw_json = re_comma_bracket.replace_all(&raw_json, "$1").to_string();

        let val: Value = serde_json::from_str(&raw_json)
            .map_err(|e| format!("SAP JSON Parse failed: {}", e))?;
        Ok(val)
    }

    /// BAML의 @assert 개념을 모사하여 특정 필드의 존재성 및 타입 무결성을 검증합니다.
    pub fn assert_field(json: &Value, path: &str, expected_type: &str) -> Result<(), String> {
        let mut current = json;
        
        // 닷(.) 표기법으로 하위 객체 탐색 (예: "education.university")
        for key in path.split('.') {
            current = current.get(key)
                .ok_or_else(|| format!("BAML Assert failed: Field '{}' is missing", path))?;
        }

        match expected_type {
            "string" => {
                if !current.is_string() {
                    return Err(format!("BAML Assert failed: Field '{}' is not a string", path));
                }
            }
            "number" => {
                if !current.is_number() {
                    return Err(format!("BAML Assert failed: Field '{}' is not a number", path));
                }
            }
            "boolean" => {
                if !current.is_boolean() {
                    return Err(format!("BAML Assert failed: Field '{}' is not a boolean", path));
                }
            }
            "array" => {
                if !current.is_array() {
                    return Err(format!("BAML Assert failed: Field '{}' is not an array", path));
                }
            }
            _ => return Err(format!("BAML Assert failed: Unsupported check type '{}'", expected_type)),
        }

        Ok(())
    }
}
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sap_parsing() {
        let llm_resp = "Here is the result:\n```json\n{\n  \"name\": \"Alice\",\n  \"success\": true,\n}\n```";
        let parsed = SapParser::parse_json(llm_resp).unwrap();
        assert_eq!(parsed["name"], "Alice");
        assert_eq!(parsed["success"], true);
        assert!(SapParser::assert_field(&parsed, "name", "string").is_ok());
        assert!(SapParser::assert_field(&parsed, "success", "boolean").is_ok());
    }
}
