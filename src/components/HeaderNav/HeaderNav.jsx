import { useState, useEffect } from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { getUserInfo, clearUserInfo } from '../../api/user';
import logoUrl from '../../assets/tgu.jpg';

const UserPanel = ({ userInfo, setIsLogin, setUserInfo }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  // 检查用户是否为管理员
  useEffect(() => {
    if (userInfo?.permissions?.includes('admin')) {
      setIsAdmin(true);
    }
  }, [userInfo]);

  // 退出登录
  const handleLogout = () => {
    clearUserInfo();
    setUserInfo(null);
    setIsLogin(false);
    window.location.href = '/';
  };

  return (
    <NavDropdown title={userInfo?.username} id="basic-nav-dropdown">
      <NavDropdown.Item href="/profile">个人信息</NavDropdown.Item>
      <NavDropdown.Item href="/settings">设置</NavDropdown.Item>
      {/* <NavDropdown.Item href="/rank">Rank</NavDropdown.Item> */}
      {isAdmin && <NavDropdown.Item href="/admin">管理员面板</NavDropdown.Item>}
      <NavDropdown.Divider />
      <NavDropdown.Item href="#" onClick={handleLogout}>
        退出登录
      </NavDropdown.Item>
    </NavDropdown>
  );
};

export default function HeaderNav() {
  const [userInfo, setUserInfo] = useState(null);
  const [isLogin, setIsLogin] = useState(false);

  // 获取用户信息
  useEffect(() => {
    const info = getUserInfo();
    setUserInfo(info);
    if (info) {
      setIsLogin(true);
    }
  }, []);

  return (
    <Navbar expand="lg" className="bg-body-tertiary mb-4">
      <Container>
        <Navbar.Brand href="/">
          <img
            alt=""
            src={logoUrl}
            width="35"
            height="35"
            className="d-inline-block align-top"
            style={{
              borderRadius: '100',
              marginRight: '10px',
            }}
          />
          Tgu-OJ
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">首页</Nav.Link>
            <Nav.Link href="/problem">题库</Nav.Link>
            <Nav.Link href="/graph">知识图谱</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        {isLogin ? (
          <UserPanel
            userInfo={userInfo}
            setIsLogin={setIsLogin}
            setUserInfo={setUserInfo}
          />
        ) : (
          <Nav>
            <Nav.Link href="/login">登录</Nav.Link>
            <Nav.Link href="/register">注册</Nav.Link>
          </Nav>
        )}
      </Container>
    </Navbar>
  );
}
