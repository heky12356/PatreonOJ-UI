import React, { useEffect, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { getProblem } from '../../api/getproblem';
import { getGraphTags } from '../../api/learning.js';
import useMyProblemStatuses from '../../hooks/useMyProblemStatuses.js';
import { hasPermission, isLoggedIn } from '../../api/user.js';

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../components/feedback/AsyncState.jsx';
import FootNav from '../../components/footNav/footNav.jsx';
import { getRequestErrorMessage } from '../../utils/request.js';
import styles from './QuestionBank.module.css';

const DIFFICULTY_TEXT = {
  简单: '简单',
  中等: '中等',
  困难: '困难',
};

export default function QuestionBank() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const currentQuery = params.get('q') || '';
  const tag = params.get('tag') || '';
  const difficult = params.get('difficult') || '';
  const pageIdx = Math.min(100000, Math.max(1, parseInt(params.get('page'), 10) || 1));
  const pageSize = 10;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const [totalCnt, setTotalCnt] = useState(0);
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState(false);
  const [revision, setRevision] = useState(0);
  const solveStatusMap = useMyProblemStatuses(questions.map(question => question.id));

  const navigateQuery = next => navigate(`/problem${next.toString() ? `?${next}` : ''}`);
  const updateFilter = (name, value) => {
    const next = new URLSearchParams(location.search);
    if (value) next.set(name, value); else next.delete(name);
    next.delete('page');
    navigateQuery(next);
  };
  const setPageIdx = page => {
    const next = new URLSearchParams(location.search);
    if (page > 1) next.set('page', String(page)); else next.delete('page');
    navigateQuery(next);
  };

  useEffect(() => { setSearchTerm(currentQuery); }, [currentQuery]);
  useEffect(() => {
    const abort = new AbortController();
    getGraphTags(abort.signal).then(setTags).catch(error => { if (error.name !== 'AbortError') setTagsError(true); }).finally(() => { if (!abort.signal.aborted) setTagsLoading(false); });
    return () => abort.abort();
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true); setError('');
    getProblem({ q: currentQuery, tag, difficult, pageIdx, pageSize, signal: abort.signal })
      .then(data => { if (!abort.signal.aborted) { setQuestions(data.result || []); setTotalCnt(data.totalCnt || 0); } })
      .catch(error => { if (!abort.signal.aborted) { setError(getRequestErrorMessage(error, '获取题库列表失败')); setQuestions([]); } })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [currentQuery, tag, difficult, pageIdx, revision]);

  const parseTags = (tagsString) => {
    if (!tagsString) return [];
    return String(tagsString)
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  };

  const getDifficultyClass = (diff) => {
    if (diff === '简单') return styles.easy;
    if (diff === '中等') return styles.medium;
    if (diff === '困难') return styles.hard;
    return '';
  };

  const getSolveStatusMeta = (questionPk) => {
    if (!isLoggedIn()) {
      return {
        text: '登录后查看',
        className: styles.statusLoginHint,
      };
    }

    const state = solveStatusMap[Number(questionPk)];
    if (!state) return { text: '加载中', className: styles.statusLoginHint };
    if (state === 'unknown') return { text: '暂不可用', className: styles.statusLoginHint };
    if (state === 'solved') {
      return {
        text: '已通过',
        className: styles.statusSolved,
      };
    }
    if (state === 'attempted') {
      return {
        text: '未通过',
        className: styles.statusAttempted,
      };
    }
    return {
      text: '未做',
      className: styles.statusUnsolved,
    };
  };

  const searchProblem = raw => updateFilter('q', raw.trim());

  return (
    <div className={styles.container}>
      <Container>
        <Row>
          <Col md={9}>
            <div className={styles.card}>
              <div className={styles.searchBar}>
                <input
                  type="text"
                  placeholder="搜索题目名称、题号、标签或内容关键词"
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && searchProblem(searchTerm)
                  }
                />
                <button
                  type="button"
                  onClick={() => searchProblem(searchTerm)}
                  className={styles.searchButton}
                  aria-label="搜索题目"
                >
                  <FaSearch />
                </button>
              </div>

              {error ? (
                <ErrorState
                  title="题库加载失败"
                  message={error}
                  onRetry={() => setRevision(value => value + 1)}
                />
              ) : loading ? (
                <LoadingState text="正在加载题库..." />
              ) : questions.length === 0 ? (
                <EmptyState
                  title="没有找到匹配题目"
                  description="试试更换关键词，或调整难度筛选。"
                />
              ) : (
                <>
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th style={{ width: '80px' }}>题号</th>
                          <th>题目名称</th>
                          <th style={{ width: '110px' }}>状态</th>
                          <th style={{ width: '100px' }}>难度</th>
                          <th>标签</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questions.map((question) => {
                          const statusMeta = getSolveStatusMeta(question?.id);
                          const tags = parseTags(question.tags);

                          return (
                            <tr key={question.id} className={styles.row}>
                              <td><span className={styles.questionNumber} title={question.question_id || question.question_number}>{question.question_id || question.question_number}</span></td>
                              <td>
                                <small className={styles.mobileQuestionNumber} title={question.question_id || question.question_number}>{question.question_id || question.question_number}</small>
                                <Link
                                  to={`/problem/${question.id}`}
                                  className={styles.link}
                                  title={question.title}
                                >
                                  {question.title}
                                  {question.status !== 'published' ? (
                                    <span>(隐藏)</span>
                                  ) : null}
                                </Link>
                              </td>
                              <td>
                                <span
                                  className={`${styles.solveStatus} ${statusMeta.className}`}
                                >
                                  {statusMeta.text}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`${styles.difficulty} ${getDifficultyClass(
                                    question.difficulty
                                  )}`}
                                >
                                  {DIFFICULTY_TEXT[question.difficulty] ||
                                    question.difficulty ||
                                    '-'}
                                </span>
                              </td>
                              <td>
                                {tags.length > 0 ? (
                                  tags.map((tag, index) => (
                                    <span key={index} className={styles.tag}>
                                      {tag}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-secondary small">暂无标签</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className={styles.tableHint}>左右滑动查看状态、难度和标签</p>

                  <div className={styles.footNav}>
                    <FootNav
                      pageIdx={pageIdx}
                      setIdx={setPageIdx}
                      pageCnt={Math.max(1, Math.ceil(totalCnt / pageSize))}
                    />
                  </div>
                </>
              )}
            </div>
          </Col>

          <Col md={3} className={styles.Left}>
            <div className={styles.card}>
              <label
                htmlFor="difficulty-filter"
                className="d-block mb-2 text-secondary small"
              >
                难度筛选
              </label>
              <select
                id="difficulty-filter"
                className={styles.filterSelect}
                value={difficult}
                onChange={event => updateFilter('difficult', event.target.value)}
              >
                <option value="">全部难度</option>
                <option value="简单">简单</option>
                <option value="中等">中等</option>
                <option value="困难">困难</option>
              </select>
            </div>

            <div className={styles.card}>
              <label htmlFor="tag-filter" className="d-block mb-2 text-secondary small">标签筛选</label>
              <select id="tag-filter" className={styles.filterSelect} value={tag} disabled={tagsLoading} onChange={event => updateFilter('tag', event.target.value)}>
                <option value="">{tagsLoading ? '正在读取标签…' : '全部标签'}</option>
                {tag && !tags.some(item => item.name === tag) && <option value={tag}>{tag}</option>}
                {tags.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
              {tagsError && <p className={styles.filterHint}>标签列表暂不可用，请刷新重试。</p>}
              {tag && <Link className={styles.filterGraphLink} to={`/graph?tag=${encodeURIComponent(tag)}`}>查看该标签图谱</Link>}
            </div>

            {hasPermission('admin') ? (
              <div
                className={styles.actionButton}
                onClick={() => navigate('/admin/addproblem')}
              >
                <FaPlus style={{ marginRight: '8px' }} /> 添加题目
              </div>
            ) : null}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
