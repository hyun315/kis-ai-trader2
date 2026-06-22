export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,authorization,appkey,appsecret,tr_id");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { url, ...headers } = req.headers;
  const targetUrl = req.query.target;
  if (!targetUrl) return res.status(400).json({ error: "target 파라미터 없음" });

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...(req.headers.authorization && { authorization: req.headers.authorization }),
        ...(req.headers.appkey && { appkey: req.headers.appkey }),
        ...(req.headers.appsecret && { appsecret: req.headers.appsecret }),
        ...(req.headers.tr_id && { tr_id: req.headers.tr_id }),
      },
    };
    if (req.method === "POST" && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
