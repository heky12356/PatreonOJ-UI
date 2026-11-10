import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Image,
  Row,
  Spinner,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  getUserByUuid,
  getUserId,
  isLoggedIn,
  syncCurrentUserInfo,
  updateUserByUuid,
  uploadUserAvatarAndUpdateUserByUuid,
} from '../../api/user.js';

export default function UserSettingPage() {
  const operatorUuid = getUserId();
  const targetUuid = operatorUuid;

  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [showActivity, setShowActivity] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [feedback, setFeedback] = useState(null);

  const parseAxiosError = (error, fallback = '请求失败') => {
    const msg =
      error?.response?.data?.msg ||
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback;
    return String(msg);
  };

  const hydrateProfileForm = (profile) => {
    setNickname(profile?.nickname ?? '');
    setEmail(profile?.email ?? '');
    setShowActivity(profile?.show_activity ?? true);
  };

  const fetchUser = async () => {
    if (!targetUuid) return null;
    setUserLoading(true);
    setUserError('');
    try {
      const data = await getUserByUuid(targetUuid, {
        operator_uuid: operatorUuid,
      });
      const profile = data?.result ?? null;
      setUserProfile(profile);
      hydrateProfileForm(profile);
      return profile;
    } catch (error) {
      setUserError(parseAxiosError(error, '获取用户信息失败'));
      setUserProfile(null);
      return null;
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    void fetchUser();
  }, [targetUuid]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!targetUuid) return;

    setSavingProfile(true);
    setFeedback(null);
    try {
      const response = await updateUserByUuid(
        targetUuid,
        {
          nickname: nickname.trim(),
          email: email.trim(),
          show_activity: showActivity,
        },
        {
          operator_uuid: operatorUuid,
        }
      );

      const updatedProfile = response?.result ?? null;
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        hydrateProfileForm(updatedProfile);
        if (operatorUuid === targetUuid) {
          syncCurrentUserInfo(updatedProfile);
        }
      } else {
        const latest = await fetchUser();
        if (latest && operatorUuid === targetUuid) {
          syncCurrentUserInfo(latest);
        }
      }

      setFeedback({ type: 'success', text: '资料保存成功' });
    } catch (error) {
      setFeedback({
        type: 'danger',
        text: parseAxiosError(error, '资料保存失败'),
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpload = async () => {
    if (!targetUuid || !selectedFile) return;
    setUploading(true);
    setFeedback(null);
    try {
      await uploadUserAvatarAndUpdateUserByUuid(targetUuid, selectedFile, {
        operator_uuid: operatorUuid,
        path: `avatars/${targetUuid}`,
      });
      setSelectedFile(null);
      setFeedback({ type: 'success', text: '头像更新成功' });
      await fetchUser();
    } catch (error) {
      setFeedback({
        type: 'danger',
        text: parseAxiosError(error, '头像更新失败'),
      });
    } finally {
      setUploading(false);
    }
  };

  if (!isLoggedIn()) {
    return (
      <Container className="py-4">
        <Alert variant="warning" className="mb-0">
          请先 <Link to="/login">登录</Link> 后再进入设置。
        </Alert>
      </Container>
    );
  }

  const currentAvatar =
    userProfile?.avatar_url ||
    'https://api.dicebear.com/7.x/miniavs/svg?seed=user';

  return (
    <Container className="py-4">
      <Row className="align-items-center g-2 mb-3">
        <Col xs={12} md>
          <h2 className="mb-0">用户设置</h2>
          <div className="text-secondary small">基础资料与头像设置</div>
        </Col>
        <Col xs={12} md="auto" className="d-flex gap-2">
          <Button as={Link} to="/profile" variant="outline-secondary">
            返回个人中心
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => void fetchUser()}
            disabled={userLoading || uploading || savingProfile}
          >
            {userLoading ? (
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
              <span>当前资料</span>
              {userLoading ? <Spinner size="sm" /> : null}
            </Card.Header>
            <Card.Body>
              {userError ? <Alert variant="danger">{userError}</Alert> : null}
              <div className="d-flex flex-column align-items-start gap-3">
                <Image
                  src={currentAvatar}
                  roundedCircle
                  width={96}
                  height={96}
                  alt="avatar"
                />
                <div>
                  <div className="fw-semibold">
                    {userProfile?.nickname ||
                      userProfile?.username ||
                      userProfile?.uuid ||
                      targetUuid}
                  </div>
                  <div className="text-secondary small">
                    {userProfile?.email || '未设置邮箱'}
                  </div>
                  <div className="text-secondary small font-monospace mt-1">
                    {userProfile?.username || '—'}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={8}>
          <Card className="mb-3">
            <Card.Header>编辑基础资料</Card.Header>
            <Card.Body>
              <Form onSubmit={handleProfileSave}>
                <Form.Check id="show-activity" type="switch" label="公开做题详情" checked={showActivity} disabled={savingProfile || userLoading} onChange={(event) => setShowActivity(event.target.checked)} />
                <p className="text-secondary small mt-2 mb-4">默认公开。关闭后，其他用户只能查看基础资料，无法查看你的做题统计、题目记录和提交详情。保存资料后生效。</p>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label>昵称</Form.Label>
                      <Form.Control
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="请输入昵称"
                        disabled={savingProfile}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label>邮箱</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="请输入邮箱"
                        disabled={savingProfile}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2 mt-3">
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        保存中
                      </>
                    ) : (
                      '保存资料'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => hydrateProfileForm(userProfile)}
                    disabled={savingProfile}
                  >
                    重置
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>上传新头像</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>选择图片</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  disabled={uploading}
                />
              </Form.Group>

              {previewUrl ? (
                <div className="mb-3">
                  <div className="text-secondary small mb-2">预览</div>
                  <Image
                    src={previewUrl}
                    roundedCircle
                    width={96}
                    height={96}
                    alt="preview"
                  />
                </div>
              ) : null}

              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? '上传中...' : '上传并保存'}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setSelectedFile(null)}
                  disabled={!selectedFile || uploading}
                >
                  清空
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
