import { Container, Row, Col } from 'react-bootstrap';
import styles from './index.module.css';
import { useState, useEffect } from 'react';
import { getProblem, getNewProblems } from '../../api/getproblem';
import { getMotto } from '../../api/getMotto';
import { FaSearch } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAnnouncement, getHomeShowText } from '../../api/homeShowText';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const [totalProblemsNum, setTotalProblemsNum] = useState(0); // 总题目数
  const [motto, setMotto] = useState({}); // 一言
  const [newProblems, setNewProblems] = useState([]); // 最新题目
  const [searchTerm, setSearchTerm] = useState(''); // 搜索题目
  const [homeShowText, setHomeShowText] = useState(''); // OJ首页展示文本
  const [announcement, setAnnouncement] = useState(''); // 公告
  const navigate = useNavigate();

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
    navigate(`/problem?q=${searchTerm}`);
  };

  return (
    <div className={styles.homeContainer}>
      <Container>
        <Row>
          <Col lg={9}>
            <div className={styles.card}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {homeShowText}
              </ReactMarkdown>
            </div>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>公告</h3>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {announcement || '暂无公告'}
              </ReactMarkdown>
            </div>
          </Col>
          <Col lg={3}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>一言</h3>
              <p className={styles.mottoText}>{motto.hitokoto}</p>
              <div className={styles.from}>
                <span>{motto.from}</span>
                <span>—— {motto.from_who ? motto.from_who : motto.from}</span>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.statItem}>
                <span>总题目数</span>
                <span className={styles.statNumber}>{totalProblemsNum}</span>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>搜索</h3>
              <div className={styles.searchBar}>
                <input
                  type="text"
                  placeholder="搜索题目..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchProblem()}
                />
                <div
                  onClick={() => searchProblem(searchTerm)}
                  className={styles.searchButton}
                >
                  <FaSearch />
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>最新题目</h3>
              <div className={styles.problemList}>
                {newProblems.map((problem) => (
                  <Link
                    key={problem.id}
                    to={`/problem/${problem.question_id}`}
                    className={styles.problemLink}
                  >
                    {problem.title}
                  </Link>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
