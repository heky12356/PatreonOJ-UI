import React, { useState } from "react";
import { Layout, theme, Menu, Input } from "antd";
import { GithubOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
// 恢复导入 ContentComponent（用于通过 currentKey 切换组件）
import ContentComponent from "./components/ContentComponent/ContentComponent";
import HeaderNav from "./components/HeaderNav/HeaderNav";
import SideMenu from "./components/SideMenu/SideMenu";
import RightSider from "./components/RightSider/RightSider";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.css';
const { Header, Content, Footer, Sider } = Layout;
const { Search } = Input;

const MainLayout = () => {
    const { token: { colorBgContainer } } = theme.useToken();
    const [currentKey, setCurrentKey] = useState('1'); // 通过 currentKey 控制显示的组件
    const navigate = useNavigate();

    const onSearch = (value, _e, info) => {
        console.log(info?.source, value);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header
                style={{
                    background: '#93b592',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                }}
            >
                <HeaderNav currentKey={currentKey} setCurrentKey={setCurrentKey} />
                <Search
                    placeholder="input search text"
                    onSearch={onSearch}
                    enterButton
                    style={{ width: '250px', marginLeft: '350px' }}
                />
                <Menu
                    theme="dark"
                    mode="horizontal"
                    items={[
                        {
                            key: 'login',
                            label: '登录',
                            onClick: () => navigate('/login'),
                        },
                        {
                            key: 'register',
                            label: '注册',
                            onClick: () => navigate('/register'),
                            style: { borderRadius: '4px' },
                        },
                    ]}
                    style={{ background: 'transparent', border: 'none' }}
                />
            </Header>

            <Layout style={{ padding: '24px' }}>
                <Sider
                    width={200}
                    style={{ background: colorBgContainer, marginRight: '24px' }}
                >
                    <SideMenu currentKey={currentKey} setCurrentKey={setCurrentKey} />
                </Sider>
                {/* 恢复使用 ContentComponent，通过 currentKey 决定显示哪个组件 */}
                <Content style={{
                    background: colorBgContainer,
                    flex: 1,
                    borderRadius: '8px',
                    padding: '24px'
                }}>
                    <ContentComponent currentKey={currentKey} />
                </Content>
                {/* <Sider
                    width={240}
                    style={{ background: colorBgContainer, marginLeft: '24px' }}
                >
                    <RightSider />
                </Sider> */}
            </Layout>

            <Footer>
                <div className="footer">
                    <span>联系我们</span>
                    <div><GithubOutlined /></div>
                    <span>©{new Date().getFullYear()} Patreon算法平台</span>
                </div>
            </Footer>
        </Layout>
    );
};

export default MainLayout;