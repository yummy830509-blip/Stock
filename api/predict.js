module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing API key" });

  const tw = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
  const todayKey = tw.toISOString().slice(0, 10);
  const dow = tw.getDay();
  const today = tw.toLocaleDateString("zh-TW", {
    year: "numeric", month: "long", day: "numeric", weekday: "long"
  });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        system: "你是股市預言機。請搜尋今日最新財經新聞、美股期貨、台指期、日經指數，預測今日三大市場走向，每個附上簡短理由，並附一句股神名言。只回傳JSON不要其他文字：{\"taiwan\":{\"direction\":\"漲\",\"confidence\":\"高\",\"reason\":\"20字內理由\"},\"us\":{\"direction\":\"跌\",\"confidence\":\"中\",\"reason\":\"20字內理由\"},\"japan\":{\"direction\":\"平\",\"confidence\":\"低\",\"reason\":\"20字內理由\"},\"quote\":\"股神名言40字內\"} direction只能是漲跌平。",
        messages: [{ role: "user", content: "今天" + today + "，請搜尋最新資訊後預測台股、美股、日股走向。" }]
      })
    });

    const data = await response.json();
    if (!data.content) throw new Error(JSON.stringify(data));
    const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return res.json({ date: todayKey, ...parsed });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
