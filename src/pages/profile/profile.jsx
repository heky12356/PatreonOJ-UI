import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Image,
  Pagination,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  getUserByUuid,
  getUserId,
  getUserMasteryQuestions,
  isLoggedIn,
  postUserMasteryEvent,
} from '../../api/user.js';

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

  const paginationItems = useMemo(() => {
    const items = [];
    const windowSize = 2;
    const start = Math.max(1, pageIdx - windowSize);
    const end = Math.min(totalPages, pageIdx + windowSize);

    for (let p = start; p <= end; p += 1) {
      items.push(
        <Pagination.Item
          key={p}
          active={p === pageIdx}
          onClick={() => setPageIdx(p)}
        >
          {p}
        </Pagination.Item>
      );
    }

    return items;
  }, [pageIdx, totalPages]);

  const fetchUser = async () => {
    if (!targetUuid) return;
    setUserLoading(true);
    setUserError('');
    try {
      const data = await getUserByUuid(targetUuid, {
        operator_uuid: operatorUuid,
      });
      console.log(data.result);
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

      const { rows, total } = normalizeMasteryQuestions(data);
      console.log(rows, total);
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
      <Container className="py-4">
        <Alert variant="warning" className="mb-0">
          请先 <Link to="/login">登录</Link> 后查看个人中心。
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="align-items-center g-2 mb-3">
        <Col xs={12} md>
          <h2 className="mb-0">个人中心</h2>
          <div className="text-secondary small">用户信息与学习掌握度</div>
        </Col>
        <Col xs={12} md="auto" className="d-flex gap-2">
          <Button as={Link} to="/profile/submissions" variant="outline-primary">
            我的提交记录
          </Button>
          <Button
            variant="outline-secondary"
            onClick={reloadAll}
            disabled={userLoading || masteryLoading}
          >
            {userLoading || masteryLoading ? (
              <>
                <Spinner size="sm" className="me-2" />
                刷新中
              </>
            ) : (
              '刷新'
            )}
          </Button>
        </Col>
      </Row>

      {feedback ? (
        <Alert
          variant={feedback.type}
          dismissible
          onClose={() => setFeedback(null)}
        >
          {feedback.text}
        </Alert>
      ) : null}

      <Row className="g-3">
        <Col xs={12} lg={4}>
          <Card className="h-100">
            <Card.Header className="d-flex align-items-center justify-content-between">
              <span>用户信息</span>
              {userLoading ? <Spinner size="sm" /> : null}
            </Card.Header>
            <Card.Body>
              {userError ? <Alert variant="danger">{userError}</Alert> : null}

              {userProfile ? (
                <div className="d-flex gap-3">
                  <div>
                    <Image
                      src={
                        userProfile.avatar_url ||
                        'https://api.dicebear.com/7.x/miniavs/svg?seed=user'
                      }
                      roundedCircle
                      width={64}
                      height={64}
                      alt="avatar"
                    />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">
                      {userProfile.nickname ||
                        userProfile.username ||
                        userProfile.uuid ||
                        targetUuid}
                    </div>
                    {userProfile.email ? (
                      <div className="text-secondary small">
                        {userProfile.email}
                      </div>
                    ) : null}
                    <div className="mt-2">
                      <div className="text-secondary small">UUID</div>
                      <div className="font-monospace small">
                        {userProfile.uuid || targetUuid}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-secondary small">权限</div>
                      <div className="d-flex flex-wrap gap-1">
                        {userProfile.permissions.split(',').map((p) => (
                          <Badge bg="secondary" key={p}>
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-secondary">暂无用户数据</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={8}>
          <Card>
            <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <span>题目掌握度</span>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span>排序：</span>
                <Form.Select
                  style={{ width: 140 }}
                  value={sort}
                  onChange={(e) => {
                    setPageIdx(1);
                    setSort(e.target.value);
                  }}
                >
                  <option value="mastery">掌握度</option>
                  <option value="question_number">题目编号</option>
                  <option value="updated_at">更新时间</option>
                </Form.Select>
                <Form.Select
                  style={{ width: 120 }}
                  value={order}
                  onChange={(e) => {
                    setPageIdx(1);
                    setOrder(e.target.value);
                  }}
                >
                  <option value="desc">降序</option>
                  <option value="asc">升序</option>
                </Form.Select>
                <Form.Select
                  style={{ width: 120 }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageIdx(1);
                    setPageSize(Number(e.target.value));
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Form.Select>
              </div>
            </Card.Header>
            <Card.Body>
              {masteryError ? (
                <Alert variant="danger">{masteryError}</Alert>
              ) : null}

              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="text-secondary small">
                  共 {masteryTotal} 条，当前第 {pageIdx} / {totalPages} 页
                </div>
                {masteryLoading ? <Spinner size="sm" /> : null}
              </div>

              <Table hover responsive className="mb-0">
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
                        colSpan={5}
                        className="text-center text-secondary py-4"
                      >
                        {masteryLoading ? '加载中…' : '暂无数据'}
                      </td>
                    </tr>
                  ) : (
                    masteryRows.map((row, idx) => {
                      const qn = row?.question_number;
                      const mastery = row?.mastery;
                      const accepted_count = row?.accepted_count;
                      const updatedAt = row?.updated_at;

                      return (
                        <tr key={String(qn ?? idx)}>
                          <td>
                            {qn != null ? (
                              <Link
                                to={`/problem/${qn}`}
                                className="text-decoration-none"
                              >
                                {qn}
                              </Link>
                            ) : (
                              <span className="text-secondary">-</span>
                            )}
                          </td>
                          <td>
                            {typeof mastery === 'number' ? (
                              <span className="font-monospace">
                                {mastery.toFixed(3)}
                              </span>
                            ) : (
                              <span className="text-secondary">-</span>
                            )}
                          </td>
                          <td>
                            {accepted_count > 0 ? (
                              <Badge bg="success">Accepted</Badge>
                            ) : accepted_count <= 0 ? (
                              <Badge bg="secondary">未通过</Badge>
                            ) : (
                              <Badge bg="light" text="dark">
                                未知
                              </Badge>
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
              </Table>

              <div className="d-flex justify-content-end mt-3">
                <Pagination className="mb-0">
                  <Pagination.Prev
                    disabled={pageIdx <= 1}
                    onClick={() => setPageIdx((p) => Math.max(1, p - 1))}
                  />
                  {pageIdx > 3 ? (
                    <>
                      <Pagination.Item onClick={() => setPageIdx(1)}>
                        1
                      </Pagination.Item>
                      <Pagination.Ellipsis disabled />
                    </>
                  ) : null}

                  {paginationItems}

                  {pageIdx < totalPages - 2 ? (
                    <>
                      <Pagination.Ellipsis disabled />
                      <Pagination.Item onClick={() => setPageIdx(totalPages)}>
                        {totalPages}
                      </Pagination.Item>
                    </>
                  ) : null}

                  <Pagination.Next
                    disabled={pageIdx >= totalPages}
                    onClick={() =>
                      setPageIdx((p) => Math.min(totalPages, p + 1))
                    }
                  />
                </Pagination>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
