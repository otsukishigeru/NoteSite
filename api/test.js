export default async function handler(req, res) {
  const KV_URL   = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  // membersキーを正しい形式で上書き
  const setRes = await fetch(`${KV_URL}/set/members`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ value: '[]' })
  });
  const setData = await setRes.json();

  // 確認
  const getRes = await fetch(`${KV_URL}/get/members`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  });
  const getData = await getRes.json();

  return res.status(200).json({ setResult: setData, membersRaw: getData });
}
