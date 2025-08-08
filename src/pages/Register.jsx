//pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css'; // 导入CSS Modules

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    // 钩子
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('注册数据:', formData);
        navigate('/login');
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.formBoxRegister}>
                <div className={styles.logo}>
                    <img src="/images/logo.png" alt="logo" />
                    Patreon算法平台
                </div>
                <h2 className={styles.title}>注册</h2> {/* 添加title类 */}
                <form onSubmit={handleSubmit}>
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

                    <div className={styles.inputBox}>
                        <span className={styles.icon}>
                            <ion-icon name="mail"></ion-icon>
                        </span>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                        <label>邮箱</label>
                    </div>

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

                    <div className={styles.rememberForgot}> {/* 新增类 */}
                        <label>
                            <input type="checkbox" /> 同意条款
                            <a href="#">查看条款</a>
                        </label>
                    </div>

                    <button type="submit" className={styles.btn}>注册</button> {/* 新增类 */}

                    <div className={styles.loginRegister}> {/* 新增类 */}
                        <p>
                            已经有帐号了？ <Link to="/login">去登录</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;