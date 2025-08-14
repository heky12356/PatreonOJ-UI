import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'antd/dist/reset.css'; // 引入 Ant Design 重置样式
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);