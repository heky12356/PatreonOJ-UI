// pages/addproblem/AddProblem.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AddProblem.module.css';

const AddProblem = () => {
    const navigate = useNavigate();
    
    // 表单数据状态
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        difficulty: '简单',
        input_format: '',
        output_format: '',
        sample_input: '',
        sample_output: '',
        sample_explanation: '',
        data_range: '',
        time_limit: 1000,
        memory_limit: 128,
        source: '',
        tags: '',
        hint: '',
        category_id: 0,
        status: 'draft'
    });
    
    // 提交状态
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // 处理输入变化
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // 清除错误和成功信息
        if (error) setError('');
        if (success) setSuccess('');
    };
    
    // 处理表单提交
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 验证必填字段
        if (!formData.title || !formData.content || !formData.difficulty) {
            setError('请填写必填字段：题目标题、题目描述和难度等级');
            return;
        }
        
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            // 发送创建题目请求
            const response = await axios.post('/api/question/', formData);
            
            // 创建成功
            setSuccess('题目创建成功！');
            console.log('题目创建成功:', response.data);
            
            // 清空表单或跳转
            setTimeout(() => {
                // 可以选择跳转到题目列表页面
                // navigate('/problems');
                // 或者清空表单继续添加
                setFormData({
                    title: '',
                    content: '',
                    difficulty: '简单',
                    input_format: '',
                    output_format: '',
                    sample_input: '',
                    sample_output: '',
                    sample_explanation: '',
                    data_range: '',
                    time_limit: 1000,
                    memory_limit: 128,
                    source: '',
                    tags: '',
                    hint: '',
                    category_id: 0,
                    status: 'draft'
                });
                setSuccess('');
            }, 3000);
            
        } catch (err) {
            console.error('题目创建失败:', err);
            setError(err.response?.data?.message || '题目创建失败，请稍后再试');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>创建新题目</h2>
            
            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}
            
            <form onSubmit={handleSubmit}>
                {/* 基本信息部分 */}
                <div className="row">
                    <div className="col-md-8">
                        <div className={styles.formGroup}>
                            <label className={`${styles.formLabel} ${styles.requiredField}`}>题目标题</label>
                            <input
                                type="text"
                                className={`form-control ${styles.formControl}`}
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="例如：两数之和"
                            />
                        </div>
                    </div>
                    
                    <div className="col-md-4">
                        <div className={styles.formGroup}>
                            <label className={`${styles.formLabel} ${styles.requiredField}`}>难度等级</label>
                            <select
                                className={styles.difficultySelect}
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleInputChange}
                            >
                                <option value="简单">简单</option>
                                <option value="中等">中等</option>
                                <option value="困难">困难</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                {/* 题目描述 */}
                <div className={styles.formGroup}>
                    <label className={`${styles.formLabel} ${styles.requiredField}`}>题目描述</label>
                    <textarea
                        className={`form-control ${styles.formControl} ${styles.textArea}`}
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        placeholder="详细描述题目要求..."
                        rows="5"
                    ></textarea>
                </div>
                
                {/* 输入输出格式 */}
                <div className="row">
                    <div className="col-md-6">
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>输入格式</label>
                            <textarea
                                className={`form-control ${styles.formControl}`}
                                name="input_format"
                                value={formData.input_format}
                                onChange={handleInputChange}
                                placeholder="描述输入格式..."
                                rows="3"
                            ></textarea>
                        </div>
                    </div>
                    
                    <div className="col-md-6">
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>输出格式</label>
                            <textarea
                                className={`form-control ${styles.formControl}`}
                                name="output_format"
                                value={formData.output_format}
                                onChange={handleInputChange}
                                placeholder="描述输出格式..."
                                rows="3"
                            ></textarea>
                        </div>
                    </div>
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
                        {loading ? '提交中...' : '创建题目'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProblem;