export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const targetUrl = req.query.target;
  if (!targetUrl) return res.status(400).json({ error: "target 없음" });

  try {
    // 전달할 헤더 명시적으로 매핑
    const forwardHeaders = {
      "Content-Type": "application/json; charset=utf-8",
    };

    // 모든 KIS 필수 헤더 전달
    const kisHeaders = ["authorization", "appkey", "appsecret", "tr_id", "custtype", "tr_cont", "gt_uid"];
    for (const key of kisHeaders) {
      const val = req.headers[key] || req.headers[key.toLowerCase()];
      if (val) forwardHeaders[key] = val;
    }

    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders,
    };

    if (req.method === "POST") {
      fetchOptions.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();

    let data;
    try { data = JSON.parse(text); }
    catch { return res.status(502).json({ error: `파싱실패`, raw: text.slice(0, 300) }); }

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: `연결실패: ${e.message}` });
  }
}
