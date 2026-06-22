export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,authorization,appkey,appsecret,tr_id,custtype");
  if (req.method === "OPTIONS") return res.status(200).end();

  const targetUrl = req.query.target;
  if (!targetUrl) return res.status(400).json({ error: "target 없음" });

  try {
    const forwardHeaders = { "Content-Type": "application/json; charset=utf-8" };
    for (const key of ["authorization","appkey","appsecret","tr_id","custtype"]) {
      if (req.headers[key]) forwardHeaders[key] = req.headers[key];
    }
    const fetchOptions = { method: req.method, headers: forwardHeaders };
    if (req.method === "POST") {
      fetchOptions.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch { return res.status(502).json({ error: `파싱실패: ${text.slice(0,200)}` }); }
    return res.status(response.status).json(data);
  } catch (e) {
    // fetch 자체 실패 - 연결 오류 상세 반환
    return res.status(500).json({ error: `연결실패: ${e.message}`, cause: e.cause?.message || "" });
  }
}
