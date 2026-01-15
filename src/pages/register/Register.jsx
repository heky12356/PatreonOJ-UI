//pages/Register.jsx
import React, { useState } from 'react';
import { register } from '../../api/user';
import { Form, Button, Container, Col, Row } from 'react-bootstrap';

const Register = () => {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 注册状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 表单验证
    if (!username || !password || !confirmPassword) {
      setError('用户名、密码和确认密码不能为空');
      return;
    }
    if (password !== confirmPassword) {
      setError('密码和确认密码不匹配');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 实际注册API调用
      await register(username, password);

      // 注册成功，跳转到登录页
      window.location.href = '/login';
    } catch (err) {
      // console.error("注册失败:", err);
      setError(err.response?.data?.error || '注册失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs lg="6">
          <div style={RegisterBox}>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>用户名：</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="请输入用户名"
                  onChange={handleUsernameChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>密码：</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="请输入密码"
                  onChange={handlePasswordChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>确认密码：</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="请确认密码"
                  onChange={handleConfirmPasswordChange}
                />
              </Form.Group>
              {error && (
                <div style={{ color: 'red', margin: '2px' }}>{error}</div>
              )}
              <Button variant="primary" type="submit">
                注册
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

const RegisterBox = {
  marginTop: '10vh',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '20px',
};

export default Register;
