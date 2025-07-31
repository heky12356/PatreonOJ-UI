import React from "react";
import { Menu } from "antd";
import {
  BookOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  BookOutlined as BookOutlined2,
  TrophyOutlined,
} from "@ant-design/icons";
import "./SideMenu.css";

const siderMenuItems = [
  {
    key: "1",
    icon: <BookOutlined />,
    label: "Happy Coding",
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
    key: "2",
    icon: <BookOutlined2 />,
    label: "学习",
  },
  {
    key: "5",
    icon: <TrophyOutlined />,
    label: "竞赛",
  },
];

const SideMenu = ({ currentKey, setCurrentKey }) => {
  return (
    <Menu
      mode="inline"
      selectedKeys={[currentKey]}
      onClick={(e) => setCurrentKey(e.key)}
      items={siderMenuItems.map((item) => ({
        ...item,
        style: { color: "#000" },
      }))}
      className="side-menu"
    />
  );
};

export default SideMenu;
