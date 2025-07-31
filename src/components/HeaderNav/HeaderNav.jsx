import React from "react";
import { Menu } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./HeaderNav.css";

const HeaderNav = ({ currentKey, setCurrentKey }) => {
  const menuItems = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: "主页",
    },
    {
      key: "2",
      icon: <BookOutlined />,
      label: "学习",
    },
    {
      key: "3",
      icon: <QuestionCircleOutlined />,
      label: "问题",
    },
    {
      key: "4",
      icon: <FileTextOutlined />,
      label: "题库",
    },
    {
      key: "5",
      icon: <TrophyOutlined />,
      label: "竞赛",
    },
    {
      key: "6",
      icon: <UserOutlined />,
      label: "排名",
    },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        className="demo-logo"
        style={{
          fontSize: "30px",
          fontWeight: "bold",
          color: "#090707",
          marginRight: "12px",
        }}
      >
        <img src="/images/logo.png" style={{width:40,height:40,}} />
        Patreon 算法平台
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[currentKey]}
        onClick={(e) => setCurrentKey(e.key)}
        items={menuItems}
        className="header-nav-menu"
      />
    </div>
  );
};

export default HeaderNav;
