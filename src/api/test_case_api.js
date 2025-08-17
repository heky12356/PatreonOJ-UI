import axios from 'axios'

const baseUrl = '/api'

export const getTestCasesByProblemNumber = async (problem_number) => {
    try {
        const response = await axios.get(`${baseUrl}/testcase/question/${problem_number}`);
        return response.data;
    } catch (error) {
        console.error('获取测试用例失败:', error);
        throw error;
    }
}

export const addTestCase = async ({input, expected_output, problem_number}) => {
    try {
        const response = await axios.post(`${baseUrl}/testcase/`, {
            question_number: parseInt(problem_number),
            input,
            expected_output,
            is_hidden: false
        });
        return response.data;
    } catch (error) {
        console.error('添加测试用例失败:', error);
        throw error;
    }
}
