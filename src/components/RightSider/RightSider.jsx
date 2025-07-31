import React from "react";
import { Menu } from "antd";
import "./RightSider.css";

// 模拟相关资讯列表
const relatedNews = Array.from({ length: 6 }).map((_, index) => ({
    key: index.toString(),
    title: `算法资讯 ${index + 1}: 蓝桥杯与ACM竞赛技巧分享`,
}));

const RightSider = () => {
    return (
        <div>
            <div
                style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px" }}
            >
                相关资讯
            </div>
            <Menu
                mode="inline"
                items={relatedNews.map((news) => ({
                    key: news.key,
                    label: news.title,
                    style: { color: "#000", padding: "8px 0" },
                }))}
                className="right-sider-menu"
            />
            <div style={{ textAlign: "right", marginTop: "8px" }}>
                <a href="#" style={{ fontSize: "12px", color: "#008000" }}>
                    更多
                </a>
            </div>
        </div>
    );
};

export default RightSider;
