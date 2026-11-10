import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, message } from 'antd';
import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  CodeOutlined,
  CopyOutlined,
  FileTextOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import remarkGfm from 'remark-gfm';
import MDEditor from '@uiw/react-md-editor';
import { FaLightbulb, FaTags } from 'react-icons/fa';
import CodeEditor from '../../components/codeEditor/CodeEditor';
import { EmptyState, ErrorState, LoadingState } from '../../components/feedback/AsyncState.jsx';
import { getProblemById } from '../../api/getproblem';
import { getProblemRecommendations } from '../../api/learning.js';
import useCurrentUserUuid from '../../hooks/useCurrentUserUuid.js';
import useMyProblemStatuses from '../../hooks/useMyProblemStatuses.js';
import { getUserId, isLoggedIn } from '../../api/user';

import { getRequestErrorMessage } from '../../utils/request.js';
import styles from './ProblemPage.module.css';

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [recommendations, setRecommendations] = useState([]);
  const userUuid = useCurrentUserUuid();
  const statuses = useMyProblemStatuses([question?.id]);
  const solveStatus = statuses[question?.id] || 'unknown';

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProblemById(id);
      setQuestion(data?.data || null);
    } catch (err) {
      setError(getRequestErrorMessage(err, '加载题目失败'));
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      void fetchQuestion();
    }
  }, [id]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!question?.id || !isLoggedIn()) {
        setRecommendations([]);
        return;
      }

      try {
        const resp = await getProblemRecommendations({
          uuid: getUserId(),
          id: question.id,
          questionId: question.question_id,
          limit: 5,
        });
        setRecommendations(resp?.data?.recommendations ?? []);
      } catch {
        setRecommendations([]);
      }
    };

    void fetchRecommendations();
  }, [question, userUuid]);

  const handleCopyProblem = async () => {
    if (!question) return;

    const textToCopy = `${question.question_id || question.id} ${question.title}\n\n${question.content || ''}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      message.success('题目信息已复制到剪贴板');
    } catch {
      message.error('复制失败，请手动复制');
    }
  };

  const handleCodeSubmit = () => {
    message.success('代码提交成功');
  };

  const switchToIdeTab = () => {
    setActiveTab('ide');
    message.info('已切换到代码编辑器');
  };

  const handleExit = () => {
    navigate('/problem');
  };

  const handleViewSubmissions = () => {
    navigate(`/problem/${question.id}/submissions`);
  };

  const handleViewGraph = () => {
    navigate(`/problem/${question.id}/graph`);
  };

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

  const getSolveStatusMeta = () => {
    if (!isLoggedIn()) {
      return {
        text: '登录后可查看完成状态',
        className: styles.statusLoginHint,
      };
    }

    if (solveStatus === 'solved') {
      return {
        text: '当前状态：已通过',
        className: styles.statusSolved,
      };
    }

    if (solveStatus === 'attempted') {
      return {
        text: '当前状态：未通过',
        className: styles.statusAttempted,
      };
    }

    if (solveStatus === 'unsolved') {
      return {
        text: '当前状态：未做',
        className: styles.statusUnsolved,
      };
    }

    return {
      text: '当前状态：暂不可用',
      className: styles.statusUnknown,
    };
  };

  if (loading) {
    return (
      <div className={styles.content}>
        <LoadingState text="正在加载题目..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.content}>
        <ErrorState title="题目加载失败" message={error} onRetry={() => void fetchQuestion()} />
      </div>
    );
  }

  if (!question) {
    return (
      <div className={styles.content}>
        <EmptyState
          title="题目不存在"
          description="没有找到对应题目，可能已被删除或暂未发布。"
          action={
            <button
              type="button"
              className={`${styles.btn} ${styles['btn-outline']}`}
              onClick={handleExit}
            >
              返回题库
            </button>
          }
        />
      </div>
    );
  }

  const solveStatusMeta = getSolveStatusMeta();

  return (
    <div className={styles.content}>
      <div className={styles['problem-header']}>
        <div className={styles.titleRow}>
          <h1>{question.question_id || question.id}. {question.title}</h1>
          <span role="status" className={`${styles.problemStatusBadge} ${solveStatusMeta.className}`}>{solveStatusMeta.text.replace('当前状态：', '')}</span>
        </div>
        <div className={styles['problem-meta']}>
          <div className={styles['problem-info']}>
            <div className={styles['info-item']}>
              <strong>难度:</strong>
              <span
                className={`${styles['difficulty-badge']} ${getDifficultyClass(
                  question.difficulty
                )}`}
              >
                {question.difficulty}
              </span>
            </div>
            <div className={styles['info-item']}>
              <strong>时间限制:</strong> {question.time_limit}ms
            </div>
            <div className={styles['info-item']}>
              <strong>内存限制:</strong> {question.memory_limit}MB
            </div>
          </div>

          <div className={styles['problem-actions']}>
            <button
              className={`${styles.btn} ${styles['btn-danger']}`}
              onClick={handleExit}
            >
              <ArrowLeftOutlined /> 返回
            </button>

            <button
              className={`${styles.btn} ${styles['btn-outline']}`}
              onClick={handleCopyProblem}
            >
              <CopyOutlined /> 复制
            </button>
            <button
              className={`${styles.btn} ${styles['btn-outline']}`}
              onClick={handleViewSubmissions}
            >
              <HistoryOutlined /> 提交记录
            </button>
            <button
              className={`${styles.btn} ${styles['btn-outline']}`}
              onClick={handleViewGraph}
            >
              <ApartmentOutlined /> 学习图谱
            </button>
            <button
              className={`${styles.btn} ${styles['btn-primary']}`}
              onClick={switchToIdeTab}
            >
              <CodeOutlined /> 开始编程
            </button>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className={styles['problem-tabs']}
        items={[
          {
            key: 'description',
            label: (
              <span
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FileTextOutlined />
                题目描述
              </span>
            ),
            children: (
              <div className={styles['tab-content']}>
                <div className={styles['problem-content']}>
                  <div className={styles['problem-description']}>
                    <MDEditor.Markdown
                      source={question.content || ''}
                      remarkPlugins={[remarkGfm]}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#333',
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      }}
                    />
                  </div>
                </div>

                <div className={styles['problem-sidebar']}>
                  <div className={styles['sidebar-card']}>
                    <div className={styles['sidebar-title']}>
                      <FaTags color="#51624f" /> 标签
                    </div>
                    <div className={styles['tag-list']}>
                      {parseTags(question.tags).length > 0 ? (
                        parseTags(question.tags).map((tag, index) => (
                          <span key={index} className={styles.tag}>
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-secondary small">暂无标签</span>
                      )}
                    </div>
                  </div>

                  <div className={styles['sidebar-card']}>
                    <div className={styles['sidebar-title']}>
                      <FaLightbulb color="#f57f17" /> 推荐题目
                    </div>
                    {recommendations.length > 0 ? (
                      <ul className={styles['recommendation-list']}>
                        {recommendations.map((rec) => {
                          const recId =
                            rec?.question_pk ?? rec?.id ?? rec?.question_id;
                          if (!recId) return null;

                          return (
                            <li
                              key={String(recId)}
                              className={styles['recommendation-item']}
                            >
                              <a
                                href={`/problem/${recId}`}
                                className={styles['rec-link']}
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(`/problem/${recId}`);
                                }}
                              >
                                <span>
                                  {rec?.question_id || recId}.{' '}
                                  {rec?.title || '-'}
                                </span>
                                <span
                                  className={`${styles['difficulty-badge']} ${getDifficultyClass(
                                    rec?.difficulty
                                  )}`}
                                >
                                  {rec?.difficulty || '-'}
                                </span>
                              </a>
                              <div className={styles['rec-reason']}>
                                {rec?.reason || '暂无推荐说明'}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <EmptyState
                        title="暂无推荐"
                        description="继续做题后，这里会出现更贴近你的推荐内容。"
                      />
                    )}
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: 'ide',
            label: (
              <span
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <CodeOutlined />
                代码编辑器
              </span>
            ),
            children: (
              <div
                className={`${styles['tab-content']} ${styles.codeEditor}`}
              >
                <CodeEditor problem={question} onSubmit={handleCodeSubmit} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

export default ProblemPage;
