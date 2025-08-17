import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './UpdateProblem.module.css';

const UpdateProblem = () => {
    const { id } = useParams(); // 从URL获取题目ID
    const navigate = useNavigate();
    
    // 状态管理
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'easy',
        input_format: '',
        output_format: '',
        sample_input: '',
        sample_output: '',
        sample_explanation: '',
        data_range: '',
        time_limit: 1000,
        memory_limit: 256,
        source: '',
        tags: '',
        hint: '',
        category_id: 1,
        status: 'published'
    });
    
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fetchError, setFetchError] = useState('');
    
    // 获取题目数据
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setFetchLoading(true);
                setFetchError('');
                
                // 发送GET请求获取题目数据
                const response = await axios.get(`/api/question/${id}`);
                
                // 更新表单数据
                if (response.data) {
                    const problem = response.data;
                    setFormData({
                        title: problem.title || '',
                        description: problem.description || '',
                        difficulty: problem.difficulty || 'easy',
                        input_format: problem.input_format || '',
                        output_format: problem.output_format || '',
                        sample_input: problem.sample_input || '',
                        sample_output: problem.sample_output || '',
                        sample_explanation: problem.sample_explanation || '',
                        data_range: problem.data_range || '',
                        time_limit: problem.time_limit || 1000,
                        memory_limit: problem.memory_limit || 256,
                        source: problem.source || '',
                        tags: Array.isArray(problem.tags) ? problem.tags.join(',') : problem.tags || '',
                        hint: problem.hint || '',
                        category_id: problem.category_id || 1,
                        status: problem.status || 'published'
                    });
                }
            } catch (err) {
                console.error('获取题目数据失败:', err);
                setFetchError('获取题目数据失败，请检查题目ID是否正确或网络连接是否正常。');
            } finally {
                setFetchLoading(false);
            }
        };
        
        if (id) {
            fetchProblem();
        } else {
            setFetchLoading(false);
            setFetchError('未提供题目ID，无法获取题目数据。');
        }
    }, [id]);
    
    // 处理输入变化
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };
    
    // 处理表单提交
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 验证必填字段
        if (!formData.title || !formData.description) {
            setError('题目标题和描述为必填项');
            return;
        }
        
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            
            // 处理标签，将字符串转换为数组
            const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [];
            
            // 准备提交的数据
            const submitData = {
                ...formData,
                tags: tagsArray
            };
            
            // 发送PUT请求更新题目
            await axios.put(`/api/question/${id}`, submitData);
            
            setSuccess('题目更新成功！');
            
            // 可选：更新成功后跳转到题目详情页
            // setTimeout(() => navigate(`/problem/${id}`), 2000);
        } catch (err) {
            console.error('更新题目失败:', err);
            setError('更新题目失败，请稍后重试。');
        } finally {
            setLoading(false);
        }
    };
    
    // 如果正在获取数据，显示加载中
    if (fetchLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingMessage}>正在加载题目数据...</div>
            </div>
        );
    }
    
    // 如果获取数据失败，显示错误信息
    if (fetchError) {
        return (
            <div className={styles.container}>
                <div className={styles.errorMessage}>{fetchError}</div>
                <button 
                    className={`btn ${styles.submitBtn}`}
                    onClick={() => navigate('/addproblem')}
                >
                    返回添加题目
                </button>
            </div>
        );
    }
    
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>更新题目</h2>
            
            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}
            
            <form onSubmit={handleSubmit}>
                {/* 题目ID（只读） */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>题目ID</label>
                    <input
                        type="text"
                        className={`form-control ${styles.formControl} ${styles.problemIdInput}`}
                        value={id}
                        readOnly
                    />
                </div>
                
                {/* 题目标题 */}
                <div className={styles.formGroup}>
                    <label className={`${styles.formLabel} ${styles.requiredField}`}>题目标题</label>
                    <input
                        type="text"
                        className={`form-control ${styles.formControl}`}
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="例如：两数之和"
                        required
                    />
                </div>
                
                {/* 题目描述 */}
                <div className={styles.formGroup}>
                    <label className={`${styles.formLabel} ${styles.requiredField}`}>题目描述</label>
                    <textarea
                        className={`form-control ${styles.formControl} ${styles.textArea}`}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="详细描述题目要求..."
                        rows="5"
                        required
                    ></textarea>
                </div>
                
                {/* 难度选择 */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>难度</label>
                    <select
                        className={styles.difficultySelect}
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                    >
                        <option value="easy">简单</option>
                        <option value="medium">中等</option>
                        <option value="hard">困难</option>
                    </select>
                </div>
                
                {/* 输入格式 */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>输入格式</label>
                    <textarea
                        className={`form-control ${styles.formControl}`}
                        name="input_format"
                        value={formData.input_format}
                        onChange={handleInputChange}
                        placeholder="例如：第一行包含一个整数n，表示数组的长度..."
                        rows="2"
                    ></textarea>
                </div>
                
                {/* 输出格式 */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>输出格式</label>
                    <textarea
                        className={`form-control ${styles.formControl}`}
                        name="output_format"
                        value={formData.output_format}
                        onChange={handleInputChange}
                        placeholder="例如：输出一个数组，包含两个整数的下标..."
                        rows="2"
                    ></textarea>
                </div>
                
                {/* 样例输入输出 */}
                <div className="row">
                    <div className="col-md-6">
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>样例输入</label>
                            <textarea
                                className={`form-control ${styles.formControl}`}
                                name="sample_input"
                                value={formData.sample_input}
                                onChange={handleInputChange}
                                placeholder="例如：4\n2 7 11 15\n9"
                                rows="3"
                            ></textarea>
                        </div>
                    </div>
                    
                    <div className="col-md-6">
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>样例输出</label>
                            <textarea
                                className={`form-control ${styles.formControl}`}
                                name="sample_output"
                                value={formData.sample_output}
                                onChange={handleInputChange}
                                placeholder="例如：0 1"
                                rows="3"
                            ></textarea>
                        </div>
                    </div>
                </div>
                
                {/* 样例解释 */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>样例解释</label>
                    <textarea
                        className={`form-control ${styles.formControl}`}
                        name="sample_explanation"
                        value={formData.sample_explanation}
                        onChange={handleInputChange}
                        placeholder="解释样例输入输出的对应关系..."
                        rows="2"
                    ></textarea>
                </div>
                
                {/* 数据范围 */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>数据范围</label>
                    <textarea
                        className={`form-control ${styles.formControl}`}
                        name="data_range"
                        value={formData.data_range}
                        onChange={handleInputChange}
                        placeholder="例如：2 ≤ n ≤ 10^4\n-10^9 ≤ nums[i] ≤ 10^9\n-10^9 ≤ target ≤ 10^9"
                        rows="3"
                    ></textarea>
                </div>
                
                {/* 时间和内存限制 */}
                <div className="row">
                    <div className="col-md-6">
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>时间限制 (ms)</label>
                            <input
                                type="number"
                                className={`form-control ${styles.formControl}`}
                                name="time_limit"
                                value={formData.time_limit}
                                onChange={handleInputChange}
                                min="100"
                                step="100"
                            />
                        </div>
                    </div>
                    
                    <div className="col-md-6">
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>内存限制 (MB)</label>
                            <input
                                type="number"
                                className={`form-control ${styles.formControl}`}
                                name="memory_limit"
                                value={formData.memory_limit}
                                onChange={handleInputChange}
                                min="16"
                                step="16"
                            />
                        </div>
                    </div>
                </div>
                
                {/* 其他信息 */}
                <div className="row">
                    <div className="col-md-6">
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>题目来源</label>
                            <input
                                type="text"
                                className={`form-control ${styles.formControl}`}
                                name="source"
                                value={formData.source}
                                onChange={handleInputChange}
                                placeholder="例如：LeetCode"
                            />
                        </div>
                    </div>
                    
                    <div className="col-md-6">
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>标签（用逗号分隔）</label>
                            <input
                                type="text"
                                className={`form-control ${styles.formControl} ${styles.tagsInput}`}
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                placeholder="例如：数组,哈希表"
                            />
                        </div>
                    </div>
                </div>
                
                {/* 提示信息 */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>提示信息</label>
                    <textarea
                        className={`form-control ${styles.formControl}`}
                        name="hint"
                        value={formData.hint}
                        onChange={handleInputChange}
                        placeholder="可以提供一些解题思路或技巧..."
                        rows="2"
                    ></textarea>
                </div>
                
                {/* 分类和状态 */}
                <div className="row">
                    <div className="col-md-6">
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>分类ID</label>
                            <input
                                type="number"
                                className={`form-control ${styles.formControl}`}
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleInputChange}
                                placeholder="例如：1"
                            />
                        </div>
                    </div>
                    
                    <div className="col-md-6">
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>状态</label>
                            <select
                                className={styles.difficultySelect}
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                            >
                                <option value="draft">草稿</option>
                                <option value="published">已发布</option>
                                <option value="archived">已归档</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                {/* 提交按钮 */}
                <div className="text-center">
                    <button 
                        type="submit" 
                        className={`btn ${styles.submitBtn}`}
                        disabled={loading}
                    >
                        {loading ? '更新中...' : '更新题目'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateProblem;