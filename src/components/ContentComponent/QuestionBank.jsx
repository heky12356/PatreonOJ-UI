import React from 'react';
import { Link } from 'react-router-dom';
// 导入统一的数据源（和 ProblemList 相同）
import { problems } from '/public/api/problem.js';
import styles from './QuestionBank.module.css';

const QuestionBank = ({ setCurrentKey }) => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>题库列表</h1>

            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="搜索题目..."
                    className={styles.searchInput}
                />
                <select className={styles.filter}>
                    <option value="">全部难度</option>
                    <option value="入门">入门</option>
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
                        <th>通过率</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* 遍历统一数据源中的题目 */}
                    {problems.map((problem) => (
                        <tr key={problem.id} className={styles.row}>
                            <td>{problem.id}</td>
                            <td>
                                {/* 确保路由路径与ProblemList的导航一致 */}
                                <Link to={`/questionBank/${problem.id}`} className={styles.link}>
                                    {problem.title}
                                </Link>
                            </td>
                            <td>
                                <span className={`${styles.difficulty} ${styles[problem.difficulty]}`}>
                                    {problem.difficulty}
                                </span>
                            </td>
                            <td>
                                {problem.tags.map((tag) => (
                                    <span key={tag} className={styles.tag}>{tag}</span>
                                ))}
                            </td>
                            <td>{problem.historicalScores}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuestionBank;