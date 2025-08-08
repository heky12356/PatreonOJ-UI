/**
 * 代码编辑器组件
 * 基于Monaco Editor，提供多语言代码编辑功能
 * 从ide-part项目的ProblemDetail组件中提取而来
 */
import React, { useState, useEffect } from 'react';
import { Card, Select, Button, message, Modal } from 'antd';
import { PlayCircleOutlined, CloudUploadOutlined, HistoryOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { runCode, mockRunCode } from '../../api/judge.js';
import styles from './CodeEditor.module.css';

const { Option } = Select;

/**
 * 代码编辑器组件
 * @param {Object} props - 组件属性
 * @param {Object} props.problem - 题目信息
 * @param {Function} props.onSubmit - 提交回调函数
 */
function CodeEditor({ problem, onSubmit }) {
    // 状态管理
    const [code, setCode] = useState('');                    // 当前代码
    const [output, setOutput] = useState('');               // 运行输出
    const [language, setLanguage] = useState('python');     // 当前语言
    const [submitting, setSubmitting] = useState(false);    // 提交状态
    const [running, setRunning] = useState(false);          // 运行状态
    const [isModalVisible, setIsModalVisible] = useState(false); // 测评记录模态框

    // 语言配置
    const languageConfig = {
        python: {
            name: 'Python',
            template: `# 解题代码
def solution():
    # 在这里编写你的解决方案
    pass

# 示例：读取输入并输出
# a, b = map(int, input().split())
# print(a + b)
`,
            monacoLanguage: 'python'
        },
        cpp: {
            name: 'C++',
            template: `#include <iostream>
using namespace std;

int main() {
    // 在这里编写你的解决方案
    
    return 0;
}`,
            monacoLanguage: 'cpp'
        },
        java: {
            name: 'Java',
            template: `public class Solution {
    public static void main(String[] args) {
        // 在这里编写你的解决方案
        
    }
}`,
            monacoLanguage: 'java'
        }
    };

    // 初始化代码模板
    useEffect(() => {
        if (problem && languageConfig[language]) {
            setCode(languageConfig[language].template);
        }
    }, [language, problem]);

    /**
     * 处理语言切换
     * @param {string} value - 新选择的语言
     */
    const handleLanguageChange = (value) => {
        setLanguage(value);
        setOutput(''); // 清空之前的输出
    };

    /**
     * 运行代码
     */
    const handleRun = async () => {
        if (!code.trim()) {
            message.warning('请先编写代码');
            return;
        }

        setRunning(true);
        message.loading('正在运行代码...', 0);

        try {
            // 使用题目的样例输入作为测试数据
            const testInput = problem?.sample_input || '';
            
            // 这里可以选择使用真实API或模拟API
            const result = await mockRunCode(code, language, testInput);
            
            setOutput(result);
            message.destroy();
            message.success('运行成功');
        } catch (error) {
            console.error('代码运行失败:', error);
            setOutput('运行失败: ' + error.message);
            message.destroy();
            message.error('运行失败');
        } finally {
            setRunning(false);
        }
    };

    /**
     * 提交代码
     */
    const handleSubmit = async () => {
        if (!code.trim()) {
            message.warning('请先编写代码');
            return;
        }

        setSubmitting(true);
        message.loading('正在提交代码...', 0);

        try {
            // 这里可以调用实际的提交API
            const result = await mockRunCode(code, language, problem?.sample_input || '');
            
            setOutput(result);
            message.destroy();
            message.success('提交成功');
            
            // 调用父组件的提交回调
            if (onSubmit) {
                onSubmit({
                    code,
                    language,
                    result,
                    problemId: problem?.id
                });
            }
        } catch (error) {
            console.error('代码提交失败:', error);
            message.destroy();
            message.error('提交失败');
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * 重置代码
     */
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
                            icon={<PlayCircleOutlined />}
                            onClick={handleRun}
                            loading={running}
                            style={{ marginRight: 8 }}
                        >
                            运行
                        </Button>
                        
                        <Button
                            type="primary"
                            icon={<CloudUploadOutlined />}
                            onClick={handleSubmit}
                            loading={submitting}
                            style={{ marginRight: 8 }}
                        >
                            提交
                        </Button>

                        <Button
                            icon={<HistoryOutlined />}
                            onClick={() => setIsModalVisible(true)}
                        >
                            记录
                        </Button>
                    </div>
                }
            >
                {/* Monaco Editor */}
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
                            theme: 'vs-light'
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

            {/* 运行结果 */}
            {output && (
                <Card
                    title="运行结果"
                    className={styles.outputCard}
                    style={{ marginTop: 16 }}
                >
                    <pre className={styles.output}>{output}</pre>
                </Card>
            )}

            {/* 测评记录模态框 */}
            <Modal
                title="测评记录"
                open={isModalVisible}
                onOk={() => setIsModalVisible(false)}
                onCancel={() => setIsModalVisible(false)}
                width={800}
            >
                <div className={styles.recordContent}>
                    <p>这里将显示历史提交记录</p>
                    <p>功能开发中...</p>
                </div>
            </Modal>
        </div>
    );
}

export default CodeEditor;