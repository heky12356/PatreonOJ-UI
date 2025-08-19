/**
 * 代码编辑器组件
 * 基于Monaco Editor，提供多语言代码编辑功能
 * 从ide-part项目的ProblemDetail组件中提取而来
 */
import React, { useState, useEffect } from "react";
import { Card, Select, Button, message, Spin, Tag } from "antd";
import {
  CloudUploadOutlined,
  LoadingOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import Editor from "@monaco-editor/react";
import {
  mockRunCode,
  submitCode,
  getSubmissionResult,
} from "../../api/judge.js";
import { getUserId, isLoggedIn } from "../../api/user.js";
import { useNavigate } from "react-router-dom";
import styles from "./CodeEditor.module.css";

const { Option } = Select;

/**
 * 代码编辑器组件
 * @param {Object} props - 组件属性
 * @param {Object} props.problem - 题目信息
 * @param {Function} props.onSubmit - 提交回调函数
 */
function CodeEditor({ problem, onSubmit }) {
  const navigate = useNavigate(); // 用于页面导航

  // 状态管理
  const [code, setCode] = useState(""); // 当前代码
  const [output, setOutput] = useState(""); // 运行输出
  const [language, setLanguage] = useState("python"); // 当前语言
  const [submitting, setSubmitting] = useState(false); // 提交状态
  const [submissionId, setSubmissionId] = useState(null); // 提交ID
  const [submissionResult, setSubmissionResult] = useState(null); // 提交结果
  const [checkingResult, setCheckingResult] = useState(false); // 检查结果状态
  const [isEvaluating, setIsEvaluating] = useState(false); // 是否正在评测
  const [evaluationStatus, setEvaluationStatus] = useState(""); // 评测状态信息

  // 语言配置
  const languageConfig = {
    python: {
      name: "Python",
      template: `# 解题代码
def solution():
    # 在这里编写你的解决方案
    pass

# 示例：读取输入并输出
# a, b = map(int, input().split())
# print(a + b)
`,
      monacoLanguage: "python",
    },
    cpp: {
      name: "C++",
      template: `#include <iostream>
using namespace std;

int main() {
    // 在这里编写你的解决方案
    
    return 0;
}`,
      monacoLanguage: "cpp",
    },
    java: {
      name: "Java",
      template: `public class Solution {
    public static void main(String[] args) {
        // 在这里编写你的解决方案
        
    }
}`,
      monacoLanguage: "java",
    },
  };

  // 初始化代码模板
  useEffect(() => {
    if (problem && languageConfig[language]) {
      setCode(languageConfig[language].template);
    }
  }, [language, problem]);

  // 检查登录状态，如果未登录则跳转到登录页面
  const checkLoginAndRedirect = () => {
    if (!isLoggedIn()) {
      message.warning("请先登录后再使用代码编辑器");
      const currentPath = window.location.pathname;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return false;
    }
    return true;
  };

  useEffect(() => {
    checkLoginAndRedirect();
  }, [navigate]);

  // 监听 submissionId 变化，自动开始轮询评测结果
  useEffect(() => {
    if (submissionId) {
      checkSubmissionResult(submissionId);
    }
  }, [submissionId]);

  // 监听 submissionResult 变化，自动更新显示内容
  useEffect(() => {
    if (submissionResult) {
      setIsEvaluating(false);
      setEvaluationStatus(getStatusMessage(submissionResult.status));
      setOutput(formatSubmissionResult(submissionResult));
    }
  }, [submissionResult]);

  /**
   * 处理语言切换
   * @param {string} value - 新选择的语言
   */
  const handleLanguageChange = (value) => {
    setLanguage(value);
    setOutput(""); // 清空之前的输出
  };

  /**
   * 提交代码
   */
  const handleSubmit = async () => {
    if (!checkLoginAndRedirect()) return;

    if (!code.trim()) {
      message.warning("请先编写代码");
      return;
    }

    // 重置之前的提交结果
    setSubmissionId(null);
    setSubmissionResult(null);
    setOutput("");

    // 立即设置评测状态并显示"正在评测"
    setSubmitting(true);
    setIsEvaluating(true);
    setEvaluationStatus("正在评测");
    setOutput("正在评测...");

    message.loading("正在提交代码...", 0);

    try {
      // 获取用户ID，从用户API获取
      const userId = getUserId() || "test-user-id";

      // 获取题目编号
      const questionNumber = problem?.question_number;

      // 调用提交API
      const result = await submitCode(code, language, userId, questionNumber);

    //   console.log(result);
      // 保存提交ID，这将触发 useEffect 开始轮询
      setSubmissionId(result.submission_id);

      message.destroy();
      message.success("代码已提交，正在评测中");

      // 调用父组件的提交回调
      if (onSubmit) {
        onSubmit({
          code,
          language,
          submissionId: result.submission_id,
          problemId: questionNumber,
        });
      }
    } catch (error) {
    //   console.error("代码提交失败:", error);
      message.destroy();
      message.error(error.message || "提交失败");
      setOutput("提交失败: " + (error.message || "未知错误"));
      setIsEvaluating(false);
      setEvaluationStatus("");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 检查提交结果
   * @param {string} id - 提交ID
   */
  const checkSubmissionResult = async (id) => {
    if (!id) return;
    // console.log("正在检查提交结果", id);
    setCheckingResult(true);

    try {
      // 实际环境中轮询检查结果
      let result = await getSubmissionResult(id);

    //   console.log("获取到的评测结果", result);

      // 如果状态是processing，继续轮询
      if (result.status === "processing" || result.status === "pending") {
        setTimeout(() => checkSubmissionResult(id), 100);
        return;
      }

      // 分析测试用例结果，确定最终状态
      if (
        result.status === "completed" &&
        result.results &&
        result.results.length > 0
      ) {
        // 检查是否有特殊错误类型
        let hasTimeLimit = false;
        let hasMemoryLimit = false;
        let hasRuntimeError = false;
        let hasWrongAnswer = false;
        let allCorrect = true;

        // 遍历所有测试用例
        for (const testCase of result.results) {
          if (!testCase.is_correct) {
            allCorrect = false;

            // 检查错误类型
            if (testCase.error_type === "time_limit_exceeded") {
              hasTimeLimit = true;
            } else if (testCase.error_type === "memory_limit_exceeded") {
              hasMemoryLimit = true;
            } else if (testCase.error_type === "runtime_error") {
              hasRuntimeError = true;
            } else {
              hasWrongAnswer = true;
            }
          }
        }

        // 根据错误类型设置最终状态
        if (allCorrect) {
          result.status = "accepted";
        } else if (hasTimeLimit) {
          result.status = "time_limit_exceeded";
        } else if (hasMemoryLimit) {
          result.status = "memory_limit_exceeded";
        } else if (hasRuntimeError) {
          result.status = "runtime_error";
        } else if (hasWrongAnswer) {
          result.status = "wrong_answer";
        }

        // 计算通过率
        const totalCases = result.results.length;
        const passedCases = result.results.filter((tc) => tc.is_correct).length;
        result.pass_rate = passedCases / totalCases;
      }

      // 评测完成，显示结果
      setSubmissionResult(result);
      // 移除这里的 setOutput，因为现在由 useEffect 处理
    } catch (error) {
    //   console.error("获取评测结果失败:", error);
      message.error("获取评测结果失败");
    } finally {
      setCheckingResult(false);
    }
  };

  /**
   * 获取状态对应的消息
   * @param {string} status - 评测状态
   * @returns {string} 状态消息
   */
  const getStatusMessage = (status) => {
    const statusMessages = {
      pending: "等待评测",
      judging: "评测中",
      accepted: "通过",
      wrong_answer: "答案错误",
      time_limit_exceeded: "超时",
      memory_limit_exceeded: "内存超限",
      runtime_error: "运行时错误",
      compile_error: "编译错误",
      system_error: "系统错误",
    };

    return statusMessages[status] || "未知状态";
  };

  /**
   * 获取状态对应的颜色
   * @param {string} status - 评测状态
   * @returns {string} 状态颜色
   */
  const getStatusColor = (status) => {
    const statusColors = {
      pending: "default",
      judging: "processing",
      accepted: "success",
      wrong_answer: "error",
      time_limit_exceeded: "warning",
      memory_limit_exceeded: "warning",
      runtime_error: "error",
      compile_error: "error",
      system_error: "error",
    };

    return statusColors[status] || "default";
  };

  /**
   * 格式化提交结果为显示文本
   * @param {Object} result - 提交结果
   * @returns {string} 格式化后的文本
   */
  const formatSubmissionResult = (result) => {
    if (!result) return "";

    let output = `评测结果: ${getStatusMessage(result.status)}\n`;

    // 添加通过率信息
    if (result.pass_rate !== undefined) {
      const passRate = Math.round(result.pass_rate * 100);
      output += `通过率: ${passRate}%\n`;
    }

    if (result.execution_time) {
      output += `执行时间: ${result.execution_time}ms\n`;
    }

    if (result.memory_used) {
      output += `内存使用: ${result.memory_used}KB\n`;
    }

    // 添加测试用例统计
    if (result.results && result.results.length > 0) {
      const totalCases = result.results.length;
      const passedCases = result.results.filter((tc) => tc.is_correct).length;
      output += `测试用例: ${passedCases}/${totalCases} 通过\n`;

      // 添加错误类型统计
      const errorTypes = {
        time_limit_exceeded: 0,
        memory_limit_exceeded: 0,
        runtime_error: 0,
        wrong_answer: 0,
      };

      for (const testCase of result.results) {
        if (!testCase.is_correct) {
          if (
            testCase.error_type &&
            errorTypes[testCase.error_type] !== undefined
          ) {
            errorTypes[testCase.error_type]++;
          } else {
            errorTypes.wrong_answer++;
          }
        }
      }

      // 显示错误类型统计
      const errorMessages = [];
      if (errorTypes.time_limit_exceeded > 0) {
        errorMessages.push(`超时: ${errorTypes.time_limit_exceeded}个用例`);
      }
      if (errorTypes.memory_limit_exceeded > 0) {
        errorMessages.push(
          `内存超限: ${errorTypes.memory_limit_exceeded}个用例`
        );
      }
      if (errorTypes.runtime_error > 0) {
        errorMessages.push(`运行时错误: ${errorTypes.runtime_error}个用例`);
      }
      if (errorTypes.wrong_answer > 0) {
        errorMessages.push(`答案错误: ${errorTypes.wrong_answer}个用例`);
      }

      if (errorMessages.length > 0) {
        output += `\n错误统计:\n${errorMessages.join("\n")}\n`;
      }
    }

    if (result.message && result.message !== getStatusMessage(result.status)) {
      output += `\n${result.message}\n`;
    }

    return output;
  };

  /**
   * 重置代码
   */
  const handleReset = () => {
    setCode(languageConfig[language]?.template || "");
    setOutput("");
    message.info("代码已重置");
  };

  return (
    <div className={styles.codeEditor}>
      <Card
        title="代码编辑器"
        className={styles.editorCard}
        extra={
          <div className={styles.editorControls}>
            {/* 语言选择 */}
            <Select
              value={language}
              onChange={handleLanguageChange}
              style={{ width: 120, marginRight: 12 }}
            >
              {Object.entries(languageConfig).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.name}
                </Option>
              ))}
            </Select>

            {/* 操作按钮 */}
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={handleSubmit}
              loading={submitting}
              style={{ marginRight: 8 }}
            >
              提交
            </Button>
          </div>
        }
      >
        {/* Monaco Editor */}
        <div className={styles.editorContainer}>
          <Editor
            height="400px"
            language={languageConfig[language]?.monacoLanguage || "python"}
            theme="vs-light"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              automaticLayout: true,
              fontFamily: 'Consolas, "Courier New", monospace',
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              lineNumbers: "on",
              folding: true,
              selectOnLineNumbers: true,
              matchBrackets: "always",
              theme: "vs-light",
            }}
          />
        </div>

        {/* 操作按钮区域 */}
        <div className={styles.editorActions}>
          <Button onClick={handleReset} style={{ marginRight: 8 }}>
            重置代码
          </Button>
          <span className={styles.tips}>
            提示: 使用 Ctrl+S 保存，Ctrl+Z 撤销
          </span>
        </div>
      </Card>

      {/* 运行结果或评测结果 */}
      {(isEvaluating || output) && (
        <Card
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{submissionResult ? "评测结果" : isEvaluating ? "评测状态" : "运行结果"}</span>
              {submissionResult && (
                <Tag color={getStatusColor(submissionResult.status)}>
                  {getStatusMessage(submissionResult.status)}
                </Tag>
              )}
              {isEvaluating && (
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />}
                />
              )}
            </div>
          }
          className={styles.outputCard}
          style={{ marginTop: 16 }}
        >
          <pre className={styles.output}>{output}</pre>
          {submissionId && (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "0.9em", color: "#888" }}>
                提交ID: {submissionId}
              </div>
              {submissionResult && (
                <Button
                  type="primary"
                  icon={<FileSearchOutlined />}
                  size="small"
                  onClick={() => navigate(`/submission/${submissionId}`)}
                >
                  查看详情
                </Button>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default CodeEditor;
