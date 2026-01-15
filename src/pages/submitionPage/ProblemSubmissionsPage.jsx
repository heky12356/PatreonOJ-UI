import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Pagination,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProblemSubmissions } from '../../api/judge.js';

const statusVariant = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'completed') return 'success';
  if (s === 'processing') return 'info';
  if (s === 'pending') return 'secondary';
  if (s === 'error') return 'danger';
  return 'light';
};

export default function ProblemSubmissionsPage() {
  const { question_number } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [status, setStatus] = useState('');
  const [language, setLanguage] = useState('');

  const [resp, setResp] = useState({
    total: 0,
    page: 1,
    size: 20,
    pages: 1,
    items: [],
  });

  const totalPages = useMemo(() => {
    const n = Number(resp?.pages);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [resp?.pages]);

  const paginationItems = useMemo(() => {
    const items = [];
    const windowSize = 2;
    const start = Math.max(1, page - windowSize);
    const end = Math.min(totalPages, page + windowSize);
    for (let p = start; p <= end; p += 1) {
      items.push(
        <Pagination.Item key={p} active={p === page} onClick={() => setPage(p)}>
          {p}
        </Pagination.Item>
      );
    }
    return items;
  }, [page, totalPages]);

  const fetchList = async () => {
    if (!question_number) return;
    setLoading(true);
    setError('');
    try {
      const data = await getProblemSubmissions(question_number, {
        page,
        size,
        status: status || undefined,
        language: language || undefined,
      });
      setResp({
        total: Number(data?.total ?? 0),
        page: Number(data?.page ?? page),
        size: Number(data?.size ?? size),
        pages: Number(data?.pages ?? 1),
        items: Array.isArray(data?.items) ? data.items : [],
      });
    } catch (e) {
      setResp({ total: 0, page, size, pages: 1, items: [] });
      setError(String(e?.message || '获取题目提交记录失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [question_number, page, size, status, language]);

  return (
    <Container className="py-4">
      <Row className="align-items-center g-2 mb-3">
        <Col xs={12} md>
          <h2 className="mb-0">题目提交记录</h2>
          <div className="text-secondary small">题号：{question_number}</div>
        </Col>
        <Col xs={12} md="auto" className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            返回
          </Button>
          <Button
            variant="outline-primary"
            onClick={fetchList}
            disabled={loading}
          >
            {loading ? (
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

      <Card className="mb-3">
        <Card.Body>
          <Row className="g-2">
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label className="mb-1">状态</Form.Label>
                <Form.Select
                  value={status}
                  onChange={(e) => {
                    setPage(1);
                    setStatus(e.target.value);
                  }}
                >
                  <option value="">全部</option>
                  <option value="completed">completed</option>
                  <option value="processing">processing</option>
                  <option value="pending">pending</option>
                  <option value="error">error</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label className="mb-1">语言</Form.Label>
                <Form.Control
                  value={language}
                  placeholder="例如 go / cpp / java / python"
                  onChange={(e) => {
                    setPage(1);
                    setLanguage(e.target.value);
                  }}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label className="mb-1">每页数量</Form.Label>
                <Form.Select
                  value={size}
                  onChange={(e) => {
                    setPage(1);
                    setSize(Number(e.target.value));
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} md={3} className="d-flex align-items-end">
              <div className="text-secondary small">
                共 {resp.total} 条，第 {resp.page} / {totalPages} 页
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Card>
        <Card.Header className="d-flex align-items-center justify-content-between">
          <span>列表</span>
          {loading ? <Spinner size="sm" /> : null}
        </Card.Header>
        <Card.Body>
          <Table hover responsive className="mb-0">
            <thead>
              <tr>
                <th style={{ width: 220 }}>提交ID</th>
                <th style={{ width: 220 }}>用户UUID</th>
                <th style={{ width: 170 }}>提交时间</th>
                <th style={{ width: 130 }}>状态</th>
                <th style={{ width: 120 }}>运行(ms)</th>
                <th style={{ width: 120 }}>内存(KB)</th>
                <th style={{ width: 120 }}>语言</th>
                <th style={{ width: 120 }}>代码长度</th>
                <th style={{ width: 140 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {resp.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-secondary py-4">
                    {loading ? '加载中…' : '暂无数据'}
                  </td>
                </tr>
              ) : (
                resp.items.map((it) => (
                  <tr key={String(it?.submission_id)}>
                    <td className="font-monospace small">
                      {String(it?.submission_id || '')}
                    </td>
                    <td className="font-monospace small">
                      {String(it?.user_id || '')}
                    </td>
                    <td className="text-secondary">
                      {it?.submitted_at ? String(it.submitted_at) : '-'}
                    </td>
                    <td>
                      <Badge bg={statusVariant(it?.status)}>
                        {String(it?.status || '-')}
                      </Badge>
                    </td>
                    <td className="font-monospace">{it?.runtime_ms ?? '-'}</td>
                    <td className="font-monospace">{it?.memory_kb ?? '-'}</td>
                    <td className="font-monospace">{it?.language ?? '-'}</td>
                    <td className="font-monospace">{it?.code_length ?? '-'}</td>
                    <td>
                      {it?.submission_id ? (
                        <Button
                          as={Link}
                          to={`/submission/${it.submission_id}`}
                          size="sm"
                          variant="outline-primary"
                        >
                          详情
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline-secondary" disabled>
                          详情
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <div className="d-flex justify-content-end mt-3">
            <Pagination className="mb-0">
              <Pagination.Prev
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
              {page > 3 ? (
                <>
                  <Pagination.Item onClick={() => setPage(1)}>
                    1
                  </Pagination.Item>
                  <Pagination.Ellipsis disabled />
                </>
              ) : null}
              {paginationItems}
              {page < totalPages - 2 ? (
                <>
                  <Pagination.Ellipsis disabled />
                  <Pagination.Item onClick={() => setPage(totalPages)}>
                    {totalPages}
                  </Pagination.Item>
                </>
              ) : null}
              <Pagination.Next
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </Pagination>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
