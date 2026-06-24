export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const body = req.method === "POST"
      ? (typeof req.body === "string" ? JSON.parse(req.body) : req.body)
      : {};

    const { _target, _method, _headers, _body } = body;

    if (!_target) return res.status(400).json({ error: "target 없음" });

    const fetchOptions = {
      method: _method || "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...(_headers || {}),
      },
    };

    if (_body) fetchOptions.body = JSON.stringify(_body);

    const response = await fetch(_target, fetchOptions);
    const text = await response.text();

    let data;
    try { data = JSON.parse(text); }
    catch { return res.status(502).json({ error: "파싱실패", raw: text.slice(0, 300) }); }

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
