import { useState, useEffect } from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUserInfo, clearUserInfo } from '../../api/user';
import logoUrl from '../../assets/tgu.jpg';
import styles from './HeaderNav.module.css';

const UserPanel = ({ userInfo, setIsLogin, setUserInfo }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // 检查用户是否为管理员
  useEffect(() => {
    if (userInfo?.permissions?.includes('admin')) {
      setIsAdmin(true);
    }
  }, [userInfo]);

  // 退出登录
  const handleLogout = (e) => {
    e.preventDefault();
    clearUserInfo();
    setUserInfo(null);
    setIsLogin(false);
    navigate('/');
  };

  return (
    <NavDropdown
      title={userInfo?.username}
      id="basic-nav-dropdown"
      className={styles.userDropdown}
      align="end"
    >
      <NavDropdown.Item as={Link} to="/profile">
        个人信息
      </NavDropdown.Item>
      <NavDropdown.Item as={Link} to="/settings">
        设置
      </NavDropdown.Item>
      {/* <NavDropdown.Item as={Link} to="/rank">Rank</NavDropdown.Item> */}
      {isAdmin && (
        <NavDropdown.Item as={Link} to="/admin">
          管理员面板
        </NavDropdown.Item>
      )}
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
  const location = useLocation();

  // 获取用户信息
  useEffect(() => {
    const info = getUserInfo();
    setUserInfo(info);
    if (info) {
      setIsLogin(true);
    }
  }, []);

  return (
    <Navbar expand="lg" className={`${styles.headerNavbar} mb-4`}>
      <Container>
        <Navbar.Brand as={Link} to="/" className={styles.brand}>
          <img
            alt="Tgu-OJ Logo"
            src={logoUrl}
            width="35"
            height="35"
            className={`d-inline-block align-top ${styles.brandLogo}`}
          />
          Tgu-OJ
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              className={`${styles.navLink} ${location.pathname === '/' ? styles.navLinkActive : ''}`}
            >
              首页
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/problem"
              className={`${styles.navLink} ${location.pathname.startsWith('/problem') ? styles.navLinkActive : ''}`}
            >
              题库
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/graph"
              className={`${styles.navLink} ${location.pathname.startsWith('/graph') ? styles.navLinkActive : ''}`}
            >
              知识图谱
            </Nav.Link>
          </Nav>
          {isLogin ? (
            <UserPanel
              userInfo={userInfo}
              setIsLogin={setIsLogin}
              setUserInfo={setUserInfo}
            />
          ) : (
            <Nav className="align-items-center">
              <Nav.Link as={Link} to="/login" className={styles.authLink}>
                登录
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/register"
                className={`${styles.authLink} ${styles.authLinkPrimary}`}
              >
                注册
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
