import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getUserInfo } from '../../api/user.js';
import useMyProblemStatuses from '../../hooks/useMyProblemStatuses.js';
import styles from './index.module.css';

const difficultyClass = value => ({ 简单: styles.easy, 中等: styles.medium, 困难: styles.hard }[value] || '');

export default function PracticeHome({ totalProblems, latestProblems, topics, homeText, announcement, loading, unavailable, campus }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const user = getUserInfo();
  const statuses = useMyProblemStatuses(latestProblems.map(question => question.id));

  return <main className={styles.homeContainer}>
    <header className={styles.pageHeading}>
      <h1>首页</h1>
      <span>题库 {totalProblems ?? '—'} 题 <span className={styles.separator}>/</span> {topics.length || (loading ? '—' : 0)} 个知识点</span>
    </header>
    {unavailable && <p className={styles.unavailable} role="status">部分内容暂时无法加载，可进入题库继续浏览。</p>}
    <div className={styles.layout}>
      <div className={styles.mainColumn}>
        <section className={styles.panel} aria-labelledby="home-notice-heading">
          <div className={styles.panelHeading}><h2 id="home-notice-heading">站内公告</h2></div>
          <div className={styles.markdown}><ReactMarkdown remarkPlugins={[remarkGfm]}>{announcement || (loading ? '正在读取公告…' : '暂无公告。')}</ReactMarkdown></div>
          {homeText && <div className={`${styles.markdown} ${styles.welcomeText}`}><ReactMarkdown remarkPlugins={[remarkGfm]}>{homeText}</ReactMarkdown></div>}
        </section>

        <section className={styles.panel} aria-labelledby="home-problems-heading">
          <div className={styles.panelHeading}><h2 id="home-problems-heading">最新题目</h2><Link to="/problem">全部题目</Link></div>
          <div className={styles.tableScroll}>
            <table className={styles.problemTable}>
              <thead><tr><th className={styles.statusColumn}>状态</th><th className={styles.idColumn}>题号</th><th>题目</th><th className={styles.difficultyColumn}>难度</th></tr></thead>
              <tbody>{latestProblems.map(question => {
                const status = statuses[question.id];
                const statusText = !user ? '登录后查看' : ({ solved: '已通过', attempted: '未通过', unsolved: '未做', unknown: '暂不可用' }[status] || '读取中');
                return <tr key={question.id}>
                  <td><span title={statusText} className={`${styles.problemStatus} ${status === 'solved' ? styles.accepted : ''}`}>{status === 'solved' ? '✓' : status === 'attempted' ? '−' : '—'}</span><span className="visually-hidden">{statusText}</span></td>
                  <td><Link className={styles.problemId} title={question.question_id} to={`/problem/${question.id}`}>{question.question_id}</Link></td>
                  <td><Link className={styles.problemTitle} title={question.title} to={`/problem/${question.id}`}>{question.title}</Link></td>
                  <td><span className={difficultyClass(question.difficulty)}>{question.difficulty || '—'}</span></td>
                </tr>;
              })}</tbody>
            </table>
            {!latestProblems.length && <p className={styles.empty}>{loading ? '正在读取题目…' : '暂无题目。'}</p>}
          </div>
        </section>

        <section className={styles.panel} aria-labelledby="home-topics-heading">
          <div className={styles.panelHeading}><h2 id="home-topics-heading">按知识点练习</h2><Link to="/graph">知识图谱</Link></div>
          <div className={styles.topicLinks}>{topics.slice(0, 12).map(topic => <Link key={topic.name} to={`/graph?tag=${encodeURIComponent(topic.name)}`}><span>{topic.name}</span><small>{topic.question_count}</small></Link>)}</div>
          {!topics.length && <p className={styles.empty}>{loading ? '正在读取知识点…' : '暂无已发布题目的知识点。'}</p>}
        </section>
      </div>

      <aside className={styles.sidebar} aria-label="练习工具">
        <section className={styles.panel} aria-labelledby="home-search-heading">
          <div className={styles.panelHeading}><h2 id="home-search-heading">查找题目</h2></div>
          <form className={styles.searchForm} onSubmit={event => { event.preventDefault(); navigate(`/problem?q=${encodeURIComponent(query.trim())}`); }}>
            <label className="visually-hidden" htmlFor="home-problem-query">搜索题目或知识点</label>
            <input id="home-problem-query" value={query} onChange={event => setQuery(event.target.value)} placeholder="题号、标题或知识点" maxLength={200} />
            <button type="submit">查找</button>
          </form>
        </section>

        <section className={styles.panel} aria-labelledby="home-shortcuts-heading">
          <div className={styles.panelHeading}><h2 id="home-shortcuts-heading">常用入口</h2></div>
          <nav className={styles.shortcutLinks} aria-label="常用入口">
            <Link to="/problem">题库<span>{totalProblems == null ? '—' : `${totalProblems} 题`}</span></Link>
            <Link to="/graph">知识图谱<span>按知识点浏览</span></Link>
            {user ? <><Link to={`/users/${user.uuid}`}>我的主页<span>{user.username}</span></Link><Link to="/profile/submissions">我的提交<span>查看评测记录</span></Link></> : <Link to="/login">登录<span>查看做题记录</span></Link>}
          </nav>
        </section>
        {campus}
        <section className={`${styles.panel} ${styles.help}`}><h2>使用说明</h2><p>自测使用样例或自定义输入。完成代码后，请正式提交获取评测结果。</p><Link to="/graph">知识图谱按标签查看关联题目</Link></section>
      </aside>
    </div>
    <footer className={styles.footer}>程序设计实验平台</footer>
  </main>;
}
