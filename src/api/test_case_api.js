import axios from 'axios';

const baseUrl = '/api';

const unwrapApiData = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  if (payload.data !== undefined) return payload.data;
  if (payload.result !== undefined) return payload.result;
  return payload;
};

const mergeResultPayload = (raw, result) => {
  if (raw && typeof raw === 'object' && raw.result !== undefined) {
    return { ...raw, result };
  }
  if (raw && typeof raw === 'object' && raw.data !== undefined) {
    return { ...raw, result };
  }
  return { result };
};

const toQuestionPk = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : value;
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
  return unwrapApiData(response.data);
};

const getKeyDir = (key) => {
  const normalized = String(key || '').trim().replace(/\\/g, '/');
  const slashIndex = normalized.lastIndexOf('/');
  if (slashIndex < 0) return '';
  return normalized.slice(0, slashIndex + 1);
};

const getKeyFilename = (key) => {
  const normalized = String(key || '').trim().replace(/\\/g, '/');
  const slashIndex = normalized.lastIndexOf('/');
  return slashIndex < 0 ? normalized : normalized.slice(slashIndex + 1);
};

const normalizeTestCase = (item) => {
  if (!item || typeof item !== 'object') return item;
  return {
    ...item,
    id: item.id ?? item.ID,
    question_id: item.question_id ?? item.QuestionID,
    input_key: item.input_key ?? item.InputKey ?? '',
    output_key: item.output_key ?? item.OutputKey ?? '',
    input_size: item.input_size ?? item.InputSize ?? 0,
    output_size: item.output_size ?? item.OutputSize ?? 0,
    is_hidden: Boolean(item.is_hidden ?? item.IsHidden),
  };
};

const commitTestCase = async ({
  question_pk,
  question_id,
  input_key,
  output_key,
  is_hidden = false,
}) => {
  const response = await axios.post(`${baseUrl}/testcase/oss/commit`, {
    question_pk,
    question_id,
    input_key,
    output_key,
    is_hidden,
  });
  return normalizeTestCase(unwrapApiData(response.data));
};

export const getTestCasesByProblemNumber = async (problemId) => {
  const response = await axios.get(`${baseUrl}/testcase/question/${problemId}`);
  const raw = response.data;
  const result = Array.isArray(raw?.result)
    ? raw.result.map((item) => normalizeTestCase(item))
    : Array.isArray(unwrapApiData(raw))
      ? unwrapApiData(raw).map((item) => normalizeTestCase(item))
      : [];

  return {
    ...(raw && typeof raw === 'object' ? raw : {}),
    result,
    count: Number(raw?.count ?? result.length),
    question_pk: raw?.question_pk,
    question_id: raw?.question_id,
    question_title: raw?.question_title,
  };
};

export const getTestCaseById = async (id) => {
  const response = await axios.get(`${baseUrl}/testcase/${id}`);
  const raw = response.data;
  return mergeResultPayload(raw, normalizeTestCase(unwrapApiData(raw)));
};

export const deleteTestCase = async ({ id }) => {
  const response = await axios.delete(`${baseUrl}/testcase/${id}`);
  return unwrapApiData(response.data);
};

// 测试用例创建统一走 OSS 直传 + /testcase/oss/commit。
// 这里不再保留旧的 POST /testcase/ 调用，避免误用不存在的后端路由。
export const uploadTestCaseViaOss = async ({
  question_number,
  question_pk,
  case_no,
  inputFile,
  outputFile,
  is_hidden = false,
}) => {
  const questionPk = question_pk ?? question_number;
  const qn = toQuestionPk(questionPk);
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

  const result = await commitTestCase({
    question_pk: qn,
    input_key: input.key,
    output_key: output.key,
    is_hidden,
  });

  return {
    input_key: input.key,
    output_key: output.key,
    result,
  };
};

// 更新测试用例也沿用同一套对象键：
// 可只改 hidden 状态，也可先覆盖上传新文件，再调用 PUT /testcase/:id 更新数据库记录。
export const updateTestCaseViaOss = async ({
  id,
  question_number,
  question_pk,
  question_id,
  input_key,
  output_key,
  inputFile,
  outputFile,
  is_hidden = false,
}) => {
  if (!id) throw new Error('id is required');
  if (!input_key || !output_key) {
    throw new Error('input_key and output_key are required');
  }

  let nextInputKey = input_key;
  let nextOutputKey = output_key;

  if (inputFile) {
    const upload = await getOssUploadUrl({
      filename: getKeyFilename(input_key),
      path: getKeyDir(input_key),
    });
    await putToPresignedUrl(upload.url, inputFile);
    nextInputKey = upload.key;
  }

  if (outputFile) {
    const upload = await getOssUploadUrl({
      filename: getKeyFilename(output_key),
      path: getKeyDir(output_key),
    });
    await putToPresignedUrl(upload.url, outputFile);
    nextOutputKey = upload.key;
  }

  const response = await axios.put(`${baseUrl}/testcase/${id}`, {
    question_pk: toQuestionPk(question_pk ?? question_number),
    question_id,
    input_key: nextInputKey,
    output_key: nextOutputKey,
    is_hidden,
  });

  const raw = response.data;
  return {
    ...mergeResultPayload(raw, normalizeTestCase(unwrapApiData(raw))),
    input_key: nextInputKey,
    output_key: nextOutputKey,
  };
};

export const getProblemTestcaseFileTree = async ({
  question_number,
  question_pk,
  recursive = true,
  prefix,
} = {}) => {
  const qn = question_pk ?? question_number;
  const pfx =
    prefix != null ? prefix : ensureDirSuffix(`problems/${toQuestionPk(qn)}`);

  const response = await axios.get(`${baseUrl}/oss/files`, {
    params: {
      prefix: pfx,
      recursive,
    },
  });
  const raw = response.data;
  return {
    ...(raw && typeof raw === 'object' ? raw : {}),
    prefix: raw?.prefix ?? pfx,
    objects: Array.isArray(raw?.objects) ? raw.objects : [],
  };
};
