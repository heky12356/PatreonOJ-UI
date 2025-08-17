import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Input, Button, Dropdown, Avatar, message } from "antd";
import { 
  HomeOutlined, 
  BookOutlined, 
  QuestionCircleOutlined, 
  AppstoreOutlined, 
  TrophyOutlined,
  UserOutlined,
  SearchOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { getUserInfo, clearUserInfo } from "../../api/user";
import "./HeaderNav.css";

const { Search } = Input;

const HeaderNav = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  // 获取用户信息
  useEffect(() => {
    const info = getUserInfo();
    setUserInfo(info);
  }, []);

  // 搜索处理
  const onSearch = (value, _e, info) => {
    console.log(info?.source, value);
  };
  
  // 退出登录
  const handleLogout = () => {
    clearUserInfo();
    setUserInfo(null);
    message.success('退出登录成功');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">
        <div className="navbar-brand d-flex align-items-center">
          <img src="/images/logo.png" width="40" height="40" alt="logo" className="me-2" />
          <span className="brand-text">Patreon 算法平台</span>
        </div>
        
        <div className="navbar-nav d-flex flex-row">
          <NavLink className="nav-link" to="/" end>
            <HomeOutlined className="me-1" />首页
          </NavLink>
          {/* <NavLink className="nav-link" to="/study">
            <BookOutlined className="me-1" />学习
          </NavLink> */}
          {/* <NavLink className="nav-link" to="/problem">
            <QuestionCircleOutlined className="me-1" />题目
          </NavLink> */}
          <NavLink className="nav-link" to="/questionBank">
            <AppstoreOutlined className="me-1" />题库
          </NavLink>
          {/* <NavLink className="nav-link" to="/rank">
            <TrophyOutlined className="me-1" />排行榜
          </NavLink> */}
        </div>
        
        {/* <div className="navbar-search">
          <Search
            placeholder="搜索题目..."
            onSearch={onSearch}
            enterButton={<SearchOutlined />}
            style={{ width: '280px' }}
            size="middle"
          />
        </div> */}
        
        <div className="navbar-nav ms-auto d-flex flex-row align-items-center">
          {userInfo ? (
            <>
              {/* <NavLink className="nav-link" to="/profile">
                <UserOutlined className="me-1" />个人中心
              </NavLink> */}
              <Dropdown
                menu={{
                  items: [
                    {
                      key: '1',
                      icon: <UserOutlined />,
                      label: (
                        <NavLink to="/profile">个人资料</NavLink>
                      ),
                    },
                    // {
                    //   key: '2',
                    //   icon: <SettingOutlined />,
                    //   label: (
                    //     <NavLink to="/settings">设置</NavLink>
                    //   ),
                    // },
                    {
                      type: 'divider',
                    },
                    {
                      key: '3',
                      icon: <LogoutOutlined />,
                      label: '退出登录',
                      onClick: handleLogout,
                    },
                  ],
                }}
                placement="bottomRight"
              >
                <div className="user-avatar-container">
                  <Avatar 
                    icon={<UserOutlined />} 
                    className="user-avatar"
                  />
                  <span className="user-name">{userInfo.username}</span>
                </div>
              </Dropdown>
            </>
          ) : (
            <>
              <Button 
                type="text" 
                className="auth-button"
                onClick={() => navigate('/login')}
              >
                登录
              </Button>
              <Button 
                type="primary" 
                className="auth-button register-button"
                onClick={() => navigate('/register')}
              >
                注册
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default HeaderNav;
