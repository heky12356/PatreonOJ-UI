//pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, saveUserInfo, mockLogin } from '../api/user';
import styles from './Login.module.css'; // 引入CSS Modules

const Login = () => {
    //导航钩子（用于登录成功后跳转）
    const navigate = useNavigate();

    //表单数据状态管理
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    
    // 登录状态
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    //处理输入框变化
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // 清除错误信息
        if (error) setError('');
    };

    //处理表单提交
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.username || !formData.password) {
            setError('请输入用户名和密码');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            // 开发环境使用模拟登录，生产环境使用实际API
            let response;
            if (process.env.NODE_ENV === 'development') {
                response = mockLogin(formData.username);
            } else {
                response = await login(formData.username, formData.password);
            }
            
            // 保存用户信息到本地存储
            saveUserInfo(response);
            
            // 登录成功提示
            console.log('登录成功:', response);
            
            // 跳转到首页
            navigate('/');
        } catch (err) {
            console.error('登录失败:', err);
            setError(err.response?.data?.message || '登录失败，请检查用户名和密码');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.body}>
            <div className={styles.wrapper}>
                <div className={styles.formBoxLogin}>
                    {/*Logo和标题 */}
                    <div className={styles.logo}>
                        <img src="/images/logo.png" alt="logo" />
                        Patreon算法平台
                    </div>
                    <h3 className={styles.title}>登录</h3>

                    {/*登录表单 */}
                    <form onSubmit={handleSubmit}>
                        {/*用户名输入框 */}
                        <div className={styles.inputBox}>
              <span className={styles.icon}>
                <ion-icon name="people-circle"></ion-icon>
              </span>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                            />
                            <label>用户名</label>
                        </div>

                        {/*密码输入框 */}
                        <div className={styles.inputBox}>
              <span className={styles.icon}>
                <ion-icon name="lock-closed"></ion-icon>
              </span>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                            <label>密码</label>
                        </div>

                        {/*记住密码和忘记密码 */}
                        <div className={styles.rememberForgot}>
                            <label>
                                <input type="checkbox" /> 记住密码
                            </label>
                            <a href="#">忘记密码？</a>
                        </div>

                        {/* 错误提示 */}
                        {error && <div className={styles.errorMessage}>{error}</div>}
                        
                        {/*登录模块*/}
                        <button 
                            type="submit" 
                            className={styles.btn} 
                            disabled={loading}
                        >
                            {loading ? '登录中...' : '登录'}
                        </button>

                        {/*注册和帮助链接 */}
                        <div className={styles.loginRegister}>
                            <p>
                                没有账户？ <Link to="/register">去注册</Link>
                            </p>
                            <p>
                                <a href="#">帮助中心</a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>


            <div className={styles.footer}>
                <span>联系我们</span>
                <div></div>
                <span>©Patreon算法平台</span>
            </div>
        </div>
    );
};

export default Login;