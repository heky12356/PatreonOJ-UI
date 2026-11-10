export const getRequestErrorMessage = (error, fallback = '请求失败') => {
  const msg =
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;

  return String(msg);
};
