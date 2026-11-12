import React, { useState, useEffect, useRef } from 'react';
import { Card, Select, Button, message, Spin } from 'antd';
import {
  CloudUploadOutlined,
  LoadingOutlined,
  FileSearchOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { submitCode, getSubmissionResult } from '../../api/judge.js';
import { getUserId, isLoggedIn } from '../../api/user.js';
import { useNavigate } from 'react-router-dom';
import styles from './CodeEditor.module.css';
import VerdictTag from '../submissions/VerdictTag.jsx';
import { getVerdict, VERDICTS, shortSubmissionId } from '../../utils/submission.js';
import SelfTestPanel from './SelfTestPanel.jsx';
import './monaco.js';

const { Option } = Select;

const LANGUAGE_CONFIG = {
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

function CodeEditor({ problem, onSubmit }) {
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('python');
  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const selfTestRef = useRef(null);
  const [selfTesting, setSelfTesting] = useState(false);
  const languageDrafts = useRef({});



  useEffect(() => {
    if (LANGUAGE_CONFIG[language]) {
      setCode(languageDrafts.current[language] ?? LANGUAGE_CONFIG[language].template);
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
        window.dispatchEvent(new CustomEvent('submission-evaluated'));
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

  const formatSubmissionResult = (result) => {
    if (!result) return '';

    let text = `评测结果: ${getVerdict(result)} · ${VERDICTS[getVerdict(result)].text}\n`;

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
    languageDrafts.current[language] = LANGUAGE_CONFIG[language]?.template || '';
    setCode(languageDrafts.current[language]);
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
              aria-label="编程语言"
              value={language}
              onChange={handleLanguageChange}
              style={{ width: 120, marginRight: 12 }}
            >
              {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.name}
                </Option>
              ))}
            </Select>

            <Button aria-label="运行自测" icon={<PlayCircleOutlined />} disabled={selfTesting} onClick={() => selfTestRef.current?.run()}>运行自测</Button>

            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={handleSubmit}
              loading={submitting}
              disabled={isEvaluating}
              style={{ marginRight: 8 }}
            >
              正式提交
            </Button>
          </div>
        }
      >
        <div className={styles.editorContainer}>
          <Editor
            height="400px"
            language={LANGUAGE_CONFIG[language]?.monacoLanguage || 'python'}
            theme="vs-light"
            value={code}
            onChange={(value) => { languageDrafts.current[language] = value || ''; setCode(value || ''); }}
            onMount={(editor, monaco) => { editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => selfTestRef.current?.run()); }}
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
          <span className={styles.tips}>Ctrl / Cmd + Enter 运行自测，Ctrl / Cmd + Z 撤销</span>
        </div>
      </Card>

      <SelfTestPanel ref={selfTestRef} problem={problem} code={code} language={language} onBusyChange={setSelfTesting} />

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
                <VerdictTag record={submissionResult} />
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
                提交 ID: {shortSubmissionId(submissionId)}
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
