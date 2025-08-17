//pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/user';
import styles from './Register.module.css'; // 导入CSS Modules

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    
    // 注册状态
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // 钩子
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // 清除错误信息
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 表单验证
        if (!formData.username || !formData.password) {
            setError('用户名和密码不能为空');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            // 实际注册API调用
            await register(formData.username, formData.password);
            
            // 注册成功，跳转到登录页
            navigate('/login');
        } catch (err) {
            console.error('注册失败:', err);
            setError(err.response?.data?.message || '注册失败，请稍后再试');
        } finally {
            setLoading(false);
        }
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
                    
                    {/* 错误提示 */}
                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <button 
                        type="submit" 
                        className={styles.btn}
                        disabled={loading}
                    >
                        {loading ? '注册中...' : '注册'}
                    </button> {/* 新增类 */}

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