import React, { useEffect, useState } from 'react';
import { Alert, Col, Container, Image, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCog, FaList, FaSync, FaUser } from 'react-icons/fa';
import { getUserByUuid, getUserId, isLoggedIn } from '../../api/user.js';
import { getUserLearningFeedback } from '../../api/learning.js';
import { EmptyState, ErrorState, LoadingState } from '../../components/feedback/AsyncState.jsx';
import { getRequestErrorMessage } from '../../utils/request.js';
import styles from './profile.module.css';

const normalizePermissions = (permissions) => {
  if (Array.isArray(permissions)) {
    return permissions.filter(Boolean);
  }

  return String(permissions || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const getStatusMeta = (status) => {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'active') {
    return {
      text: '正常',
      className: styles.badgeSuccess,
    };
  }
  if (normalized === 'disabled') {
    return {
      text: '已禁用',
      className: styles.badgeDanger,
    };
  }
  return {
    text: status || '未知',
    className: styles.badge,
  };
};

export default function Profile({ uuid } = {}) {
  const operatorUuid = getUserId();
  const targetUuid = uuid || operatorUuid;

  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  const [learningLoading, setLearningLoading] = useState(false);
  const [learningError, setLearningError] = useState('');
  const [learningFeedback, setLearningFeedback] = useState(null);

  const fetchUser = async () => {
    if (!targetUuid) return;
    setUserLoading(true);
    setUserError('');
    try {
      const data = await getUserByUuid(targetUuid, {
        operator_uuid: operatorUuid,
      });
      setUserProfile(data?.result ?? null);
    } catch (error) {
      setUserError(getRequestErrorMessage(error, '获取用户资料失败'));
      setUserProfile(null);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchLearningFeedback = async () => {
    if (!targetUuid) return;
    setLearningLoading(true);
    setLearningError('');
    try {
      const response = await getUserLearningFeedback({
        uuid: targetUuid,
        limit: 5,
      });
      setLearningFeedback(response?.data ?? null);
    } catch (error) {
      setLearningError(getRequestErrorMessage(error, '获取学习反馈失败'));
      setLearningFeedback(null);
    } finally {
      setLearningLoading(false);
    }
  };

  const reloadAll = async () => {
    await Promise.all([fetchUser(), fetchLearningFeedback()]);
  };

  useEffect(() => {
    if (!targetUuid) return;
    void reloadAll();
  }, [targetUuid]);

  const weakSkills = learningFeedback?.weak_skills ?? [];
  const masteredSkills = learningFeedback?.mastered_skills ?? [];
  const nextQuestions = learningFeedback?.next_questions ?? [];
  const recommendedDirections =
    weakSkills.length > 0
      ? weakSkills
      : masteredSkills.length > 0
        ? masteredSkills
        : [];
  const hasFeedbackContent = Boolean(
    learningFeedback?.stage ||
      learningFeedback?.positive_feedback ||
      weakSkills.length > 0 ||
      masteredSkills.length > 0 ||
      nextQuestions.length > 0
  );

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

  const permissions = normalizePermissions(userProfile?.permissions);
  const currentAvatar =
    userProfile?.avatar_url ||
    'https://api.dicebear.com/7.x/miniavs/svg?seed=user';
  const statusMeta = getStatusMeta(userProfile?.status);

  return (
    <div className={styles.container}>
      <Container>
        <div className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>个人中心</h2>
            <div className={styles.pageSubtitle}>用户资料与学习反馈</div>
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
              onClick={() => void reloadAll()}
              disabled={userLoading || learningLoading}
            >
              <FaSync
                className={`me-2 ${userLoading || learningLoading ? 'fa-spin' : ''}`}
              />
              {userLoading || learningLoading ? '刷新中' : '刷新'}
            </button>
          </div>
        </div>

        <Row className="g-4">
          <Col xs={12} lg={4}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className="d-flex align-items-center gap-2">
                  <FaUser className="text-muted" /> 用户资料
                </span>
                {userLoading ? <Spinner size="sm" /> : null}
              </div>
              <div className={styles.cardBody}>
                {userError ? (
                  <ErrorState
                    title="资料加载失败"
                    message={userError}
                    onRetry={() => void fetchUser()}
                  />
                ) : userLoading && !userProfile ? (
                  <LoadingState text="正在加载用户资料..." />
                ) : userProfile ? (
                  <div className="d-flex flex-column gap-4">
                    <div className="d-flex align-items-center gap-3 pb-3 border-bottom">
                      <Image
                        src={currentAvatar}
                        roundedCircle
                        width={88}
                        height={88}
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
                        <div className="text-muted small">
                          @{userProfile.username || '未设置用户名'}
                        </div>
                        <div className="mt-2">
                          <span className={statusMeta.className}>
                            状态：{statusMeta.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <div className={styles.userInfoLabel}>昵称</div>
                        <div className={styles.userInfoValue}>
                          {userProfile.nickname || '未设置'}
                        </div>
                      </div>

                      <div className={styles.infoItem}>
                        <div className={styles.userInfoLabel}>用户名</div>
                        <div className={styles.userInfoValue}>
                          {userProfile.username || '未设置'}
                        </div>
                      </div>

                      <div className={styles.infoItem}>
                        <div className={styles.userInfoLabel}>邮箱</div>
                        <div className={styles.userInfoValue}>
                          {userProfile.email || '未设置'}
                        </div>
                      </div>

                      <div className={styles.infoItem}>
                        <div className={styles.userInfoLabel}>UUID</div>
                        <div
                          className={`${styles.userInfoValue} ${styles.monospaceText}`}
                        >
                          {userProfile.username || '—'}
                        </div>
                      </div>

                      <div className={styles.infoItem}>
                        <div className={styles.userInfoLabel}>权限</div>
                        <div className={styles.tagWrap}>
                          {permissions.length > 0 ? (
                            permissions.map((permission) => (
                              <span className={styles.badge} key={permission}>
                                {permission}
                              </span>
                            ))
                          ) : (
                            <span className={styles.emptyText}>暂无权限信息</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="暂无用户资料"
                    description="当前没有可展示的用户资料。"
                  />
                )}
              </div>
            </div>
          </Col>

          <Col xs={12} lg={8}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span>学习反馈</span>
                {learningLoading ? <Spinner size="sm" /> : null}
              </div>
              <div className={styles.cardBody}>
                {learningError ? (
                  <ErrorState
                    title="学习反馈加载失败"
                    message={learningError}
                    onRetry={() => void fetchLearningFeedback()}
                  />
                ) : learningLoading && !learningFeedback ? (
                  <LoadingState text="正在加载学习反馈..." />
                ) : !hasFeedbackContent ? (
                  <EmptyState
                    title="暂无学习反馈"
                    description="完成一些题目后，这里会展示你的薄弱点、推荐方向和推荐题目。"
                  />
                ) : (
                  <div className="d-flex flex-column gap-4">
                    <div>
                      <div className={styles.sectionTitle}>反馈摘要</div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryStage}>
                          当前阶段：{learningFeedback?.stage || '待生成'}
                        </div>
                        <div className={styles.summaryText}>
                          {learningFeedback?.positive_feedback ||
                            '继续做题，系统会逐步形成更准确的反馈。'}
                        </div>
                      </div>
                    </div>

                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <div className={styles.infoBlock}>
                          <div className={styles.sectionTitle}>近期薄弱点</div>
                          {weakSkills.length > 0 ? (
                            <div className={styles.tagWrap}>
                              {weakSkills.map((skill) => (
                                <span key={skill} className={styles.badgeDanger}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className={styles.emptyText}>
                              当前没有识别到明显薄弱点。
                            </div>
                          )}
                        </div>
                      </Col>

                      <Col xs={12} md={6}>
                        <div className={styles.infoBlock}>
                          <div className={styles.sectionTitle}>推荐方向</div>
                          {recommendedDirections.length > 0 ? (
                            <div className={styles.tagWrap}>
                              {recommendedDirections.map((skill) => (
                                <span key={skill} className={styles.badgePrimary}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className={styles.emptyText}>
                              暂无明确方向，建议先完成推荐题目积累数据。
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>

                    <div>
                      <div className={styles.sectionTitle}>推荐题目</div>
                      {nextQuestions.length > 0 ? (
                        <div className={styles.questionList}>
                          {nextQuestions.map((question) => {
                            const routeId =
                              question?.question_pk ??
                              question?.id ??
                              question?.question_id;

                            return (
                              <Link
                                key={`${question?.question_id}-${routeId}`}
                                to={routeId ? `/problem/${routeId}` : '/problem'}
                                className={styles.questionItem}
                              >
                                <div className={styles.questionHeader}>
                                  <span className={styles.questionTitle}>
                                    {question?.question_id || routeId}.{' '}
                                    {question?.title || '未命名题目'}
                                  </span>
                                  <span className={styles.badge}>
                                    {question?.difficulty || '未知难度'}
                                  </span>
                                </div>
                                <div className={styles.questionReason}>
                                  {question?.reason || '适合作为下一步练习题。'}
                                </div>
                                {question?.tags ? (
                                  <div className={styles.questionMeta}>
                                    标签：{question.tags}
                                  </div>
                                ) : null}
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <EmptyState
                          title="暂无推荐题目"
                          description="系统暂时没有可推荐的题目。"
                        />
                      )}
                    </div>

                    {masteredSkills.length > 0 ? (
                      <div>
                        <div className={styles.sectionTitle}>已掌握方向</div>
                        <div className={styles.tagWrap}>
                          {masteredSkills.map((skill) => (
                            <span key={skill} className={styles.badgeSuccess}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
