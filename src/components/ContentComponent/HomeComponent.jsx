
import { Card } from "antd";
// import { Carousel } from 'antd';
const HomeComponent = () => {
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
        <div />

        {/* <div style={{ display: "flex", gap: "24px"}}> */}
            {/* 今日 coding 统计 */}
            {/* <div
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
            </div> */}

            {/* 近期比赛 */}
            {/* <div
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
            </div> */}
        {/* </div> */}
    </Card>
    );
};
export default HomeComponent;
