import React from 'react';
import { Table, Pagination } from 'antd';
import { createStyles } from 'antd-style';
import './Rank.css';
import rankData from '../../data/rankData.json';
const useStyle = createStyles(({ css }) => ({
    customTable: css`
    .ant-table {
      border-radius: 8px;
      overflow: hidden;
    }
  `,
}));

// 排名表格的列配置
const columns = [
    {
        title: '名次',
        dataIndex: 'rank',
        key: 'rank',
        width: 80,
        align: 'center',
    },
    {
        title: '用户名',
        dataIndex: 'username',
        key: 'username',
        width: 120,
    },
    {
        title: '解决',
        dataIndex: 'solved',
        key: 'solved',
        width: 80,
        align: 'center',
    },
    {
        title: '提交',
        dataIndex: 'submitted',
        key: 'submitted',
        width: 80,
        align: 'center',
    },
    {
        title: '正确率',
        dataIndex: 'accuracy',
        key: 'accuracy',
        width: 80,
        align: 'center',
    },
];

const App = () => {
    const { styles } = useStyle();
    //当前页码
    const [currentPage, setCurrentPage] = React.useState(1);
    //每页条数，可根据需求调整
    const [pageSize, setPageSize] = React.useState(10);
    //截取当前页数据：rankData 是全部数据，通过 slice 截取对应页内容  ！！！这条注意
    const currentData = rankData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    //分页改变时触发
    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div>
            <Table
                className={styles.customTable}
                columns={columns}
                //渲染当前页数据
                dataSource={currentData}
                bordered
                //隐藏表格自带的分页（因为要自己在下方放 Pagination 组件）
                pagination={false}
            />
            {/* 单独的分页组件，数据总条数是 rankData 的长度 */}
            <Pagination
                style={{ marginTop: '20px', textAlign: 'right' }}
                current={currentPage}
                pageSize={pageSize}
                total={rankData.length}
                pageSizeOptions={['10', '20']}
                onChange={handlePageChange}
            />
        </div>
    );
};

export default App;