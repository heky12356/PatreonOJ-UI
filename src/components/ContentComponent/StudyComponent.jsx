import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { CpuIcon } from '@primer/octicons-react';
import { LogIcon } from '@primer/octicons-react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';

// 注册Chart.js组件
Chart.register(ArcElement);

class Study extends Component {
  // 状态管理
  state = {
    // pieData: 定义饼图的数据和样式
    pieData: {
      labels: ['rose 1', 'rose 2', 'rose 3', 'rose 4', 'rose 5', 'rose 6', 'rose 7', 'rose 8'],
      datasets: [
        {
          data: [12, 19, 8, 15, 10, 7, 13, 6],
          backgroundColor: [
            '#4e79a7', '#f28e2c', '#e15759', '#76b7b2',
            '#59a14f', '#edc948', '#b07aa1', '#ff9da7'
          ],
          borderWidth: 1
        }
      ]
    },
    circleStates: [true, true, false, false, false] // 控制圆形图标的勾选状态
  };

  // 切换圆形图标的勾选状态
  toggleCircle = (index) => {
    this.setState(prevState => {
      const newCircleStates = [...prevState.circleStates];
      newCircleStates[index] = !newCircleStates[index];
      return { circleStates: newCircleStates };
    });
  };

  // 渲染饼图
  renderPieChart = () => {
    return (
      <div style={{ marginBottom: '20px', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
        <Pie
          data={this.state.pieData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
              },
              title: {
                display: true,
                text: '学习数据分布'
              }
            }
          }}
        />
      </div>
    );
  };

  // 渲染圆形图标
  //   每个按钮:
  // 根据circleStates状态显示不同颜色(选中为深绿色，未选中为灰色)
  // 点击时调用toggleCircle切换状态
  // 选中状态显示白色对勾
  // 有悬停指针和过渡动画效果
  renderCircleIcons = () => {
    return (
      <div style={{
        display: 'flex',
        gap: '15px',
        marginTop: '20px',
        justifyContent: 'center',
        padding: '10px'
      }}>
        {this.state.circleStates.map((checked, index) => (
          <div
            key={index}
            style={{
              width: '80px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: checked ? '#afbea2' : '#e6d5a9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => this.toggleCircle(index)}
          >
            {checked && (
              <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                ✔
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  render() {
    return (
      <React.Fragment>
        <div style={{
          display: 'flex',
          flexWrap: 'nowrap',
          // padding: '20px',
          gap: '20px',
        }}>
          {/* 左侧区域 - 饼图和个人学习分析 */}
          <div style={{ width: '30%', minWidth: '250px' }}>
            {this.renderPieChart()}
          </div><div style={{ width: '40%', minWidth: '300px' }}>
            <table className="table table-secondary">
              <thead>
                <tr style={{
                  '--bs-table-bg': '#51624f',
                  '--bs-table-color': 'white'
                }}>
                  <th>
                    <CpuIcon size={20} fill='#e6d5a9' /> 个人学习分析
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>今日提交</td>
                  <td style={{ textAlign: 'right', paddingRight: '25px' }}>66</td>
                </tr>
                <tr>
                  <td>本周提交</td>
                  <td style={{ textAlign: 'right', paddingRight: '25px' }}>66</td>
                </tr>
                <tr>
                  <td>累计提交</td>
                  <td style={{ textAlign: 'right', paddingRight: '25px' }}>66</td>
                </tr>
                <tr>
                  <td>累计错题</td>
                  <td style={{ textAlign: 'right', paddingRight: '25px' }}>0</td>
                </tr>
                <tr>
                  <td>正确率</td>
                  <td style={{ textAlign: 'right', paddingRight: '25px' }}>100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 右侧区域 - 知识图谱 */}
          <div style={{ width: '20%', minWidth: '200px' }}>
            <table className='table table-secondary'>
              <thead>
                <tr style={{
                  '--bs-table-bg': '#51624f',
                  '--bs-table-color': 'white'
                }}>
                  <th>
                    <LogIcon size={20} fill='#e6d5a9' /> 知识图谱
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr><td>链表</td></tr>
                <tr><td>图论</td></tr>
                <tr><td>栈</td></tr>
                <tr><td>队列</td></tr>
                <tr><td>堆</td></tr>
                <tr><td>树</td></tr>
                <tr><td>搜索</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* 底部圆形图标 */}
        <div style={{ backgroundColor: "#e9e7e7", width: "73%", padding: "5%" }}>
          {this.renderCircleIcons()}
        </div>
      </React.Fragment>
    );
  }
}

export default Study;
