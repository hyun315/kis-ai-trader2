export default async function handler(req, res) {
  // 캐시 완전 비활성화 (304 방지)
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  // CORS
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

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: `연결실패: ${e.message}` });
  }
}
