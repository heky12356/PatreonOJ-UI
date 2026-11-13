import { useEffect, useState } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { message } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  logout,
  getUserInfo,
  getUserInfoUpdatedEventName,
} from '../../api/user';
import logoUrl from '../../assets/tgu.jpg';
import styles from './HeaderNav.module.css';
import useSiteSettings from '../../site/useSiteSettings.js';

const UserPanel = ({ userInfo, setIsLogin, setUserInfo }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAdmin(Boolean(userInfo?.permissions?.includes('admin')));
  }, [userInfo]);

  const handleLogout = async (e) => {
    e.preventDefault();
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      setUserInfo(null);
      setIsLogin(false);
      navigate('/');
    } catch {
      message.error('退出登录失败，请重试');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <NavDropdown
      title={userInfo?.nickname || userInfo?.username}
      id="basic-nav-dropdown"
      className={styles.userDropdown}
      align="end"
    >
      <NavDropdown.Item as={Link} to={'/users/' + userInfo?.uuid}>我的主页</NavDropdown.Item>
      <NavDropdown.Item as={Link} to="/profile">
        个人信息
      </NavDropdown.Item>
      <NavDropdown.Item as={Link} to="/settings">
        设置
      </NavDropdown.Item>
      {isAdmin ? (
        <NavDropdown.Item as={Link} to="/admin">
          管理员面板
        </NavDropdown.Item>
      ) : null}
      <NavDropdown.Divider />
      <NavDropdown.Item href="#" onClick={handleLogout} disabled={loggingOut}>
        {loggingOut ? '正在退出…' : '退出登录'}
      </NavDropdown.Item>
    </NavDropdown>
  );
};

export default function HeaderNav() {
  const { theme } = useSiteSettings();
  const [userInfo, setUserInfo] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const syncUserInfo = () => {
      const info = getUserInfo();
      setUserInfo(info);
      setIsLogin(Boolean(info));
    };

    const handleUserInfoUpdated = () => {
      syncUserInfo();
    };

    syncUserInfo();
    window.addEventListener('storage', handleUserInfoUpdated);
    window.addEventListener(
      getUserInfoUpdatedEventName(),
      handleUserInfoUpdated
    );

    return () => {
      window.removeEventListener('storage', handleUserInfoUpdated);
      window.removeEventListener(
        getUserInfoUpdatedEventName(),
        handleUserInfoUpdated
      );
    };
  }, []);

  return (
    <Navbar expand="lg" className={`${styles.headerNavbar} site-navbar`}>
      <Container>
        <Navbar.Brand as={Link} to="/" className={styles.brand}>
          <img
            alt="Tgu-OJ Logo"
            src={logoUrl}
            width="35"
            height="35"
            className={`d-inline-block align-top ${styles.brandLogo}`}
          />
          <span className="site-brand-copy"><span className="site-brand-name">{theme.brand?.name || 'Tgu-OJ'}</span>{theme.brand?.subtitle && <small className="site-brand-subtitle">{theme.brand.subtitle}</small>}</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" label="切换导航" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              aria-current={location.pathname === '/' ? 'page' : undefined}
              className={`${styles.navLink} ${location.pathname === '/' ? styles.navLinkActive : ''}`}
            >
              首页
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/problem"
              aria-current={location.pathname.startsWith('/problem') && !location.pathname.endsWith('/graph') ? 'page' : undefined}
              className={`${styles.navLink} ${location.pathname.startsWith('/problem') && !location.pathname.endsWith('/graph') ? styles.navLinkActive : ''}`}
            >
              题库
            </Nav.Link>
            <Nav.Link as={Link} to="/graph" aria-current={location.pathname === '/graph' || location.pathname.endsWith('/graph') ? 'page' : undefined} className={`${styles.navLink} ${location.pathname === '/graph' || location.pathname.endsWith('/graph') ? styles.navLinkActive : ''}`}>知识图谱</Nav.Link>
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
