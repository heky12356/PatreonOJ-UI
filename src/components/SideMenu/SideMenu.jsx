import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeOutlined,
    BookOutlined,
    QuestionCircleOutlined,
    AppstoreOutlined,
    TrophyOutlined,
    UserOutlined,
    PlusOutlined
} from '@ant-design/icons';
import './SideMenu.css';

const menuItems = [
    {
        key: '1',
        icon: <HomeOutlined />,
        label: '首页',
        path: '/'
    },
    // {
    //     key: '2',
    //     icon: <BookOutlined />,
    //     label: '学习',
    //     path: '/study'
    // },
    // {
    //     key: '3',
    //     icon: <QuestionCircleOutlined />,
    //     label: '题目',
    //     path: '/problem'
    // },
    {
        key: '4',
        icon: <AppstoreOutlined />,
        label: '题库',
        path: '/questionBank'
    },
    {
        key: '5',
        icon: <PlusOutlined />,
        label: '添加题目',
        path: '/addproblem'
    },
    // {
    //     key: '6',
    //     icon: <TrophyOutlined />,
    //     label: '排行榜',
    //     path: '/rank'
    // },
    // {
    //     key: '7',
    //     icon: <UserOutlined />,
    //     label: '个人中心',
    //     path: '/profile'
    // },
    {
        key: '8',
        icon: <PlusOutlined />,
        label: '更新题目',
        path: '/updateproblem'
    },
];

function SideMenu() {
    return (
        <div className="side-menu">
            {menuItems.map(item => (
                <NavLink
                    key={item.key}
                    to={item.path}
                    className={({ isActive }) => 
                        `side-menu-item ${isActive ? 'active' : ''}`
                    }
                >
                    <span className="side-menu-icon">{item.icon}</span>
                    <span className="side-menu-label">{item.label}</span>
                </NavLink>
            ))}
        </div>
    );
}

export default SideMenu;
