export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,authorization,appkey,appsecret,tr_id,custtype");

  if (req.method === "OPTIONS") return res.status(200).end();

  const targetUrl = req.query.target;
  if (!targetUrl) return res.status(400).json({ error: "target 파라미터 없음" });

  try {
    const forwardHeaders = {
      "Content-Type": "application/json; charset=utf-8",
    };

    // 인증 헤더 전달
    const headerKeys = ["authorization", "appkey", "appsecret", "tr_id", "custtype"];
    for (const key of headerKeys) {
      if (req.headers[key]) forwardHeaders[key] = req.headers[key];
    }

    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders,
    };

    if (req.method === "POST") {
      const bodyStr = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      fetchOptions.body = bodyStr;
    }

    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "KIS 응답 파싱 실패", raw: text.slice(0, 200) });
    }

    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
