// src/api/user.js
import axios from 'axios';

// API基础URL，可以根据环境配置
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8080/api';

/**
 * 用户注册
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise} - 返回注册结果
 */
export const register = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/register`, {
      username,
      password
    });
    return response.data;
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
};

/**
 * 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise} - 返回登录结果，包含用户信息和token
 */
export const login = async (username, password) => {
  try {
    const response = await axios.post(`api/user/login`, {
      username,
      password
    });
    return response.data;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
};

/**
 * 保存用户信息到本地存储
 * @param {Object} userInfo - 用户信息对象
 */
export const saveUserInfo = (userInfo) => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

/**
 * 获取本地存储的用户信息
 * @returns {Object|null} - 返回用户信息对象，如果不存在则返回null
 */
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

/**
 * 清除本地存储的用户信息（登出）
 */
export const clearUserInfo = () => {
  localStorage.removeItem('userInfo');
};

/**
 * 检查用户是否已登录
 * @returns {boolean} - 返回是否已登录
 */
export const isLoggedIn = () => {
  return !!getUserInfo();
};

/**
 * 获取当前登录用户ID
 * @returns {number|null} - 返回用户ID，如果未登录则返回null
 */
export const getUserId = () => {
  const userInfo = getUserInfo();
  return userInfo ? userInfo.uuid : null;
};

/**
 * 模拟登录（开发环境使用）
 * @param {string} username - 用户名
 * @returns {Object} - 返回模拟的用户信息
 */
export const mockLogin = (username) => {
  const mockUserInfo = {
    message: "登录成功",
    user_id: 1,
    username: username || "测试用户",
    uuid: "2bfd19c5-abf9-40d0-903d-185c80e69fd4"
  };
  
  saveUserInfo(mockUserInfo);
  return mockUserInfo;
};