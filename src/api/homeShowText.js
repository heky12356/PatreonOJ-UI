const baseUrl = '/api';

const parseJson = async (response) => {
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.msg || data?.message || text || `HTTP ${response.status}`
    );
  }

  return data || {};
};

export async function getHomeShowText() {
  try {
    const response = await fetch(`${baseUrl}/overview/getHomeText`);
    const data = await parseJson(response);
    return data.home_text ?? data?.data?.home_text ?? '';
  } catch (err) {
    console.error('获取首页展示文本失败:', err);
    return '';
  }
}

export async function updateHomeText(text) {
  try {
    const response = await fetch(`${baseUrl}/overview/updateHomeText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ home_text: text }),
    });

    return await parseJson(response);
  } catch (err) {
    console.error('更新首页展示文本失败:', err);
    return {
      code: 500,
      msg: err?.message || '更新首页展示文本失败',
    };
  }
}

export async function getAnnouncement() {
  try {
    const response = await fetch(`${baseUrl}/overview/getAnnouncement`);
    const data = await parseJson(response);
    return data.announcement ?? data?.data?.announcement ?? '';
  } catch (err) {
    console.error('获取公告失败:', err);
    return '';
  }
}

export async function updateAnnouncement(announcement) {
  try {
    const response = await fetch(`${baseUrl}/overview/updateAnnouncement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ announcement }),
    });

    return await parseJson(response);
  } catch (err) {
    console.error('更新公告失败:', err);
    return {
      code: 500,
      msg: err?.message || '更新公告失败',
    };
  }
}
