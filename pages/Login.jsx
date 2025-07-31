//pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css'; // 引入CSS Modules

const Login = () => {
    //导航钩子（用于登录成功后跳转）
    const navigate = useNavigate();

    //表单数据状态管理
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    //处理输入框变化
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    //处理表单提交
    const handleSubmit = (e) => {
        e.preventDefault();
        //这里添加登录逻辑（例如调用后端API验证）
        console.log('登录数据:', formData);

        //模拟登录成功（实际项目中根据API返回结果判断）
        if (formData.username && formData.password) {
            navigate('/'); // 登录成功后跳转到首页
        } else {
            alert('请输入用户名和密码');
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

                        {/*登录模块*/}
                        <button type="submit" className={styles.btn}>登录</button>

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