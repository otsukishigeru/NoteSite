export default async function handler(req, res) {
  const KV_URL   = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  try {
    // テスト：単純な文字列をsetする
    const setRes = await fetch(`${KV_URL}/set/testkey/testvalue`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const setData = await setRes.json();

    // テスト：getする
    const getRes = await fetch(`${KV_URL}/get/testkey`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const getData = await getRes.json();

    // membersキーの中身を確認
    const membersRes = await fetch(`${KV_URL}/get/members`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const membersData = await membersRes.json();

    return res.status(200).json({
      setResult: setData,
      getResult: getData,
      membersRaw: membersData
    });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
