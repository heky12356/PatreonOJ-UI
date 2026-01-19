import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Col, Container, Image, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  getUserByUuid,
  getUserId,
  getUserMasteryQuestions,
  isLoggedIn,
} from '../../api/user.js';
import styles from './profile.module.css';
import {
  FaUser,
  FaCog,
  FaList,
  FaSync,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';

/**
 * @typedef {Object} UserProfile
 * @property {string} [uuid]
 * @property {string} [username]
 * @property {string} [nickname]
 * @property {string} [email]
 * @property {string} [avatar_url]
 * @property {string[]} [permissions]
 */

/**
 * @typedef {Object} MasteryQuestion
 * @property {number} [question_number]
 * @property {number} [mastery]
 * @property {boolean} [accepted]
 * @property {string} [updated_at]
 */

/**
 * @param {{ uuid?: string }} props
 */
export default function Profile({ uuid } = {}) {
  const operatorUuid = getUserId();
  const targetUuid = uuid || operatorUuid;

  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  const [masteryLoading, setMasteryLoading] = useState(false);
  const [masteryError, setMasteryError] = useState('');
  const [masteryRows, setMasteryRows] = useState([]);
  const [masteryTotal, setMasteryTotal] = useState(0);

  const [pageIdx, setPageIdx] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [minMastery, setMinMastery] = useState('');
  const [sort, setSort] = useState('mastery');
  const [order, setOrder] = useState('desc');

  const [feedback, setFeedback] = useState(null);

  const parseAxiosError = (error, fallback = '请求失败') => {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback;
    return String(msg);
  };

  const normalizeMasteryQuestions = (payload) => {
    const root =
      payload?.data && typeof payload.data === 'object'
        ? payload.data
        : payload;

    const rows = Array.isArray(root?.items)
      ? root.items
      : Array.isArray(root?.questions)
        ? root.questions
        : Array.isArray(root?.result)
          ? root.result
          : [];

    const total =
      typeof root?.count === 'number'
        ? root.count
        : typeof root?.total === 'number'
          ? root.total
          : rows.length;

    return { rows, total };
  };

  const totalPages = useMemo(() => {
    const n = Math.ceil((masteryTotal || 0) / (pageSize || 1));
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [masteryTotal, pageSize]);

  // Custom Pagination Component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;

      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        if (pageIdx > 4) pages.push('...');

        let start = Math.max(2, pageIdx - 1);
        let end = Math.min(totalPages - 1, pageIdx + 1);

        if (pageIdx <= 4) end = 5;
        else if (pageIdx >= totalPages - 3) start = totalPages - 4;

        for (let i = start; i <= end; i++) pages.push(i);

        if (pageIdx < totalPages - 3) pages.push('...');
        pages.push(totalPages);
      }
      return pages;
    };

    return (
      <div className="d-flex justify-content-end mt-3">
        <ul className={styles.pagination}>
          <li
            className={`${styles.pageItem} ${pageIdx <= 1 ? styles.disabled : ''}`}
          >
            <div
              className={styles.pageLink}
              onClick={() => setPageIdx((p) => Math.max(1, p - 1))}
            >
              <FaChevronLeft size={10} />
            </div>
          </li>

          {getPageNumbers().map((page, index) => (
            <li
              key={index}
              className={`${styles.pageItem} ${page === pageIdx ? styles.active : ''} ${page === '...' ? styles.disabled : ''}`}
            >
              <div
                className={styles.pageLink}
                onClick={() => typeof page === 'number' && setPageIdx(page)}
              >
                {page}
              </div>
            </li>
          ))}

          <li
            className={`${styles.pageItem} ${pageIdx >= totalPages ? styles.disabled : ''}`}
          >
            <div
              className={styles.pageLink}
              onClick={() => setPageIdx((p) => Math.min(totalPages, p + 1))}
            >
              <FaChevronRight size={10} />
            </div>
          </li>
        </ul>
      </div>
    );
  };

  const fetchUser = async () => {
    if (!targetUuid) return;
    setUserLoading(true);
    setUserError('');
    try {
      const data = await getUserByUuid(targetUuid, {
        operator_uuid: operatorUuid,
      });
      // console.log(data.result);
      setUserProfile(data.result);
    } catch (e) {
      setUserError(parseAxiosError(e, '获取用户信息失败'));
      setUserProfile(null);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchMastery = async () => {
    if (!targetUuid) return;
    setMasteryLoading(true);
    setMasteryError('');
    try {
      const min = minMastery === '' ? undefined : Number(minMastery);
      const data = await getUserMasteryQuestions(targetUuid, {
        operator_uuid: operatorUuid,
        pageIdx,
        pageSize,
        min_mastery: Number.isFinite(min) ? min : undefined,
        sort,
        order,
      });

      // console.log(data);

      const { rows, total } = normalizeMasteryQuestions(data);
      // console.log(rows, total);
      setMasteryRows(Array.isArray(rows) ? rows : []);
      setMasteryTotal(typeof total === 'number' ? total : 0);
    } catch (e) {
      setMasteryError(parseAxiosError(e, '获取题目掌握度失败'));
      setMasteryRows([]);
      setMasteryTotal(0);
    } finally {
      setMasteryLoading(false);
    }
  };

  const reloadAll = async () => {
    await Promise.all([fetchUser(), fetchMastery()]);
  };

  useEffect(() => {
    if (!targetUuid) return;
    reloadAll();
  }, [targetUuid]);

  useEffect(() => {
    if (!targetUuid) return;
    fetchMastery();
  }, [pageIdx, pageSize, minMastery, sort, order]);

  if (!isLoggedIn()) {
    return (
      <div className={styles.container}>
        <Container>
          <Alert variant="warning" className="mb-0">
            请先 <Link to="/login">登录</Link> 后查看个人中心。
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Container>
        <div className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>个人中心</h2>
            <div className={styles.pageSubtitle}>用户信息与学习掌握度</div>
          </div>
          <div className="d-flex gap-2">
            <Link
              to="/profile/submissions"
              className={`${styles.btn} ${styles.btnOutlinePrimary}`}
            >
              <FaList className="me-2" /> 我的提交记录
            </Link>
            <Link
              to="/settings"
              className={`${styles.btn} ${styles.btnOutline}`}
            >
              <FaCog className="me-2" /> 设置
            </Link>
            <button
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={reloadAll}
              disabled={userLoading || masteryLoading}
            >
              <FaSync
                className={`me-2 ${userLoading || masteryLoading ? 'fa-spin' : ''}`}
              />
              {userLoading || masteryLoading ? '刷新中' : '刷新'}
            </button>
          </div>
        </div>

        {feedback ? (
          <Alert
            variant={feedback.type}
            dismissible
            onClose={() => setFeedback(null)}
          >
            {feedback.text}
          </Alert>
        ) : null}

        <Row className="g-4">
          <Col xs={12} lg={4}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className="d-flex align-items-center gap-2">
                  <FaUser className="text-muted" /> 用户信息
                </span>
                {userLoading ? <Spinner size="sm" /> : null}
              </div>
              <div className={styles.cardBody}>
                {userError ? <Alert variant="danger">{userError}</Alert> : null}

                {userProfile ? (
                  <div className="d-flex flex-column gap-4">
                    <div className="d-flex align-items-center gap-3 pb-3 border-bottom">
                      <Image
                        src={
                          userProfile.avatar_url ||
                          'https://api.dicebear.com/7.x/miniavs/svg?seed=user'
                        }
                        roundedCircle
                        width={80}
                        height={80}
                        className={styles.avatar}
                        alt="avatar"
                      />
                      <div>
                        <div className="fs-5 fw-bold text-dark">
                          {userProfile.nickname ||
                            userProfile.username ||
                            userProfile.uuid ||
                            targetUuid}
                        </div>
                        {userProfile.email && (
                          <div className="text-muted small">
                            {userProfile.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className={styles.userInfoLabel}>UUID</div>
                      <div className={`${styles.userInfoValue} font-monospace`}>
                        {userProfile.uuid || targetUuid}
                      </div>
                    </div>

                    <div>
                      <div className={styles.userInfoLabel}>权限</div>
                      <div className="d-flex flex-wrap gap-2 mt-1">
                        {userProfile.permissions.split(',').map((p) => (
                          <span className={styles.badge} key={p}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-secondary text-center py-4">
                    暂无用户数据
                  </div>
                )}
              </div>
            </div>
          </Col>

          <Col xs={12} lg={8}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span>题目掌握度</span>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <span className={styles.filterLabel}>排序:</span>
                  <select
                    className={styles.filterSelect}
                    value={sort}
                    onChange={(e) => {
                      setPageIdx(1);
                      setSort(e.target.value);
                    }}
                  >
                    <option value="mastery">掌握度</option>
                    <option value="question_number">题目编号</option>
                    <option value="updated_at">更新时间</option>
                  </select>
                  <select
                    className={styles.filterSelect}
                    value={order}
                    onChange={(e) => {
                      setPageIdx(1);
                      setOrder(e.target.value);
                    }}
                  >
                    <option value="desc">降序</option>
                    <option value="asc">升序</option>
                  </select>
                  <select
                    className={styles.filterSelect}
                    value={pageSize}
                    onChange={(e) => {
                      setPageIdx(1);
                      setPageSize(Number(e.target.value));
                    }}
                  >
                    <option value={10}>10条/页</option>
                    <option value={20}>20条/页</option>
                    <option value={50}>50条/页</option>
                  </select>
                </div>
              </div>
              <div className={styles.cardBody}>
                {masteryError ? (
                  <Alert variant="danger">{masteryError}</Alert>
                ) : null}

                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="text-secondary small">
                    共 <span className="fw-bold text-dark">{masteryTotal}</span>{' '}
                    条记录
                  </div>
                  {masteryLoading ? <Spinner size="sm" /> : null}
                </div>

                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th style={{ width: 140 }}>题目编号</th>
                        <th style={{ width: 140 }}>掌握度</th>
                        <th style={{ width: 120 }}>状态</th>
                        <th>更新时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {masteryRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center text-secondary py-5"
                          >
                            {masteryLoading ? '加载中…' : '暂无数据'}
                          </td>
                        </tr>
                      ) : (
                        masteryRows.map((row, idx) => {
                          const qn = row?.question_id;
                          const mastery = row?.mastery;
                          const accepted_count = row?.accepted_count;
                          const updatedAt = row?.updated_at;

                          return (
                            <tr
                              key={String(qn ?? idx)}
                              className={styles.tableRow}
                            >
                              <td>
                                {qn != null ? (
                                  <Link
                                    to={`/problem/${qn}`}
                                    className="text-decoration-none fw-medium text-dark"
                                  >
                                    {qn}
                                  </Link>
                                ) : (
                                  <span className="text-secondary">-</span>
                                )}
                              </td>
                              <td>
                                {typeof mastery === 'number' ? (
                                  <span
                                    className="font-monospace fw-bold"
                                    style={{ color: '#51624f' }}
                                  >
                                    {mastery.toFixed(3)}
                                  </span>
                                ) : (
                                  <span className="text-secondary">-</span>
                                )}
                              </td>
                              <td>
                                {accepted_count > 0 ? (
                                  <span
                                    className={`${styles.statusBadge} ${styles.statusSuccess}`}
                                  >
                                    Accepted
                                  </span>
                                ) : accepted_count <= 0 ? (
                                  <span
                                    className={`${styles.statusBadge} ${styles.statusFail}`}
                                  >
                                    未通过
                                  </span>
                                ) : (
                                  <span
                                    className={`${styles.statusBadge} ${styles.statusUnknown}`}
                                  >
                                    未知
                                  </span>
                                )}
                              </td>
                              <td className="text-secondary">
                                {updatedAt ? String(updatedAt) : '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
