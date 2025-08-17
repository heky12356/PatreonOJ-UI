// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserInfo } from '../api/user';

/**
 * 权限保护路由组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @param {string|string[]} props.requiredPermissions - 必需的权限（单个权限字符串或权限数组）
 * @param {string} props.redirectTo - 无权限时重定向的路径，默认为首页
 * @returns {React.ReactNode} - 返回子组件或重定向组件
 */
const ProtectedRoute = ({ 
  children, 
  requiredPermissions, 
  redirectTo = '/' 
}) => {
  // 获取用户信息
  const userInfo = getUserInfo();
  
  // 如果用户未登录，重定向到登录页
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  
  // 如果没有指定权限要求，直接返回子组件
  if (!requiredPermissions) {
    return children;
  }
  
  // 获取用户权限列表
  const userPermissions = userInfo.permissions || [];
  
  // 检查权限的函数
  const hasPermission = (permission) => {
    return userPermissions.includes(permission);
  };
  
  // 检查是否有所需权限
  let hasRequiredPermission = false;
  
  if (Array.isArray(requiredPermissions)) {
    // 如果是权限数组，检查用户是否拥有其中任意一个权限
    hasRequiredPermission = requiredPermissions.some(permission => 
      hasPermission(permission)
    );
  } else {
    // 如果是单个权限字符串
    hasRequiredPermission = hasPermission(requiredPermissions);
  }
  
  // 如果没有权限，重定向到指定页面
  if (!hasRequiredPermission) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // 有权限，返回子组件
  return children;
};

export default ProtectedRoute;