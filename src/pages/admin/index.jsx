import { useEffect, useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Table, Alert, Badge } from 'react-bootstrap';
import AdminNav from '../../components/adminNav/adminNav';
import { getProblem, getNewProblems } from '../../api/getproblem';

export default function Admin() {
  const location = useLocation();

  if (location.pathname === '/admin') {
    return (
      <>
        <AdminNav />
        <AdminDashboard />
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <Outlet />
    </>
  );
}

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    hidden: 0,
    published: 0,
    difficulty: {},
    latest: [],
  });

  useEffect(() => {
    const fetchAllQuestions = async () => {
      const pageSize = 100;
      const first = await getProblem({ pageIdx: 1, pageSize });
      const totalCnt = Number(first?.totalCnt ?? 0);
      const all = Array.isArray(first?.result) ? [...first.result] : [];
      const totalPages = Math.max(1, Math.ceil(totalCnt / pageSize));

      for (let page = 2; page <= totalPages; page += 1) {
        const res = await getProblem({ pageIdx: page, pageSize });
        const rows = Array.isArray(res?.result) ? res.result : [];
        all.push(...rows);
      }

      return { all, totalCnt };
    };

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const [{ all, totalCnt }, latestResp] = await Promise.all([
          fetchAllQuestions(),
          getNewProblems({ pageIdx: 1, pageSize: 10 }),
        ]);

        const difficulty = {};
        let hidden = 0;

        all.forEach((q) => {
          const diff = String(q?.difficulty || '未知');
          difficulty[diff] = (difficulty[diff] || 0) + 1;

          if (String(q?.status || '').toLowerCase() !== 'published') {
            hidden += 1;
          }
        });

        setStats({
          total: totalCnt || all.length,
          hidden,
          published: Math.max(0, (totalCnt || all.length) - hidden),
          difficulty,
          latest: Array.isArray(latestResp?.result) ? latestResp.result : [],
        });
      } catch (e) {
        console.error(e);
        setError(String(e?.message || '加载管理员首页失败'));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 d-flex justify-content-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">管理总览</h2>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Row className="g-3 mb-4">
        <Col md={4}>
          <StatCard title="题目总数" value={stats.total} color="primary" />
        </Col>
        <Col md={4}>
          <StatCard title="已发布" value={stats.published} color="success" />
        </Col>
        <Col md={4}>
          <StatCard title="隐藏/草稿" value={stats.hidden} color="warning" />
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Header>难度分布</Card.Header>
            <Card.Body>
              {Object.keys(stats.difficulty).length === 0 ? (
                <div className="text-secondary">暂无数据</div>
              ) : (
                <Table striped bordered hover size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>难度</th>
                      <th>数量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.difficulty).map(([name, value]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Header>最新题目</Card.Header>
            <Card.Body>
              {stats.latest.length === 0 ? (
                <div className="text-secondary">暂无数据</div>
              ) : (
                <Table hover size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>标题</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.latest.map((q) => (
                      <tr key={String(q?.id ?? q?.question_id)}>
                        <td>{q?.id ?? '-'}</td>
                        <td>
                          <Link to={`/problem/${q?.id}`}>{q?.title || '-'}</Link>
                        </td>
                        <td>
                          <Badge bg={String(q?.status || '').toLowerCase() === 'published' ? 'success' : 'secondary'}>
                            {q?.status || '-'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

function StatCard({ title, value, color }) {
  return (
    <Card className={`shadow-sm border-start border-4 border-${color} h-100`}>
      <Card.Body>
        <h6 className="text-muted mb-1">{title}</h6>
        <h3 className="mb-0 fw-bold">{value}</h3>
      </Card.Body>
    </Card>
  );
}
