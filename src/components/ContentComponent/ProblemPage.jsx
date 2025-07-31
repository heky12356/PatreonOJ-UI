import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Breadcrumb, theme } from 'antd';
import { Link } from 'react-router-dom';
import HeaderNav from '../HeaderNav/HeaderNav';
import problems from '../../data/quesionBank.json';
import '../HeaderNav/HeaderNav.css';
// 引入 CSS Modules 文件，styles 里的类名是经过处理的局部类名
import styles from './ProblemPage.module.css';

const { Content, Footer } = Layout;

const ProblemPage = () => {
    const { id } = useParams();
    const problem = problems.find(p => p.id === id);
    if (!problem) return <div>题目不存在</div>;

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const breadcrumbItems = [
        {
            title: <Link to="/">主页</Link>
        },
        {
            title: <Link to="/question-bank">题库</Link>
        },
        {
            title: problem.title
        },
    ];

    return (
        <Layout className={styles.layout}>
            <HeaderNav />
            <Content className={styles.content}>
                <Breadcrumb
                    className={styles.breadcrumb}
                    items={breadcrumbItems}
                />
                <div
                    className={styles.container}
                    style={{
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <div className={styles.inner}>
                        <div className={styles.header}>
                            <h2>{problem.id} {problem.title}</h2>
                            <div className={styles.difficulty}>
                                <span>难度：{problem.difficulty}</span>
                            </div>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <button className={styles.btnStyle}>提交答案</button>
                            <button className={styles.btnStyle}>加入题单</button>
                            <button className={styles.btnStyle}>复制题目</button>
                        </div>
                        <div className={styles.descriptionSection}>
                            <h3>题目描述</h3>
                            <div dangerouslySetInnerHTML={{ __html: problem.description }} />
                        </div>
                        <div className={styles.noteSection}>
                            <h3>注意事项</h3>
                            <p>1. C/C++ 的 main 函数必须是 int 类型，而且最后要 return 0；</p>
                            <p>2. 有负数哦！</p>
                        </div>
                        <div className={styles.sampleSection}>
                            <h3>输入输出样例</h3>
                            <div className={styles.sampleContainer}>
                                <div>
                                    <strong>input输入</strong>
                                    <pre className={styles.codeStyle}>{problem.input}</pre>
                                </div>
                                <div>
                                    <strong>output输出</strong>
                                    <pre className={styles.codeStyle}>{problem.output}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                Ant Design ©{new Date().getFullYear()} Created by Ant UED
            </Footer>
        </Layout>
    );
};

export default ProblemPage;