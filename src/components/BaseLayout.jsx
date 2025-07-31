// components/BaseLayout.jsx
import React from 'react';
import { Layout } from 'antd';
import HeaderNav from "./HeaderNav/HeaderNav.jsx"; // 你已有的 Header 组件

const { Content, Footer } = Layout;

const BaseLayout = ({ children }) => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderNav />
            <Content style={{ padding: '0 48px', margin: '16px 0' }}>
                {children}
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                Ant Design ©{new Date().getFullYear()} Created by Ant UED
            </Footer>
        </Layout>
    );
};

export default BaseLayout;