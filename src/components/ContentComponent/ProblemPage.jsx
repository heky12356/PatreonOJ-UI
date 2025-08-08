import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Tag, Tabs, message } from 'antd';
import { ArrowLeftOutlined, CodeOutlined, FileTextOutlined } from '@ant-design/icons';
import CodeEditor from './CodeEditor';
import styles from "./ProblemPage.module.css";

function ProblemPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('description'); // 新增：当前激活的标签页

    // 获取题目详情
    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/question/${id}`);
                if (!response.ok) {
                    throw new Error('获取题目详情失败');
                }
                const data = await response.json();
                setQuestion(data.data);

                console.log(data);

            } catch (err) {
                setError(err.message);
                console.error('获取题目详情失败:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchQuestion();
        }
    }, [id]);

    const handleAddToList = () => {
        if (!question) return;
        const existing = JSON.parse(localStorage.getItem('myProblemList') || '[]');
        if (!existing.includes(question.id)) {
            existing.push(question.id);
            localStorage.setItem('myProblemList', JSON.stringify(existing));
            alert('题目已加入题单！');
        } else {
            alert('该题已在题单中！');
        }
    };

    const handleCopyProblem = async () => {
        if (!question) return;
        const textToCopy = `${question.question_number} ${question.title}\n\n${question.content}`;
        try {
            await navigator.clipboard.writeText(textToCopy);
            alert('题目信息已复制到剪贴板！');
        } catch (err) {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制');
        }
    };

    /**
     * 处理代码提交
     * @param {Object} submitData - 提交的数据
     */
    const handleCodeSubmit = (submitData) => {
        console.log('代码提交:', submitData);
        message.success('代码提交成功！');
        // 这里可以添加实际的提交逻辑
    };

    /**
     * 切换到IDE标签页
     */
    const switchToIdeTab = () => {
        setActiveTab('ide');
        message.info('已切换到代码编辑器');
    };

    const goToIde = () => {
        const ideProjectBaseUrl = 'http://localhost:5174';
        const ideDetailPath = `/problem/${question.id}`;
        window.location.href = `${ideProjectBaseUrl}${ideDetailPath}`;
    };

    // 退出到题库页面
    const handleExit = () => {
        navigate('/questionBank');
    };

    // 解析标签字符串为数组
    const parseTags = (tagsString) => {
        if (!tagsString) return [];
        return tagsString.split(',').map(tag => tag.trim());
    };

    if (loading) {
        return (
            <div className={styles.content}>
                <div className={styles.loading}>加载题目中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.content}>
                <div className={styles.error}>错误: {error}</div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className={styles.content}>
                <div className={styles.error}>题目不存在</div>
            </div>
        );
    }

    return (
        <div className={styles.content}>
            <div className={styles['problem-header']}>
                <h1>{question.question_number} {question.title}</h1>
                <div className={styles['problem-meta']}>
                    <div className={styles['problem-info']}>
                        <p>难度: {question.difficulty}</p>
                        <p>来源: {question.source}</p>
                        <p>题目编号: {question.question_number}</p>
                        <p>时间限制: {question.time_limit}ms</p>
                        <p>内存限制: {question.memory_limit}MB</p>
                    </div>
                    <div className={styles['problem-actions']}>
                        <button
                            className={styles['custom-button']}
                            onClick={handleExit}
                            style={{ backgroundColor: '#f56c6c', color: 'white' }}
                        >
                            <ArrowLeftOutlined /> 退出到题库
                        </button>

                        <button className={styles['custom-button']} onClick={handleAddToList}>加入题单</button>
                        <button className={styles['custom-button']} onClick={handleCopyProblem}>复制题目</button>
                        <button className={styles['custom-button']}>查看题解</button>
                        <button className={styles['custom-button']}>提交记录</button>
                        <button
                            type="primary"
                            className={styles['ide-button']}
                            onClick={switchToIdeTab}
                        >
                            <CodeOutlined /> 开始编程
                        </button>
                    </div>
                </div>
            </div>

            {/* 使用Tabs组件实现题目描述和代码编辑器的切换 */}
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className={styles['problem-tabs']}
                items={[
                    {
                        key: 'description',
                        label: (
                            <span>
                                <FileTextOutlined />
                                题目描述
                            </span>
                        ),
                        children: (
                            <div className={styles['tab-content']}>
                                <div className={styles['problem-content']}>
                                    <div className={styles['problem-description']}>
                                        <h2>题目描述</h2>
                                        <p>{question.content}</p>
                                    </div>
                                    
                                    {question.input_format && (
                                        <div className={styles['problem-input-format']}>
                                            <h3>输入格式</h3>
                                            <pre>{question.input_format}</pre>
                                        </div>
                                    )}
                                    
                                    {question.output_format && (
                                        <div className={styles['problem-output-format']}>
                                            <h3>输出格式</h3>
                                            <pre>{question.output_format}</pre>
                                        </div>
                                    )}
                                    
                                    <div className={styles['problem-input-output']}>
                                        <div className={styles['input-section']}>
                                            <h3>样例输入</h3>
                                            <pre>{question.sample_input}</pre>
                                        </div>
                                        <div className={styles['output-section']}>
                                            <h3>样例输出</h3>
                                            <pre>{question.sample_output}</pre>
                                        </div>
                                    </div>
                                    
                                    {question.sample_explanation && (
                                        <div className={styles['problem-explanation']}>
                                            <h3>样例解释</h3>
                                            <p>{question.sample_explanation}</p>
                                        </div>
                                    )}
                                    
                                    {question.data_range && (
                                        <div className={styles['problem-data-range']}>
                                            <h3>数据范围</h3>
                                            <pre>{question.data_range}</pre>
                                        </div>
                                    )}
                                    
                                    {question.hint && (
                                        <div className={styles['problem-hint']}>
                                            <h3>提示</h3>
                                            <p>{question.hint}</p>
                                        </div>
                                    )}
                                </div>
                                <div className={styles['problem-sidebar']}>
                                    <div className={styles['problem-tags']}>
                                        <h3>标签</h3>
                                        {parseTags(question.tags).map((tag, index) => (
                                            <Tag key={index}>{tag}</Tag>
                                        ))}
                                    </div>
                                    <div className={styles['problem-discussions']}>
                                        <h3>讨论</h3>
                                        <p>暂无讨论</p>
                                    </div>
                                    <div className={styles['problem-recommendations']}>
                                        <h3>推荐题目</h3>
                                        <div>暂无推荐题目</div>
                                    </div>
                                </div>
                            </div>
                        )
                    },
                    {
                        key: 'ide',
                        label: (
                            <span>
                                <CodeOutlined />
                                代码编辑器
                            </span>
                        ),
                        children: (
                            <div className={styles['tab-content']}>
                                {/* 集成的代码编辑器组件 */}
                                <CodeEditor 
                                    problem={question} 
                                    onSubmit={handleCodeSubmit}
                                />
                            </div>
                        )
                    }
                ]}
            />
        </div>
    );
}

export default ProblemPage;