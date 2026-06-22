export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,authorization,appkey,appsecret,tr_id,custtype");
  if (req.method === "OPTIONS") return res.status(200).end();

  let targetUrl = req.query.target;
  if (!targetUrl) return res.status(400).json({ error: "target 파라미터 없음" });

  // Vercel은 비표준 포트(9443, 29443) 아웃바운드가 막힐 수 있음
  // KIS는 표준 HTTPS(443)도 지원 - 포트 교체
  targetUrl = targetUrl
    .replace("https://openapi.koreainvestment.com:9443", "https://openapi.koreainvestment.com")
    .replace("https://openapivts.koreainvestment.com:29443", "https://openapivts.koreainvestment.com");

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
    catch { return res.status(502).json({ error: "KIS 파싱 실패", raw: text.slice(0,300), url: targetUrl }); }

    return res.status(response.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message, url: targetUrl });
  }
}
