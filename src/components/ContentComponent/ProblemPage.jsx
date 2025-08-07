import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { problems } from '/public/api/problem.js';
import styles from "./ProblemPage.module.css";

function ProblemPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const item = problems.find(problem => problem.id === id) || problems[0];

    const handleAddToList = () => {
        const existing = JSON.parse(localStorage.getItem('myProblemList') || '[]');
        if (!existing.includes(item.id)) {
            existing.push(item.id);
            localStorage.setItem('myProblemList', JSON.stringify(existing));
            alert('题目已加入题单！');
        } else {
            alert('该题已在题单中！');
        }
    };

    if (!item) return <div>加载题目中...</div>;

    const handleCopyProblem = async () => {
        const textToCopy = `${item.id} ${item.title}\n\n${item.description}`;
        try {
            await navigator.clipboard.writeText(textToCopy);
            alert('题目信息已复制到剪贴板！');
        } catch (err) {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制');
        }
    };

    const goToIde = () => {
        const ideProjectBaseUrl = 'http://localhost:5174';
        const ideDetailPath = `/problem/${item.id}`;
        window.location.href = `${ideProjectBaseUrl}${ideDetailPath}`;
    };

    // 退出到题库页面
    const handleExit = () => {
        navigate('/questionBank');
    };

    return (
        <div className={styles.content}>
            <div className={styles['problem-header']}>
                <h1>{item.id} {item.title}</h1>
                <div className={styles['problem-meta']}>
                    <div className={styles['problem-info']}>
                        <p>难度: {item.difficulty}</p>
                        <p>历史分数: {item.historicalScores}</p>
                        <p>题目编号: {item.problemNumber}</p>
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
                            onClick={goToIde}
                        >
                            进入 IDE 解题
                        </button>
                    </div>
                </div>
            </div>
            <div className={styles['problem-content']}>
                <div className={styles['problem-description']}>
                    <h2>题目描述</h2>
                    <p>{item.description}</p>
                </div>
                <div className={styles['problem-notes']}>
                    <h2>注意事项</h2>
                    <ul>
                        {item.notes?.map((note, index) => (
                            <li key={index}>{note}</li>
                        ))}
                    </ul>
                </div>
                <div className={styles['problem-input-output']}>
                    <div className={styles['input-section']}>
                        <h3>input输入</h3>
                        <pre>{item.inputs[0].input}</pre>
                    </div>
                    <div className={styles['output-section']}>
                        <h3>output输出</h3>
                        <pre>{item.inputs[0].output}</pre>
                    </div>
                </div>
            </div>
            <div className={styles['problem-sidebar']}>
                <div className={styles['problem-tags']}>
                    <h3>标签</h3>
                    {item.tags?.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                    ))}
                </div>
                <div className={styles['problem-discussions']}>
                    <h3>讨论</h3>
                    <p>{item.discussions}</p>
                </div>
                <div className={styles['problem-recommendations']}>
                    <h3>推荐题目</h3>
                    {item.recommendedProblems ? (
                        <ul>
                            {item.recommendedProblems.map(problem => (
                                <li key={problem}>
                                    <Link to={`/questionBank/${problem}`}>{problem}</Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div>暂无推荐题目</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProblemPage;