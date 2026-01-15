async function getFromApi() {
  const response = await fetch(
    'https://v1.hitokoto.cn?c=d&c=a&c=b&c=c&c=i&c=k'
  );
  const data = await response.json();
  return data;
}

export async function getMotto() {
  const data = await getFromApi();
  return {
    hitokoto: data.hitokoto,
    from: data.from,
    from_who: data.from_who,
  };
}
