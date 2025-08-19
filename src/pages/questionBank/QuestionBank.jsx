import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './QuestionBank.module.css';

const QuestionBank = ({ setCurrentKey }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');

    // 获取题目列表
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/question/');
                if (!response.ok) {
                    throw new Error('获取题目列表失败');
                }
                const data = await response.json();
                setQuestions(data.result || []);
            } catch (err) {
                setError(err.message);
                console.error('获取题目列表失败:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    // 过滤题目
    const filteredQuestions = questions.filter(question => {
        const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            question.question_number.toString().includes(searchTerm);
        const matchesDifficulty = !difficultyFilter || question.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });

    // 解析标签字符串为数组
    const parseTags = (tagsString) => {
        if (!tagsString) return [];
        return tagsString.split(',').map(tag => tag.trim());
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>加载中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>错误: {error}</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>题库列表</h1>

            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="搜索题目..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                    className={styles.filter}
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                    <option value="">全部难度</option>
                    <option value="简单">简单</option>
                    <option value="中等">中等</option>
                    <option value="困难">困难</option>
                </select>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>题号</th>
                        <th>题目名称</th>
                        <th>难度</th>
                        <th>标签</th>
                        <th>来源</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredQuestions.map((question) => (
                        <tr key={question.id} className={styles.row}>
                            <td>{question.question_number}</td>
                            <td>
                                <Link to={`/problem/${question.question_number}`} className={styles.link}>
                                    {question.title}
                                </Link>
                            </td>
                            <td>
                                <span className={`${styles.difficulty} ${styles[question.difficulty]}`}>
                                    {question.difficulty}
                                </span>
                            </td>
                            <td>
                                {parseTags(question.tags).map((tag, index) => (
                                    <span key={index} className={styles.tag}>{tag}</span>
                                ))}
                            </td>
                            <td>{question.source}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {filteredQuestions.length === 0 && !loading && (
                <div className={styles.noData}>暂无题目数据</div>
            )}
        </div>
    );
};

export default QuestionBank;