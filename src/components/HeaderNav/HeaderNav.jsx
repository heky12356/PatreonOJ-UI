import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Input, Button } from "antd";
import { 
  HomeOutlined, 
  BookOutlined, 
  QuestionCircleOutlined, 
  AppstoreOutlined, 
  TrophyOutlined,
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons';
import "./HeaderNav.css";

const { Search } = Input;

const HeaderNav = () => {
  const navigate = useNavigate();

  const onSearch = (value, _e, info) => {
    console.log(info?.source, value);
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
          <NavLink className="nav-link" to="/study">
            <BookOutlined className="me-1" />学习
          </NavLink>
          <NavLink className="nav-link" to="/problem">
            <QuestionCircleOutlined className="me-1" />题目
          </NavLink>
          <NavLink className="nav-link" to="/questionBank">
            <AppstoreOutlined className="me-1" />题库
          </NavLink>
          <NavLink className="nav-link" to="/rank">
            <TrophyOutlined className="me-1" />排行榜
          </NavLink>
        </div>
        
        <div className="navbar-search">
          <Search
            placeholder="搜索题目..."
            onSearch={onSearch}
            enterButton={<SearchOutlined />}
            style={{ width: '280px' }}
            size="middle"
          />
        </div>
        
        <div className="navbar-nav ms-auto d-flex flex-row">
          <NavLink className="nav-link" to="/profile">
            <UserOutlined className="me-1" />个人中心
          </NavLink>
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
        </div>
      </div>
    </nav>
  );
};

export default HeaderNav;
