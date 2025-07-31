import React, { Component } from 'react';
import TextField from '@mui/material/TextField';
import '@coreui/icons/css/all.min.css';
import { LinkIcon } from '@primer/octicons-react';
class ProblemComponent extends Component {
  state = {}
  render() {
    return (
      <React.Fragment>
        <div style={{ height: "100vh", display: "flex", flexWrap: "nowrap" }}>
          <div style={{ backgroundColor: "#e9e7e7", width: "15%", height: "30%", margin: "2%" }}>
            <img src="public\52649bdcd1d45b81d7116917dddcfa3.png" alt="" style={{
              width: "100%",
              height: "100%",
              objectFit: "contain"
            }} />
            {/* width: "100%"，height: "100%"作用；照片跟父元素的比例
          objectFit: "contain"作用：在保持图片原始比例的前提下，让图片完整显示在容器内 
          */}
          </div>
          <div style={{ backgroundColor: "#e9e7e7", width: "15%", height: "30%", margin: "2%" }}>
            <div style={{ display: "flex", justifyContent: "center", height: "100%", alignItems: "center", fontSize: "60px" }}>
              +
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: '110px', right: '35px' }}><TextField id="outlined-basic" label="搜索" variant="outlined" size="small" style={{ backgroundColor: "#e9e7e7" }} /></div>
        <table className='table table-secondary' style={{ width: "14%", position: 'absolute', top: '175px', right: '35px' }}>
          <thead >
            <tr style={{
              "--bs-table-bg": "#51624f",
              "--bs-table-color": "white"
            }}>
              <th>
                <LinkIcon size={20} fill='#e6d5a9' /> 相关资讯
              </th>
            </tr>
          </thead>
          <tbody>
            <tr><td>震惊！小帅的恋人竟然是.....</td></tr>
            <tr><td>震惊！小帅的恋人竟然是.....</td></tr>
            <tr><td>震惊！小帅的恋人竟然是.....</td></tr>
            <tr><td>震惊！小帅的恋人竟然是.....</td></tr>
            <tr><td>震惊！小帅的恋人竟然是.....</td></tr>
            <tr><td>震惊！小帅的恋人竟然是.....</td></tr>
            <tr><td>震惊！小帅的恋人竟然是.....</td></tr>
          </tbody>
        </table>
      </React.Fragment >
    );
  }
}

export default ProblemComponent;
