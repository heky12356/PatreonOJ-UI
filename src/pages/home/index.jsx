import { Container, Row, Col } from 'react-bootstrap';
import styles from './index.module.css';
import { useState, useEffect } from 'react';
import { getProblem, getNewProblems } from '../../api/getproblem';
import { getMotto } from '../../api/getMotto';
import { FaSearch } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAnnouncement, getHomeShowText } from '../../api/homeShowText';

export default function Home() {
  const [totalProblemsNum, setTotalProblemsNum] = useState(0); // 总题目数
  const [motto, setMotto] = useState({}); // 一言
  const [newProblems, setNewProblems] = useState([]); // 最新题目
  const [searchTerm, setSearchTerm] = useState(''); // 搜索题目
  const [homeShowText, setHomeShowText] = useState(''); // OJ首页展示文本
  const [announcement, setAnnouncement] = useState(''); // 公告

  // 获取总题目数和最新题目
  const fetchProblemsNum = async () => {
    let res = await getProblem();
    setTotalProblemsNum(res.totalCnt);
    res = await getNewProblems();
    setNewProblems(res.result);
  };

  // 获取一言
  const fetchMotto = async () => {
    const res = await getMotto();
    //   console.log(res);
    setMotto(res);
  };

  // 获取OJ首页文本
  const fetchHomeShowText = async () => {
    const res = await getHomeShowText();
    // console.log(res);
    setHomeShowText(res);
  };

  // 获取公告
  const fetchAnnouncement = async () => {
    const res = await getAnnouncement();
    setAnnouncement(res || '');
  };

  useEffect(() => {
    fetchProblemsNum();
    fetchMotto();
    fetchHomeShowText();
    fetchAnnouncement();
  }, []);

  const searchProblem = () => {
    window.location.href = `/problem?q=${searchTerm}`;
  };

  return (
    <Container>
      <Row>
        <Col lg={9}>
          <div className={styles.Left}>
            {/* <h1 className={styles.title}>欢迎来到 TGU-OJ</h1>
            <p className={styles.subtitle}>在线编程练习平台</p>
            <p className={styles.description}>
              提升编程技能，挑战算法题目，与同学一起成长
            </p> */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {homeShowText}
            </ReactMarkdown>
          </div>
          <div className={styles.Left}>
            <h3>公告</h3>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {announcement || '暂无公告'}
            </ReactMarkdown>
          </div>
        </Col>
        <Col lg={3}>
          <div className={styles.Right}>
            <p>一言：</p>
            <p>{motto.hitokoto}</p>
            <div className={styles.from}>
              <p>来源：{motto.from}</p>
              <p>——{motto.from_who ? motto.from_who : motto.from}</p>
            </div>
          </div>
          <div className={styles.Right}>总题目数：{totalProblemsNum}</div>
          <div className={styles.Right}>
            <p>搜索</p>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="搜索题目..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div
                onClick={() => searchProblem(searchTerm)}
                className={styles.searchButton}
              >
                <FaSearch />
              </div>
            </div>
          </div>
          <div className={styles.Right}>
            <p>最新题目：</p>
            {newProblems.map((problem) => (
              <div key={problem.id}>
                <a href={`/problem/${problem.question_number}`}>
                  {problem.title}
                </a>
              </div>
            ))}
          </div>
          <div className={styles.Right}>倒计时</div>
        </Col>
      </Row>
    </Container>
  );
}
