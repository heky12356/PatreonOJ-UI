//pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { login, saveUserInfo, mockLogin } from '../../api/user';
import { Form, Button, Container, Col, Row } from 'react-bootstrap';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 登录状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  //处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;
      response = await login(username, password);

      // 保存用户信息到本地存储
      saveUserInfo(response);

      // 登录成功提示
      // console.log("登录成功:", response);

      // 跳转到重定向首页
      window.location.href = '/';
    } catch (err) {
      // console.error("登录失败:", err);
      setError(err.response?.data?.error || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs lg="6">
          <div style={LoginBox}>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>用户名</Form.Label>
                <Form.Control
                  onChange={handleUsernameChange}
                  type="text"
                  placeholder="请输入用户名"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>密码</Form.Label>
                <Form.Control
                  onChange={handlePasswordChange}
                  type="password"
                  placeholder="请输入密码"
                />
              </Form.Group>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              <Button variant="primary" type="submit">
                登录
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

const LoginBox = {
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

export default Login;
