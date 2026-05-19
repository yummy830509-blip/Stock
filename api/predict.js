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
        max_tokens: 200,
        system: "你是一個很有個性的台股算命師，說話像江湖術士又懂財經。根據今天星期幾、月份、市場感覺給出今日台股預測。必須自信、有趣、帶點玄學口吻。只回傳JSON不要其他文字：{\"direction\":\"漲\",\"confidence\":\"高\",\"reason\":\"有趣的預測理由，30字內，可以用算命或玄學口吻\"} direction只能是漲跌平。",
        messages: [{ role: "user", content: "今天" + today + "，星期" + dow + "，台股走向如何？" }]
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
