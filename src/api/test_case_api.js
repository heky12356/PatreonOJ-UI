import axios from 'axios';

const baseUrl = '/api';

export const getTestCasesByProblemNumber = async (problem_number) => {
  try {
    const response = await axios.get(
      `${baseUrl}/testcase/question/${problem_number}`
    );
    return response.data;
  } catch (error) {
    console.error('获取测试用例失败:', error);
    throw error;
  }
};

export const addTestCase = async ({
  input,
  expected_output,
  problem_number,
}) => {
  try {
    const response = await axios.post(`${baseUrl}/testcase/`, {
      question_number: parseInt(problem_number),
      input,
      expected_output,
      is_hidden: false,
    });
    return response.data;
  } catch (error) {
    console.error('添加测试用例失败:', error);
    throw error;
  }
};

export const apideleteTestCase = async ({ id }) => {
  try {
    const response = await axios.delete(`${baseUrl}/testcase/${id}`);
    return response.data;
  } catch (error) {
    console.error('删除测试用例失败:', error);
    throw error;
  }
};

const ensureDirSuffix = (prefix) => {
  if (!prefix) return '';
  return prefix.endsWith('/') ? prefix : `${prefix}/`;
};

const putToPresignedUrl = async (url, file) => {
  const contentType =
    file && file.type ? file.type : 'application/octet-stream';

  await axios.put(url, file, {
    headers: {
      'Content-Type': contentType,
    },
  });
};

const getOssUploadUrl = async ({ filename, path }) => {
  const response = await axios.get(`${baseUrl}/oss/upload-url`, {
    params: {
      filename,
      path,
    },
  });
  return response.data;
};

export const uploadTestCaseViaOss = async ({
  question_number,
  case_no,
  inputFile,
  outputFile,
  is_hidden = false,
}) => {
  try {
    const qn = parseInt(question_number);
    const dir = ensureDirSuffix(`problems/${qn}`);

    const input = await getOssUploadUrl({
      filename: `${case_no}.in`,
      path: dir,
    });

    const output = await getOssUploadUrl({
      filename: `${case_no}.out`,
      path: dir,
    });

    await putToPresignedUrl(input.url, inputFile);
    await putToPresignedUrl(output.url, outputFile);

    const commitResp = await axios.post(`${baseUrl}/testcase/oss/commit`, {
      question_number: qn,
      input_key: input.key,
      output_key: output.key,
      is_hidden: is_hidden,
    });

    return {
      input_key: input.key,
      output_key: output.key,
      result: commitResp.data,
    };
  } catch (error) {
    console.error('OSS 上传测试用例失败:', error);
    throw error;
  }
};

export const getProblemTestcaseFileTree = async ({
  question_number,
  recursive = true,
  prefix,
} = {}) => {
  try {
    const pfx =
      prefix != null
        ? prefix
        : ensureDirSuffix(`problems/${parseInt(question_number)}`);
    const response = await axios.get(`${baseUrl}/oss/files`, {
      params: {
        prefix: pfx,
        recursive,
      },
    });
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('获取测试用例文件树失败:', error);
    throw error;
  }
};
