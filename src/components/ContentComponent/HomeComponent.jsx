
import { Card } from "antd";
// import { Carousel } from 'antd';
import React, { useState, useEffect } from "react";
import Frame from "../../atlasComponent/frame";
const HomeComponent = () => {
    const [currentDate, setCurrentDate] = useState('');
    const [currentDay, setCurrentDay] = useState('');
    const [currentMonth, setCurrentMonth] = useState('');
    const [daysUntilFirst, setDaysUntilFirst] = useState(0);
    const [daysUntilSecond, setDaysUntilSecond] = useState(0);


    // 比赛日期
    const firstRoundDate = new Date('2025-09-28');
    const secondRoundDate = new Date('2025-10-26');
    const dayMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

    // 初始化和更新所有动态数据
    useEffect(() => {
        const updateAllData = () => {
            const now = new Date();

            // 更新日期和星期
            setCurrentDate(now.getDate());

            setCurrentDay(dayMap[now.getDay()]);
            // 添加月份，返回0-11，因此要＋1才是真实月份
            const month = now.getMonth() + 1;
            const formattedMonth = month.toString().padStart(2, '0');
            setCurrentMonth(formattedMonth);


            // 更新比赛剩余天数
            const diffFirst = firstRoundDate - now;
            setDaysUntilFirst(diffFirst > 0 ? Math.ceil(diffFirst / (1000 * 60 * 60 * 24)) : 0);

            const diffSecond = secondRoundDate - now;
            setDaysUntilSecond(diffSecond > 0 ? Math.ceil(diffSecond / (1000 * 60 * 60 * 24)) : 0);
        }

        updateAllData();
        const timer = setInterval(updateAllData, 1000);
        return () => clearInterval(timer);
    }, []);

    return (<Card style={{ marginBottom: 24 }}>
        {/* 轮播图区域 这块回来要删掉的*/}
        {/* <Carousel
            arrows
            autoplay
            infinite={false}>

            <div>
                <img
                    src="/images/1.jpg"
                    alt="轮播图1"
                    style={{ width: '100%', height: '450px', objectFit: 'cover' }}
                />
            </div>
            <div>
                <img
                    src="/images/2.jpg"
                    alt="轮播图1"
                    style={{ width: '100%', height: '450px', objectFit: 'cover' }}
                />
            </div>
            <div>
                <img
                    src="/images/3.jpg"
                    alt="轮播图1"
                    style={{ width: '100%', height: '450px', objectFit: 'cover' }}
                />
            </div>
            <div>
                <img
                    src="/images/4.jpg"
                    alt="轮播图1"
                    style={{ width: '100%', height: '450px', objectFit: 'cover' }}
                />
            </div>
        </Carousel>

        <br />  */}
        {/* 分隔轮播和下面内容 */}
        <div><Frame /></div>

        <div style={{ display: "flex", gap: "24px" }}>
            {/* 今日 coding 统计 */}
            <div
                style={{
                    flex: 1,
                    background: "#e5e5e5",
                    borderRadius: "8px",
                    padding: "16px",
                }}
            >
                <h3 style={{ marginBottom: "12px", color: "#253b22" }}>
                    今天你coding了吗？
                </h3>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                        }}
                    >
                        <span>今日提交</span>
                        <span style={{ color: "#ff0000" }}>66</span>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                        }}
                    >
                        <span>本周提交</span>
                        <span>66</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>累计提交</span>
                        <span>66</span>
                    </div>
                </div>
            </div>

            {/* 近期比赛 */}
            <div
                style={{
                    flex: 1,
                    background: "#dedcdc",
                    borderRadius: "8px",
                    padding: "16px",
                }}
            >
                <h3 style={{ marginBottom: "12px", color: "#253b22" }}>近期比赛</h3>
                <div style={{ textAlign: "center" }}>
                    <div
                        style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            marginBottom: "8px",
                            color: '#4e5d42'
                        }}
                    >   {currentMonth}月
                        {currentDate}日
                    </div>
                    <div style={{ fontSize: "14px", color: "#51624f" }}>{currentDay}</div>
                    <div style={{ marginTop: "8px", fontSize: "12px" }}>
                        距 CSP-J/S 2025 第一轮还剩 {daysUntilFirst} 天
                    </div>
                    <div style={{ fontSize: "12px" }}>
                        距 CSP-J/S 2025 第二轮还剩{daysUntilSecond}天
                    </div>
                </div>
            </div>
        </div>
    </Card>
    );
};
export default HomeComponent;