// api/predict.js - Vercel Serverless Function
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing API key" });

  // 台灣時間今天的日期
  const tw = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
  const todayKey = tw.toISOString().slice(0, 10);
  const today = tw.toLocaleDateString("zh-TW", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        system: `你是台股分析師。今天是 ${today}（台灣時間）。
請搜尋昨晚美股收盤、台指期夜盤、費城半導體指數、台積電ADR、重要財經新聞，綜合判斷今日台股走向。
只回傳 JSON，不要任何其他文字或 markdown：
{"direction":"漲","confidence":"高","reason":"50字內中文理由"}
direction 只能是 漲、跌、平 三選一。`,
        messages: [{
          role: "user",
          content: `今天 ${today} 台股會漲跌還是平？請搜尋最新資訊判斷。`,
        }],
      }),
    });

    const data = await response.json();
    const text = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (!["漲", "跌", "平"].includes(parsed.direction)) throw new Error("invalid");

    return res.json({ date: todayKey, ...parsed });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
