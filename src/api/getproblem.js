// const mod = "pro";
import { isLoggedIn, getUserId } from './user.js';

const baseUrl = '/api';
// const baseUrl = "http://localhost:8080"

/**
 *
 * @param {*} 搜索内容，页数索引，每页题目数量，难度
 * @returns 全部题目数据
 */
export async function getProblem({ q, pageIdx, pageSize, difficult } = {}) {
  // console.log('q:', q);
  // console.log('pageIdx:', pageIdx);
  // console.log('pageSize:', pageSize);
  // console.log('difficult:', difficult);
  try {
    let args = '?';
    if (q != undefined) {
      args += 'q=' + q;
    }
    if (pageIdx != undefined) {
      if (args != '?') args += '&';
      args += 'pageIdx=' + pageIdx;
    }
    if (pageSize != undefined) {
      if (args != '?') args += '&';
      args += 'pageSize=' + pageSize;
    }
    if (difficult != undefined) {
      if (args != '?') args += '&';
      args += 'difficult=' + difficult;
    }

    // 看是否登录，如果登录将uuid附到后面
    if (isLoggedIn()) {
      let uuid = getUserId();

      if (args != '?') args += '&';
      args += 'uuid=' + uuid;
    }

    const response = await fetch(baseUrl + '/question/' + args);
    if (!response.ok) {
      throw new Error('获取题目列表失败');
    }
    const data = await response.json();
    // console.log(data);
    return data;
  } catch (err) {
    console.error('获取题目列表失败:', err);
    return err;
  }
}

/**
 *
 * @param {*} id
 * @returns 根据id对应的题目数据
 */
export async function getProblemById(id) {
  try {
    const response = await fetch(baseUrl + `/question/${id}`);
    if (!response.ok) {
      throw new Error('获取题目详情失败');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    throw err;
  }
}

export async function getNewProblems() {
  try {
    const response = await fetch(baseUrl + '/question/new');
    if (!response.ok) {
      throw new Error('获取最新题目失败');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('获取最新题目失败:', err);
    return err;
  }
}
