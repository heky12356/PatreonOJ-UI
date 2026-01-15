import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './QuestionBank.module.css';
import { getProblem } from '../../api/getproblem';
import FootNav from '../../components/footNav/footNav.jsx';
import { Container, Row, Col } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { hasPermission } from '../../api/user.js';

const QuestionBank = ({ setCurrentKey }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageIdx, setPageIdx] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCnt, setTotalCnt] = useState(0);
  const [difficult, setDifficult] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [selectProm, setSelctProm] = useState(new Set());

  const params = new URLSearchParams(window.location.search);

  // 获取题目列表
  // 监听pageIdx，如果pageIdx发生变化就调用搜索函数将data数组做一个变化
  useEffect(() => {
    const fetchQuestions = async (searchTerm) => {
      try {
        // console.log('searchTerm:', searchTerm);
        setLoading(true);
        let data = await getProblem({
          q: searchTerm,
          pageSize: 10,
          pageIdx,
          difficult,
        });
        setQuestions(data.result || []);
        setPageIdx(data.pageIdx || 1);
        setPageSize(data.pageSize || 50);
        setTotalCnt(data.totalCnt || 0);
      } catch (err) {
        setError(err.message);
        console.error('获取题目列表失败:', err);
      } finally {
        setLoading(false);
      }
    };

    setSearchTerm(params.get('q') || '');
    // console.log(params.get('q'));
    fetchQuestions(params.get('q'));
  }, [pageIdx, difficult]);

  // useEffect(() => {
  //   console.log('测试' + hasPermission('admin'));
  // }, []);

  // 解析标签字符串为数组
  const parseTags = (tagsString) => {
    if (!tagsString) return [];
    return tagsString.split(',').map((tag) => tag.trim());
  };

  const searchProblem = async (q) => {
    window.location.href = `/problem?q=${q}`;
  };

  // 选择单个题目
  const handelSelectProm = (value) => {
    setSelctProm((prev) => {
      let newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
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
    <Container>
      {/* <h1 className={styles.title}>题库列表</h1> */}
      <Row>
        <Col md={10}>
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

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {isEdit && (
                    <th>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value=""
                        id="checkDefault"
                      ></input>
                    </th>
                  )}
                  <th>题号</th>
                  <th>题目名称</th>
                  <th>难度</th>
                  <th>标签</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.id} className={styles.row}>
                    {isEdit && (
                      <td>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value={question.id}
                          id={question.id}
                          onChange={(e) => {
                            console.log(e.target.value);
                          }}
                        ></input>
                      </td>
                    )}
                    <td>{question.question_number}</td>
                    <td>
                      <Link
                        to={`/problem/${question.question_number}`}
                        className={styles.link}
                      >
                        {question.title}
                        {question.status != 'published' && <span>(隐藏)</span>}
                      </Link>
                    </td>
                    <td>
                      <span
                        className={`${styles.difficulty} ${
                          styles[question.difficulty]
                        }`}
                      >
                        {question.difficulty}
                      </span>
                    </td>
                    <td>
                      {parseTags(question.tags).map((tag, index) => (
                        <span key={index} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.footNav}>
            <FootNav
              pageIdx={pageIdx}
              setIdx={setPageIdx}
              pageCnt={Math.ceil(totalCnt / pageSize)}
            />
          </div>

          {questions.length === 0 && !loading && (
            <div className={styles.noData}>暂无题目数据</div>
          )}
        </Col>
        <Col md={2} className={styles.Left}>
          <div className={styles.LeftBase}>
            <div>
              <select
                className={styles.filter}
                value={difficult}
                onChange={(e) => setDifficult(e.target.value)}
              >
                <option value="">全部难度</option>
                <option value="简单">简单</option>
                <option value="中等">中等</option>
                <option value="困难">困难</option>
              </select>
            </div>
          </div>

          {hasPermission('admin') && (
            <div className={`${styles.LeftBase} ${styles.EditBar}`}>
              {!isEdit && (
                <div
                  onClick={() => {
                    setIsEdit(true);
                  }}
                >
                  进入编辑模式
                </div>
              )}
              {isEdit && (
                <div
                  onClick={() => {
                    setIsEdit(false);
                  }}
                >
                  退出编辑模式
                </div>
              )}
            </div>
          )}

          {hasPermission('admin') && (
            <div
              className={`${styles.LeftBase} ${styles.addButton}`}
              onClick={() => {
                window.location.href = '/admin/addproblem';
              }}
            >
              添加题目
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default QuestionBank;
