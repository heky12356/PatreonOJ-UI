// QuestionBank.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import problems from '../../data/quesionBank.json';
import styles from './QuestionBank.module.css'; // 引入CSS模块

const QuestionBank = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>题库列表</h1>

            {/* 搜索框和筛选器 */}
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

            {/* 题目列表表格 */}
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
                    {problems.map((problem) => (
                        <tr key={problem.id} className={styles.row}>
                            <td>{problem.id}</td>
                            <td>
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
                            <td>--</td> {/* 待添加通过率数据，加一个数据处理的部分 */}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuestionBank;