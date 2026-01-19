import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, message } from 'antd';
import {
  ArrowLeftOutlined,
  CodeOutlined,
  FileTextOutlined,
  CopyOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import CodeEditor from '../../components/codeEditor/CodeEditor';
import {
  getProblemById,
  getProblemRecommendations,
} from '../../api/getproblem';
import styles from './ProblemPage.module.css';
import remarkGfm from 'remark-gfm';
import MDEditor from '@uiw/react-md-editor';
import { FaTags, FaLightbulb } from 'react-icons/fa';

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [recommendations, setRecommendations] = useState([]);

  // 获取题目详情
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const data = await getProblemById(id);
        setQuestion(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuestion();
    }
  }, [id]);

  // 获取推荐题目
  useEffect(() => {
    if (question && question.question_number) {
      getProblemRecommendations(question.question_number)
        .then((data) => {
          if (data && data.recommendations) {
            setRecommendations(data.recommendations);
          }
        })
        .catch((err) => console.error('获取推荐题目失败:', err));
    }
  }, [question]);

  const handleCopyProblem = async () => {
    if (!question) return;
    const textToCopy = `${question.question_id} ${question.title}\n\n${question.content}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      message.success('题目信息已复制到剪贴板！');
    } catch (err) {
      console.error('复制失败:', err);
      message.error('复制失败，请手动复制');
    }
  };

  /**
   * 处理代码提交
   * @param {Object} submitData - 提交的数据
   */
  const handleCodeSubmit = (submitData) => {
    console.log('代码提交:', submitData);
    message.success('代码提交成功！');
    // 这里可以添加实际的提交逻辑
  };

  /**
   * 切换到IDE标签页
   */
  const switchToIdeTab = () => {
    setActiveTab('ide');
    message.info('已切换到代码编辑器');
  };

  // 退出到题库页面
  const handleExit = () => {
    navigate('/problem');
  };

  const handleViewSubmissions = () => {
    navigate(`/problem/${question.question_number}/submissions`);
  };

  // 解析标签字符串为数组
  const parseTags = (tagsString) => {
    if (!tagsString) return [];
    return tagsString.split(',').map((tag) => tag.trim());
  };

  const getDifficultyClass = (diff) => {
    if (diff === '简单') return styles.easy;
    if (diff === '中等') return styles.medium;
    if (diff === '困难') return styles.hard;
    return '';
  };

  if (loading) {
    return (
      <div className={styles.content}>
        <div className={styles.loading}>加载题目中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.content}>
        <div className={styles.error}>错误: {error}</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className={styles.content}>
        <div className={styles.error}>题目不存在</div>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <div className={styles['problem-header']}>
        <h1>
          {question.question_id}. {question.title}
        </h1>
        <div className={styles['problem-meta']}>
          <div className={styles['problem-info']}>
            <div className={styles['info-item']}>
              <strong>难度:</strong>
              <span
                className={`${styles['difficulty-badge']} ${getDifficultyClass(question.difficulty)}`}
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
              <ArrowLeftOutlined /> 退出
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
                      {parseTags(question.tags).map((tag, index) => (
                        <span key={index} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles['sidebar-card']}>
                    <div className={styles['sidebar-title']}>
                      <FaLightbulb color="#f57f17" /> 推荐题目
                    </div>
                    {recommendations.length > 0 ? (
                      <ul className={styles['recommendation-list']}>
                        {recommendations.map((rec) => (
                          <li
                            key={rec.question_id}
                            className={styles['recommendation-item']}
                          >
                            <a
                              href={`/problem/${rec.question_id}`}
                              className={styles['rec-link']}
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/problem/${rec.question_id}`);
                              }}
                            >
                              <span>
                                {rec.question_id}. {rec.title}
                              </span>
                              <span
                                className={`${styles['difficulty-badge']} ${getDifficultyClass(rec.difficulty)}`}
                              >
                                {rec.difficulty}
                              </span>
                            </a>
                            <div className={styles['rec-reason']}>
                              {rec.reason}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div
                        style={{
                          color: '#999',
                          fontSize: '0.9rem',
                          textAlign: 'center',
                        }}
                      >
                        暂无推荐
                      </div>
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
              <div className={`${styles['tab-content']} ${styles.codeEditor}`}>
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
