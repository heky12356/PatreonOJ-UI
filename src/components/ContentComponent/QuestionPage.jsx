import React, { useState } from 'react';
import { LikeOutlined, LikeFilled, MessageOutlined } from '@ant-design/icons';
import { Avatar, List, Space, Tag } from 'antd';

// 模拟数据，包含标签类型
const data = [
    {
        id: 1,
        title: 'Patreon创作者收益计算方式详解',
        avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1',
        viewCount: 675,
        author: 'Rosmarinus',
        timeAgo: '13 小时前',
        likeCount: 299,
        tagType: 'guide' // 指南
    },
    {
        id: 2,
        title: '谁懂一下《安达与村岛》！！！！谁能懂！！',
        avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2',
        viewCount: 521,
        author: 'JohnDoe',
        timeAgo: '1天前',
        likeCount: 66,
        tagType: 'complaint' // 吐槽
    },
    {
        id: 3,
        title: '大家觉得 不行不行不能成为你的恋人 这个番怎么样？',
        avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=3',
        viewCount: 342,
        author: 'JaneSmith',
        timeAgo: '2天前',
        likeCount: 31,
        tagType: 'chat' // 水贴
    },
    {
        id: 4,
        title: 'Patreon算法平台指南大揭秘',
        avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=4',
        viewCount: 890,
        author: 'ContentCreator',
        timeAgo: '3天前',
        likeCount: 127,
        tagType: 'guide' // 指南
    }
];

// 获取标签颜色和文本
const getTagInfo = (type) => {
    switch(type) {
        case 'guide':
            return { color: 'green', text: '指南' };
        case 'complaint':
            return { color: 'blue', text: '吐槽' };
        case 'chat':
            return { color: 'magenta', text: '水贴' };
        default:
            return { color: 'default', text: '其他' };
    }
};

const IconText = ({ icon, text }) => (
    <Space>
        {React.createElement(icon)}
        {text}
    </Space>
);

const QuestionPage = () => {
    // 存储点赞状态
    const [likeStatus, setLikeStatus] = useState(
        data.reduce((acc, item) => {
            acc[item.id] = {
                liked: false,
                count: item.likeCount
            };
            return acc;
        }, {})
    );

    // 处理点赞事件
    const handleLike = (id, e) => {
        e.stopPropagation(); // 防止点击点赞触发列表项其他事件
        setLikeStatus(prev => {
            const current = prev[id];
            return {
                ...prev,
                [id]: {
                    liked: !current.liked,
                    count: current.liked ? current.count - 1 : current.count + 1
                }
            };
        });
    };

    return (
        <List
            itemLayout="vertical"
            size="large"
            pagination={{
                onChange: page => {
                    console.log(page);
                },
                pageSize: 4,
            }}
            dataSource={data}
            renderItem={item => {
                const tagInfo = getTagInfo(item.tagType);

                return (
                    <List.Item
                        key={item.id}
                        actions={[
                            <span
                                onClick={(e) => handleLike(item.id, e)}
                                style={{ cursor: 'pointer' }}
                                key="like"
                            >
                <IconText
                    icon={likeStatus[item.id].liked ? LikeFilled : LikeOutlined}
                    text={likeStatus[item.id].count}
                />
              </span>,
                            <IconText icon={MessageOutlined} text="233" key="message" />,
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={item.avatar} />}
                            title={<a href="#">{item.title}</a>}
                            description={
                                <Space>
                                    <Tag
                                        bordered={false}
                                        color={tagInfo.color}
                                    >
                                        {tagInfo.text}
                                    </Tag>
                                    <span>{item.viewCount} 次查看</span>
                                    <span>{item.author} @ {item.timeAgo}</span>
                                </Space>
                            }
                        />
                    </List.Item>
                );
            }}
        />
    );
};

export default QuestionPage;
