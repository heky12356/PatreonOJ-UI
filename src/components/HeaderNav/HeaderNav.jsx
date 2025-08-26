import { useState, useEffect } from "react";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { getUserInfo, clearUserInfo } from "../../api/user";


const UserPanel = ({ userInfo, setIsLogin, setUserInfo }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  // 检查用户是否为管理员
  useEffect(() => {
    if (userInfo?.permissions?.includes("admin")) {
      setIsAdmin(true);
    }
  }, [userInfo]);

  // 退出登录
  const handleLogout = () => {
    clearUserInfo();
    setUserInfo(null);
    setIsLogin(false);
    window.location.href = "/";
  };

  return (
    <NavDropdown title={userInfo?.username} id="basic-nav-dropdown">
      <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
      {/* <NavDropdown.Item href="/rank">Rank</NavDropdown.Item> */}
      {isAdmin && (
        <NavDropdown.Item href="/admin">Admin</NavDropdown.Item>
      )}
      <NavDropdown.Divider />
      <NavDropdown.Item href="#" onClick={handleLogout}>
        Logout
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
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container >
        <Navbar.Brand href="/">
          <img
            alt=""
            src="../../public/images/tgu.jpg"
            width="35"
            height="35"
            className="d-inline-block align-top"
            style={{ 
              borderRadius: "100",
              marginRight: "10px"
            }}
          />
          Tgu-OJ
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/problem">Problem</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        {isLogin ? (
          <UserPanel userInfo={userInfo} setIsLogin={setIsLogin} setUserInfo={setUserInfo} />
        ) : (
          <Nav>
            <Nav.Link href="/login">Login</Nav.Link>
            <Nav.Link href="/register">Register</Nav.Link>
          </Nav>
        )}
      </Container>
    </Navbar>
  );
};

