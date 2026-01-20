import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import AdminNav from '../../components/adminNav/adminNav';
import { getGraphNodePage } from '../../api/graph';
import { getCategories } from '../../api/getcategories';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function Admin() {
  const location = useLocation();
  const path = location.pathname;

  if (path === '/admin') {
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
  const [stats, setStats] = useState({
    problemCount: 0,
    categoryCount: 0,
    skillCount: 0,
    difficultyDist: { 入门: 0, 简单: 0, 中等: 0, 困难: 0 },
    topTags: [],
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [graphData, categories] = await Promise.all([
          getGraphNodePage({ page: 1, pageSize: 10000 }), // 获取尽可能多的题目用于统计
          getCategories(),
        ]);

        // 1. 基础统计
        const problemCount = graphData.count || 0;
        const skillCount = graphData.skill_count || 0;
        const categoryCount = categories.length || 0;

        // 2. 难度分布统计
        const difficultyDist = { 入门: 0, 简单: 0, 中等: 0, 困难: 0 };
        const questions = graphData.questions || [];

        questions.forEach((q) => {
          if (difficultyDist[q.difficulty] !== undefined) {
            difficultyDist[q.difficulty]++;
          } else {
            // 处理未归类或其它难度的
            const key = q.difficulty || '未知';
            difficultyDist[key] = (difficultyDist[key] || 0) + 1;
          }
        });

        // 3. 标签统计
        const tagMap = {};
        questions.forEach((q) => {
          if (q.tags) {
            const tags = q.tags
              .split(/[,，]/)
              .map((t) => t.trim())
              .filter(Boolean);
            tags.forEach((t) => {
              tagMap[t] = (tagMap[t] || 0) + 1;
            });
          }
        });

        // 排序并取前10个标签
        const sortedTags = Object.entries(tagMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        setStats({
          problemCount,
          categoryCount,
          skillCount,
          difficultyDist,
          topTags: sortedTags,
          loading: false,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, []);

  if (stats.loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: '50vh' }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  // 图表数据配置
  const pieData = {
    labels: Object.keys(stats.difficultyDist),
    datasets: [
      {
        data: Object.values(stats.difficultyDist),
        backgroundColor: [
          '#4caf50', // 入门 - Green
          '#2196f3', // 简单 - Blue
          '#ff9800', // 中等 - Orange
          '#f44336', // 困难 - Red
          '#9e9e9e', // 未知 - Grey
        ],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: stats.topTags.map((t) => t[0]),
    datasets: [
      {
        label: '题目数量',
        data: stats.topTags.map((t) => t[1]),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">数据总览</h2>

      {/* 统计卡片 */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <StatCard
            title="题目总数"
            value={stats.problemCount}
            icon="📝"
            color="primary"
          />
        </Col>
        <Col md={4}>
          <StatCard
            title="分类总数"
            value={stats.categoryCount}
            icon="📂"
            color="success"
          />
        </Col>
        <Col md={4}>
          <StatCard
            title="知识点/标签"
            value={stats.skillCount}
            icon="🏷️"
            color="info"
          />
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>题目难度分布</Card.Title>
              <div
                style={{
                  height: '300px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Pie data={pieData} options={{ maintainAspectRatio: false }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>热门知识点 (Top 10)</Card.Title>
              <div style={{ height: '300px' }}>
                <Bar
                  data={barData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <Card className={`shadow-sm border-start border-4 border-${color} h-100`}>
      <Card.Body className="d-flex align-items-center">
        <div
          className={`bg-${color} bg-opacity-10 p-3 rounded-circle me-3 display-6`}
        >
          {icon}
        </div>
        <div>
          <h6 className="text-muted mb-1">{title}</h6>
          <h3 className="mb-0 fw-bold">{value}</h3>
        </div>
      </Card.Body>
    </Card>
  );
}

const style = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
    height: '30vh',
    border: '1px solid #000',
    borderRadius: '10px',
    padding: '20px',
    marginTop: '10vh',
  },
};
