/**
 * 代码运行和判题API
 * 从ide-part项目迁移而来，用于在线代码执行
 */
import axios from 'axios';

// Judge0 API配置 - 在线代码执行服务
const JUDGE_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
const headers = {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': '你的_API_KEY', // 需要替换为实际的API密钥
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
};

// 编程语言ID映射表
const languageIds = {
    python: 71,     // Python 3
    cpp: 54,        // C++ (GCC 9.2.0)
    java: 62,       // Java (OpenJDK 13.0.1)
    javascript: 63  // JavaScript (Node.js 12.14.0)
};

/**
 * 运行代码并返回结果
 * @param {string} sourceCode - 源代码
 * @param {string} language - 编程语言 (python/cpp/java/javascript)
 * @param {string} input - 输入数据
 * @returns {Promise<string>} 运行结果
 */
export async function runCode(sourceCode, language = 'python', input = '') {
    try {
        // 发送代码执行请求
        const { data } = await axios.post(
            JUDGE_API_URL + '?base64_encoded=false&wait=true', 
            {
                source_code: sourceCode,
                language_id: languageIds[language],
                stdin: input
            }, 
            { headers }
        );

        // 返回执行结果
        return data.stdout || data.stderr || '运行失败';
    } catch (error) {
        console.error('代码运行失败:', error);
        return '网络错误或服务不可用';
    }
}

/**
 * 获取支持的编程语言列表
 * @returns {Array} 支持的语言列表
 */
export function getSupportedLanguages() {
    return Object.keys(languageIds);
}

/**
 * 模拟本地代码运行（用于开发测试）
 * @param {string} sourceCode - 源代码
 * @param {string} language - 编程语言
 * @param {string} input - 输入数据
 * @returns {Promise<string>} 模拟运行结果
 */
export async function mockRunCode(sourceCode, language = 'python', input = '') {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 简单的模拟逻辑
    if (language === 'python' && sourceCode.includes('print')) {
        return `模拟输出: Hello World!\n输入: ${input}`;
    }
    
    return `模拟运行成功\n语言: ${language}\n输入: ${input}`;
}