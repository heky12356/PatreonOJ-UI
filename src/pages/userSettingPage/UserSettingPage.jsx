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
  uploadUserAvatarAndUpdateUserByUuid,
} from '../../api/user.js';

export default function UserSettingPage() {
  const operatorUuid = getUserId();
  const targetUuid = operatorUuid;

  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [feedback, setFeedback] = useState(null);

  const parseAxiosError = (error, fallback = '请求失败') => {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback;
    return String(msg);
  };

  const fetchUser = async () => {
    if (!targetUuid) return;
    setUserLoading(true);
    setUserError('');
    try {
      const data = await getUserByUuid(targetUuid, {
        operator_uuid: operatorUuid,
      });
      setUserProfile(data?.result ?? null);
    } catch (e) {
      setUserError(parseAxiosError(e, '获取用户信息失败'));
      setUserProfile(null);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
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
    } catch (e) {
      setFeedback({ type: 'danger', text: parseAxiosError(e, '头像更新失败') });
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
          <div className="text-secondary small">头像设置</div>
        </Col>
        <Col xs={12} md="auto" className="d-flex gap-2">
          <Button as={Link} to="/profile" variant="outline-secondary">
            返回个人中心
          </Button>
          <Button
            variant="outline-secondary"
            onClick={fetchUser}
            disabled={userLoading || uploading}
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
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <span>当前头像</span>
              {userLoading ? <Spinner size="sm" /> : null}
            </Card.Header>
            <Card.Body>
              {userError ? <Alert variant="danger">{userError}</Alert> : null}
              <div className="d-flex align-items-center gap-3">
                <Image
                  src={currentAvatar}
                  roundedCircle
                  width={96}
                  height={96}
                  alt="avatar"
                />
                <div className="text-secondary small">
                  {userProfile?.nickname ||
                    userProfile?.username ||
                    userProfile?.uuid ||
                    targetUuid}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={6}>
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
