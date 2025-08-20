import ReactDOM from 'react-dom/client';
import App from './App';
import 'antd/dist/reset.css'; // 引入 Ant Design 重置样式
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import 'main.css'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);