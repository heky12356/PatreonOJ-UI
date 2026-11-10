import React, { useState, useEffect } from 'react';
import { Card, Select, Button, message, Spin, Tag } from 'antd';
import {
  CloudUploadOutlined,
  LoadingOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { submitCode, getSubmissionResult } from '../../api/judge.js';
import { getUserId, isLoggedIn } from '../../api/user.js';
import { useNavigate } from 'react-router-dom';
import styles from './CodeEditor.module.css';

const { Option } = Select;

function CodeEditor({ problem, onSubmit }) {
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('python');
  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const languageConfig = {
    python: {
      name: 'Python',
      template: `# 在这里编写你的解题代码\ndef solution():\n    pass\n`,
      monacoLanguage: 'python',
    },
    cpp: {
      name: 'C++',
      template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n`,
      monacoLanguage: 'cpp',
    },
    java: {
      name: 'Java',
      template: `public class Main {\n    public static void main(String[] args) {\n    }\n}\n`,
      monacoLanguage: 'java',
    },
    go: {
      name: 'Go',
      template: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("hello")\n}\n`,
      monacoLanguage: 'go',
    },
  };

  useEffect(() => {
    if (languageConfig[language]) {
      setCode(languageConfig[language].template);
    }
  }, [language]);

  const checkLoginAndRedirect = () => {
    if (!isLoggedIn()) {
      message.warning('请先登录后再使用代码编辑器');
      const currentPath = window.location.pathname;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return false;
    }
    return true;
  };

  useEffect(() => {
    checkLoginAndRedirect();
  }, [navigate]);

  useEffect(() => {
    if (!submissionId) return;

    let disposed = false;

    const poll = async () => {
      try {
        const result = await getSubmissionResult(submissionId);
        if (disposed) return;

        const status = String(result?.status || '').toLowerCase();
        if (status === 'pending' || status === 'processing' || status === 'judging') {
          setTimeout(poll, 800);
          return;
        }

        setSubmissionResult(result);
        setIsEvaluating(false);
        setOutput(formatSubmissionResult(result));
      } catch {
        if (disposed) return;
        message.error('获取评测结果失败');
        setIsEvaluating(false);
      }
    };

    poll();

    return () => {
      disposed = true;
    };
  }, [submissionId]);

  const handleLanguageChange = (value) => {
    setLanguage(value);
    setOutput('');
  };

  const handleSubmit = async () => {
    if (!checkLoginAndRedirect()) return;

    if (!code.trim()) {
      message.warning('请先编写代码');
      return;
    }

    const userId = getUserId();
    const questionPk = problem?.id;
    const questionId = problem?.question_id;

    if (!questionPk) {
      message.error('题目主键缺失，无法提交');
      return;
    }

    setSubmissionId(null);
    setSubmissionResult(null);
    setOutput('正在评测...');
    setSubmitting(true);
    setIsEvaluating(true);

    try {
      const result = await submitCode({
        code,
        language,
        userId,
        questionPk,
        questionId,
      });

      const sid = result?.submission_id;
      if (!sid) {
        throw new Error('提交成功但未返回 submission_id');
      }

      setSubmissionId(sid);
      message.success('代码已提交，正在评测中');

      if (onSubmit) {
        onSubmit({
          code,
          language,
          submissionId: sid,
          problemId: questionPk,
        });
      }
    } catch (error) {
      message.error(error?.message || '提交失败');
      setOutput(`提交失败: ${error?.message || '未知错误'}`);
      setIsEvaluating(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusMessage = (status) => {
    const map = {
      pending: '等待评测',
      judging: '评测中',
      processing: '处理中',
      accepted: '通过',
      wrong_answer: '答案错误',
      time_limit_exceeded: '超时',
      memory_limit_exceeded: '内存超限',
      runtime_error: '运行时错误',
      compile_error: '编译错误',
      system_error: '系统错误',
      completed: '评测完成',
      error: '评测失败',
    };

    return map[String(status || '').toLowerCase()] || String(status || '未知状态');
  };

  const getStatusColor = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'accepted' || s === 'completed') return 'success';
    if (s === 'pending' || s === 'judging' || s === 'processing') return 'processing';
    if (s.includes('error') || s.includes('wrong')) return 'error';
    return 'default';
  };

  const formatSubmissionResult = (result) => {
    if (!result) return '';

    let text = `评测结果: ${getStatusMessage(result.status)}\n`;

    if (result.pass_rate !== undefined) {
      text += `通过率: ${Math.round(Number(result.pass_rate) * 100)}%\n`;
    }

    if (result.execution_time) {
      text += `执行时间: ${result.execution_time}ms\n`;
    }

    if (result.memory_used) {
      text += `内存使用: ${result.memory_used}KB\n`;
    }

    if (Array.isArray(result.results)) {
      const total = result.results.length;
      const passed = result.results.filter((x) => x?.is_correct).length;
      text += `测试用例: ${passed}/${total} 通过\n`;
    }

    if (result.message) {
      text += `\n${result.message}\n`;
    }

    return text;
  };

  const handleReset = () => {
    setCode(languageConfig[language]?.template || '');
    setOutput('');
    message.info('代码已重置');
  };

  return (
    <div className={styles.codeEditor}>
      <Card
        title="代码编辑器"
        className={styles.editorCard}
        extra={
          <div className={styles.editorControls}>
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
        <div className={styles.editorContainer}>
          <Editor
            height="400px"
            language={languageConfig[language]?.monacoLanguage || 'python'}
            theme="vs-light"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              automaticLayout: true,
              fontFamily: 'Consolas, "Courier New", monospace',
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              folding: true,
              selectOnLineNumbers: true,
              matchBrackets: 'always',
            }}
          />
        </div>

        <div className={styles.editorActions}>
          <Button onClick={handleReset} style={{ marginRight: 8 }}>
            重置代码
          </Button>
          <span className={styles.tips}>提示: 使用 Ctrl+S 保存，Ctrl+Z 撤销</span>
        </div>
      </Card>

      {(isEvaluating || output) && (
        <Card
          title={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>
                {submissionResult ? '评测结果' : isEvaluating ? '评测状态' : '运行结果'}
              </span>
              {submissionResult && (
                <Tag color={getStatusColor(submissionResult.status)}>
                  {getStatusMessage(submissionResult.status)}
                </Tag>
              )}
              {isEvaluating && (
                <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
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
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '0.9em', color: '#888' }}>
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
