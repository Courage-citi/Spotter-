import { useState, useEffect, useCallback, useRef } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg: #030a0e; --surface: #060f14; --panel: #0a1820; --border: #0d2535;
    --accent: #00e5ff; --green: #00ff88; --red: #ff3366; --yellow: #ffd000;
    --text: #8ab4c8; --bright: #d4eef8; --dim: #2a4a5e;
    --glow: 0 0 20px rgba(0,229,255,0.15);
  }
  body { background: var(--bg); color: var(--text); font-family: 'Share Tech Mono', monospace; min-height: 100vh; overflow-x: hidden; }
  .scanline { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.015) 2px, rgba(0,229,255,0.015) 4px); pointer-events: none; z-index: 9999; }
  .app { max-width: 1400px; margin: 0 auto; padding: 16px; display: grid; grid-template-rows: auto 1fr; gap: 12px; min-height: 100vh; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
  .logo { font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 900; color: var(--accent); letter-spacing: 3px; text-shadow: 0 0 30px rgba(0,229,255,0.5); display: flex; align-items: center; gap: 10px; }
  .logo-dot { width: 8px; height: 8px; background: var(--green); border-radius: 50%; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 6px var(--green)} 50%{opacity:0.4;box-shadow:none} }
  .header-stats { display: flex; gap: 24px; font-size: 11px; }
  .stat-item { text-align: right; }
  .stat-label { color: var(--dim); font-size: 9px; letter-spacing: 1px; }
  .stat-value { color: var(--bright); font-size: 14px; }
  .stat-value.green { color: var(--green); }
  .stat-value.red { color: var(--red); }
  .main-grid { display: grid; grid-template-columns: 1fr 380px; grid-template-rows: auto 1fr; gap: 12px; }
  .panel { background: var(--panel); border: 1px solid var(--border); border-radius: 4px; overflow: hidden; }
  .panel-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid var(--border); background: rgba(0,229,255,0.03); }
  .panel-title { font-family: 'Orbitron', sans-serif; font-size: 10px; letter-spacing: 2px; color: var(--accent); font-weight: 700; }
  .badge { font-size: 9px; padding: 2px 8px; border-radius: 2px; letter-spacing: 1px; }
  .badge-live { background: rgba(0,255,136,0.1); color: var(--green); border: 1px solid rgba(0,255,136,0.3); }
  .badge-ai { background: rgba(0,229,255,0.1); color: var(--accent); border: 1px solid rgba(0,229,255,0.3); }
  .scan-btn { font-family: 'Share Tech Mono', monospace; font-size: 10px; padding: 6px 16px; background: transparent; border: 1px solid var(--accent); color: var(--accent); cursor: pointer; letter-spacing: 2px; transition: all 0.2s; border-radius: 2px; }
  .scan-btn:hover { background: rgba(0,229,255,0.1); box-shadow: var(--glow); }
  .scan-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .scan-btn.scanning { border-color: var(--yellow); color: var(--yellow); animation: borderPulse 0.8s infinite; }
  @keyframes borderPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .token-list { overflow-y: auto; max-height: 340px; }
  .token-row { display: grid; grid-template-columns: 40px 1fr 90px 80px 80px 100px 80px; gap: 8px; align-items: center; padding: 10px 14px; border-bottom: 1px solid rgba(13,37,53,0.5); cursor: pointer; transition: background 0.15s; font-size: 12px; }
  .token-row:hover { background: rgba(0,229,255,0.04); }
  .token-row.selected { background: rgba(0,229,255,0.07); border-left: 2px solid var(--accent); }
  .token-rank { color: var(--dim); font-size: 10px; text-align: center; }
  .token-symbol { color: var(--accent); font-size: 11px; }
  .token-fullname { color: var(--dim); font-size: 10px; }
  .token-price { text-align: right; color: var(--bright); }
  .token-change { text-align: right; }
  .pos { color: var(--green); }
  .neg { color: var(--red); }
  .token-mcap { text-align: right; color: var(--text); font-size: 11px; }
  .token-volume { text-align: right; color: var(--dim); font-size: 10px; }
  .xscore { display: flex; align-items: center; justify-content: flex-end; gap: 4px; font-size: 11px; font-weight: bold; }
  .xscore-bar { height: 4px; border-radius: 2px; flex: 1; background: var(--border); overflow: hidden; }
  .xscore-fill { height: 100%; border-radius: 2px; transition: width 0.5s; }
  .list-header { display: grid; grid-template-columns: 40px 1fr 90px 80px 80px 100px 80px; gap: 8px; padding: 6px 14px; font-size: 9px; color: var(--dim); letter-spacing: 1px; border-bottom: 1px solid var(--border); }
  .empty-state { padding: 40px; text-align: center; color: var(--dim); font-size: 12px; line-height: 2; }
  .loader { color: var(--yellow); animation: blink 0.6s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .right-col { grid-column: 2; grid-row: 1 / 3; display: flex; flex-direction: column; gap: 12px; }
  .trade-section { padding: 14px; display: flex; flex-direction: column; gap: 12px; }
  .selected-token-info { display: flex; justify-content: space-between; align-items: flex-start; }
  .sel-name { font-family: 'Orbitron', sans-serif; font-size: 14px; color: var(--bright); font-weight: 700; }
  .sel-price { font-size: 18px; color: var(--accent); font-weight: bold; }
  .sel-change { font-size: 11px; }
  .trade-tabs { display: flex; gap: 0; }
  .trade-tab { flex: 1; padding: 8px; text-align: center; font-size: 11px; border: 1px solid var(--border); cursor: pointer; letter-spacing: 1px; transition: all 0.2s; background: transparent; font-family: 'Share Tech Mono', monospace; }
  .trade-tab.buy { color: var(--green); }
  .trade-tab.buy.active { background: rgba(0,255,136,0.1); border-color: var(--green); }
  .trade-tab.sell { color: var(--red); }
  .trade-tab.sell.active { background: rgba(255,51,102,0.1); border-color: var(--red); }
  .input-group { display: flex; flex-direction: column; gap: 4px; }
  .input-label { font-size: 9px; color: var(--dim); letter-spacing: 1px; }
  .trade-input { background: var(--surface); border: 1px solid var(--border); color: var(--bright); font-family: 'Share Tech Mono', monospace; font-size: 13px; padding: 8px 10px; width: 100%; outline: none; transition: border-color 0.2s; border-radius: 2px; }
  .trade-input:focus { border-color: var(--accent); }
  .quick-pcts { display: flex; gap: 4px; }
  .pct-btn { flex: 1; padding: 4px; font-size: 10px; background: transparent; border: 1px solid var(--border); color: var(--dim); cursor: pointer; font-family: 'Share Tech Mono', monospace; transition: all 0.15s; border-radius: 2px; }
  .pct-btn:hover { border-color: var(--accent); color: var(--accent); }
  .execute-btn { width: 100%; padding: 12px; font-family: 'Orbitron', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; border: none; cursor: pointer; transition: all 0.2s; border-radius: 2px; }
  .execute-btn.buy-btn { background: rgba(0,255,136,0.15); color: var(--green); border: 1px solid var(--green); }
  .execute-btn.buy-btn:hover { background: rgba(0,255,136,0.25); box-shadow: 0 0 20px rgba(0,255,136,0.2); }
  .execute-btn.sell-btn { background: rgba(255,51,102,0.15); color: var(--red); border: 1px solid var(--red); }
  .execute-btn.sell-btn:hover { background: rgba(255,51,102,0.25); box-shadow: 0 0 20px rgba(255,51,102,0.2); }
  .wallet-row { display: flex; justify-content: space-between; font-size: 11px; }
  .wallet-label { color: var(--dim); }
  .wallet-val { color: var(--bright); }
  .ai-panel { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
  .ai-content { padding: 12px 14px; font-size: 11px; line-height: 1.7; overflow-y: auto; flex: 1; color: var(--text); min-height: 160px; }
  .ai-loading { color: var(--yellow); }
  .ai-placeholder { color: var(--dim); }
  .score-line { color: var(--green); font-size: 13px; margin-bottom: 8px; }
  .risk-line { color: var(--red); font-size: 11px; }
  .portfolio-panel { padding: 12px 14px; }
  .port-row { display: grid; grid-template-columns: 1fr 70px 70px 60px; gap: 4px; padding: 7px 0; border-bottom: 1px solid rgba(13,37,53,0.5); font-size: 11px; align-items: center; }
  .port-sym { color: var(--accent); }
  .port-qty { color: var(--dim); font-size: 10px; }
  .port-val { text-align: right; color: var(--bright); }
  .port-pct { text-align: right; font-size: 11px; }
  .port-empty { color: var(--dim); font-size: 11px; text-align: center; padding: 20px 0; }
  .log-panel { grid-column: 1; }
  .log-content { padding: 10px 14px; max-height: 150px; overflow-y: auto; }
  .log-entry { font-size: 10px; padding: 3px 0; border-bottom: 1px solid rgba(13,37,53,0.3); display: flex; gap: 10px; }
  .log-time { color: var(--dim); min-width: 60px; }
  .log-msg { flex: 1; }
  .log-buy { color: var(--green); }
  .log-sell { color: var(--red); }
  .log-info { color: var(--text); }
  .log-warn { color: var(--yellow); }
  .toast { position: fixed; bottom: 20px; right: 20px; padding: 10px 18px; font-size: 12px; border-radius: 2px; animation: toastIn 0.3s ease; z-index: 1000; }
  @keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  .toast-success { background: rgba(0,255,136,0.15); border: 1px solid var(--green); color: var(--green); }
  .toast-error { background: rgba(255,51,102,0.15); border: 1px solid var(--red); color: var(--red); }
  .disclaimer { font-size: 9px; color: var(--dim); text-align: center; padding: 8px; border-top: 1px solid var(--border); letter-spacing: 1px; }
`;

const fmt = {
  usd: v => v >= 1e9 ? "$" + (v/1e9).toFixed(2) + "B" : v >= 1e6 ? "$" + (v/1e6).toFixed(1) + "M" : v >= 1e3 ? "$" + (v/1e3).toFixed(1) + "K" : "$" + v.toFixed(4),
  pct: v => (v > 0 ? "+" : "") + v.toFixed(2) + "%",
  num: v => v.toFixed(v < 0.01 ? 6 : v < 1 ? 4 : 2),
  time: () => new Date().toLocaleTimeString("en", { hour12: false }),
};

const INITIAL_TOKENS = [
  { id: "pepe", symbol: "PEPE", name: "Pepe", price: 0.000012, change24h: 18.4, mcap: 5100000000, vol24h: 820000000, xScore: 72 },
  { id: "bonk", symbol: "BONK", name: "Bonk", price: 0.0000248, change24h: 11.2, mcap: 1800000000, vol24h: 340000000, xScore: 68 },
  { id: "wif", symbol: "WIF", name: "dogwifhat", price: 2.34, change24h: -4.1, mcap: 2340000000, vol24h: 290000000, xScore: 61 },
  { id: "brett", symbol: "BRETT", name: "Brett", price: 0.0914, change24h: 31.7, mcap: 890000000, vol24h: 210000000, xScore: 79 },
  { id: "mog", symbol: "MOG", name: "Mog Coin", price: 0.00000178, change24h: 55.3, mcap: 650000000, vol24h: 180000000, xScore: 85 },
  { id: "wen", symbol: "WEN", name: "Wen", price: 0.000073, change24h: -8.6, mcap: 450000000, vol24h: 95000000, xScore: 52 },
  { id: "popcat", symbol: "POPCAT", name: "Popcat", price: 0.612, change24h: 22.8, mcap: 610000000, vol24h: 140000000, xScore: 74 },
  { id: "andy", symbol: "ANDY", name: "Andy on Base", price: 0.000315, change24h: 88.4, mcap: 310000000, vol24h: 88000000, xScore: 91 },
];

function xScoreColor(s) {
  if (s >= 80) return "var(--green)";
  if (s >= 60) return "var(--yellow)";
  return "var(--red)";
}

async function callClaude(systemPrompt, userPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await res.json();
  return data.content?.find(b => b.type === "text")?.text || "";
}

export default function TradingBot() {
  const [tokens, setTokens] = useState(INITIAL_TOKENS);
  const [selected, setSelected] = useState(INITIAL_TOKENS[0]);
  const [scanning, setScanning] = useState(false);
  const [tradeMode, setTradeMode] = useState("buy");
  const [amount, setAmount] = useState("");
  const [portfolio, setPortfolio] = useState({ USDT: 10000 });
  const [positions, setPositions] = useState({});
  const [log, setLog] = useState([{ time: fmt.time(), msg: "System initialised. $10,000 paper wallet ready.", type: "info" }]);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Live price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens(prev => prev.map(t => {
        const delta = (Math.random() - 0.49) * 0.025;
        return {
          ...t,
          price: Math.max(t.price * (1 + delta), 0.0000001),
          change24h: t.change24h + (Math.random() - 0.5) * 0.3,
        };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Sync selected with live prices
  useEffect(() => {
    if (selected) {
      const live = tokens.find(t => t.id === selected.id);
      if (live) setSelected(live);
    }
  }, [tokens]);

  // AI scan for new tokens
  const runScan = useCallback(async () => {
    setScanning(true);
    addLog("AI scanner activated — hunting for 10x gems...", "warn");
    try {
      const raw = await callClaude(
        "You are a crypto data API. Return ONLY valid JSON arrays. No text, no markdown backticks.",
        `Generate a JSON array of 8 trending tokens with high 10x potential. Mix meme coins, DeFi tokens, and new launches.
Return ONLY valid JSON like: [{"id":"uid","symbol":"SYM","name":"Full Name","price":0.0001,"change24h":25.5,"mcap":5000000,"vol24h":1500000,"xScore":82}]
Rules: xScore 0-100 (10x potential), prices $0.000001 to $100, mcap $500K to $5B, mix positive and negative change24h, creative realistic names.`
      );
      const clean = raw.replace(/```json|```/g, "").trim();
      const newTokens = JSON.parse(clean);
      if (Array.isArray(newTokens) && newTokens.length > 0) {
        setTokens(newTokens);
        setSelected(newTokens[0]);
        addLog("Scan complete — " + newTokens.length + " tokens identified.", "info");
        showToast("AI scan complete!", "success");
      }
    } catch (e) {
      addLog("Scan error — market data unavailable.", "warn");
      showToast("Scan failed — try again", "error");
    }
    setScanning(false);
  }, []);

  // AI analysis per token
  const analyseToken = useCallback(async (token) => {
    setAiLoading(true);
    setAiText("");
    try {
      const result = await callClaude(
        "You are a ruthlessly honest crypto trading analyst. Be concise, punchy, data-driven. No fluff.",
        `Analyse ${token.name} (${token.symbol}) for 10x potential:
Price: $${fmt.num(token.price)} | 24h: ${fmt.pct(token.change24h)} | MCap: ${fmt.usd(token.mcap)} | Vol: ${fmt.usd(token.vol24h)} | Score: ${token.xScore}/100

Give 5 lines covering: 10x potential reasoning, key risk, vol/mcap signal, momentum, recommendation.
Start with [SCORE: ${token.xScore}/100] and end with [RISK: LOW/MED/HIGH]`
      );
      setAiText(result);
    } catch {
      setAiText("⚠ AI analysis temporarily unavailable.");
    }
    setAiLoading(false);
  }, []);

  useEffect(() => { if (selected) analyseToken(selected); }, [selected?.id]);

  const executeTrade = () => {
    if (!selected || !amount || isNaN(parseFloat(amount))) {
      showToast("Enter a valid amount", "error"); return;
    }
    const usdAmt = parseFloat(amount);
    const sym = selected.symbol;
    const price = selected.price;

    if (tradeMode === "buy") {
      if (usdAmt > (portfolio.USDT || 0)) { showToast("Insufficient USDT", "error"); return; }
      const qty = usdAmt / price;
      setPortfolio(p => ({ ...p, USDT: p.USDT - usdAmt }));
      setPositions(p => {
        const existing = p[sym] || { qty: 0, avgPrice: 0 };
        const totalQty = existing.qty + qty;
        const avgPrice = (existing.qty * existing.avgPrice + qty * price) / totalQty;
        return { ...p, [sym]: { qty: totalQty, avgPrice } };
      });
      addLog("BUY " + qty.toFixed(4) + " " + sym + " @ $" + fmt.num(price) + " | Cost: $" + usdAmt.toFixed(2), "buy");
      showToast("Bought " + qty.toFixed(4) + " " + sym, "success");
    } else {
      const pos = positions[sym];
      if (!pos || pos.qty <= 0) { showToast("No " + sym + " position", "error"); return; }
      const sellQty = Math.min(usdAmt / price, pos.qty);
      const proceeds = sellQty * price;
      const pnl = (price - pos.avgPrice) * sellQty;
      setPortfolio(p => ({ ...p, USDT: p.USDT + proceeds }));
      setPositions(p => {
        const remaining = (p[sym]?.qty || 0) - sellQty;
        if (remaining <= 0.000001) { const n = { ...p }; delete n[sym]; return n; }
        return { ...p, [sym]: { ...p[sym], qty: remaining } };
      });
      addLog("SELL " + sellQty.toFixed(4) + " " + sym + " @ $" + fmt.num(price) + " | P&L: " + (pnl >= 0 ? "+" : "") + "$" + pnl.toFixed(2), "sell");
      showToast("Sold " + sellQty.toFixed(4) + " " + sym, "success");
    }
    setAmount("");
  };

  const addLog = (msg, type) => setLog(p => [{ time: fmt.time(), msg, type }, ...p.slice(0, 49)]);
  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };
  const setQuickPct = (pct) => {
    if (tradeMode === "buy") setAmount(((portfolio.USDT || 0) * pct / 100).toFixed(2));
    else if (selected && positions[selected.symbol]) {
      const pos = positions[selected.symbol];
      setAmount((pos.qty * selected.price * pct / 100).toFixed(2));
    }
  };

  const posEntries = Object.entries(positions).map(([sym, pos]) => {
    const token = tokens.find(t => t.symbol === sym);
    const currentPrice = token?.price || pos.avgPrice;
    return { sym, qty: pos.qty, value: pos.qty * currentPrice, pnlPct: ((currentPrice - pos.avgPrice) / pos.avgPrice) * 100 };
  });

  const totalPortValue = (portfolio.USDT || 0) + posEntries.reduce((s, p) => s + p.value, 0);
  const totalPnlPct = ((totalPortValue - 10000) / 10000) * 100;

  const renderAI = () => {
    if (aiLoading) return <div className="ai-loading">▮ ANALYSING {selected?.symbol}...</div>;
    if (!aiText) return <div className="ai-placeholder">Select a token to run AI analysis.</div>;
    return aiText.split("\n").map((line, i) => {
      if (line.startsWith("[SCORE")) return <div key={i} className="score-line">{line}</div>;
      if (line.startsWith("[RISK")) return <div key={i} className="risk-line">{line}</div>;
      return <div key={i}>{line}</div>;
    });
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="scanline" />
      {toast && <div className={"toast toast-" + toast.type}>{toast.msg}</div>}

      <div className="app">
        <header className="header">
          <div className="logo">
            <div className="logo-dot" />
            APEX.SCAN
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-label">PORTFOLIO</div>
              <div className={"stat-value " + (totalPnlPct >= 0 ? "green" : "red")}>${totalPortValue.toFixed(2)}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">TOTAL P&L</div>
              <div className={"stat-value " + (totalPnlPct >= 0 ? "green" : "red")}>{fmt.pct(totalPnlPct)}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">USDT BAL</div>
              <div className="stat-value">${(portfolio.USDT || 0).toFixed(2)}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">POSITIONS</div>
              <div className="stat-value">{posEntries.length}</div>
            </div>
          </div>
        </header>

        <div className="main-grid">
          {/* Scanner */}
          <div className="panel" style={{ gridColumn: 1 }}>
            <div className="panel-header">
              <span className="panel-title">TOKEN SCANNER</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span className="badge badge-live">● LIVE PRICES</span>
                <button className={"scan-btn " + (scanning ? "scanning" : "")} onClick={runScan} disabled={scanning}>
                  {scanning ? "SCANNING..." : "AI SCAN"}
                </button>
              </div>
            </div>
            <div className="list-header">
              <span>#</span><span>TOKEN</span>
              <span style={{textAlign:"right"}}>PRICE</span>
              <span style={{textAlign:"right"}}>24H</span>
              <span style={{textAlign:"right"}}>MCAP</span>
              <span style={{textAlign:"right"}}>10X SCORE</span>
              <span style={{textAlign:"right"}}>VOLUME</span>
            </div>
            <div className="token-list">
              {tokens.map((t, i) => (
                <div key={t.id} className={"token-row " + (selected?.id === t.id ? "selected" : "")} onClick={() => setSelected(t)}>
                  <span className="token-rank">{i + 1}</span>
                  <div><div className="token-symbol">{t.symbol}</div><div className="token-fullname">{t.name}</div></div>
                  <span className="token-price">${fmt.num(t.price)}</span>
                  <span className={"token-change " + (t.change24h >= 0 ? "pos" : "neg")}>{fmt.pct(t.change24h)}</span>
                  <span className="token-mcap">{fmt.usd(t.mcap)}</span>
                  <div className="xscore">
                    <div className="xscore-bar">
                      <div className="xscore-fill" style={{ width: t.xScore + "%", background: xScoreColor(t.xScore) }} />
                    </div>
                    <span style={{ color: xScoreColor(t.xScore), minWidth: 28 }}>{t.xScore}</span>
                  </div>
                  <span className="token-volume">{fmt.usd(t.vol24h)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="right-col">
            {/* Trade panel */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">TRADE</span>
                <span className="badge badge-live">PAPER TRADING</span>
              </div>
              <div className="trade-section">
                {selected && (
                  <>
                    <div className="selected-token-info">
                      <div>
                        <div className="sel-name">{selected.symbol}</div>
                        <div style={{ fontSize: 10, color: "var(--dim)" }}>{selected.name}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="sel-price">${fmt.num(selected.price)}</div>
                        <div className={"sel-change " + (selected.change24h >= 0 ? "pos" : "neg")}>{fmt.pct(selected.change24h)}</div>
                      </div>
                    </div>
                    <div className="trade-tabs">
                      <button className={"trade-tab buy " + (tradeMode === "buy" ? "active" : "")} onClick={() => setTradeMode("buy")}>BUY</button>
                      <button className={"trade-tab sell " + (tradeMode === "sell" ? "active" : "")} onClick={() => setTradeMode("sell")}>SELL</button>
                    </div>
                    <div className="wallet-row">
                      <span className="wallet-label">USDT BALANCE</span>
                      <span className="wallet-val">${(portfolio.USDT || 0).toFixed(2)}</span>
                    </div>
                    {positions[selected.symbol] && (
                      <div className="wallet-row">
                        <span className="wallet-label">{selected.symbol} HELD</span>
                        <span className="wallet-val">{positions[selected.symbol].qty.toFixed(4)}</span>
                      </div>
                    )}
                    <div className="input-group">
                      <span className="input-label">AMOUNT (USD)</span>
                      <input className="trade-input" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                    <div className="quick-pcts">
                      {[25, 50, 75, 100].map(p => (
                        <button key={p} className="pct-btn" onClick={() => setQuickPct(p)}>{p}%</button>
                      ))}
                    </div>
                    {amount && !isNaN(parseFloat(amount)) && (
                      <div className="wallet-row">
                        <span className="wallet-label">YOU GET ≈</span>
                        <span className="wallet-val">
                          {tradeMode === "buy"
                            ? (parseFloat(amount) / selected.price).toFixed(4) + " " + selected.symbol
                            : "$" + parseFloat(amount).toFixed(2) + " USDT"}
                        </span>
                      </div>
                    )}
                    <button className={"execute-btn " + (tradeMode === "buy" ? "buy-btn" : "sell-btn")} onClick={executeTrade}>
                      {tradeMode === "buy" ? "▲ BUY " + selected.symbol : "▼ SELL " + selected.symbol}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* AI analysis */}
            <div className="panel ai-panel">
              <div className="panel-header">
                <span className="panel-title">AI ANALYSIS</span>
                <span className="badge badge-ai">CLAUDE POWERED</span>
              </div>
              <div className="ai-content">{renderAI()}</div>
            </div>

            {/* Positions */}
            <div className="panel">
              <div className="panel-header"><span className="panel-title">OPEN POSITIONS</span></div>
              <div className="portfolio-panel">
                {posEntries.length === 0 ? (
                  <div className="port-empty">No open positions — start trading</div>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 70px 60px", gap: 4, padding: "4px 0", fontSize: 9, color: "var(--dim)", letterSpacing: 1 }}>
                      <span>TOKEN</span><span style={{textAlign:"right"}}>VALUE</span>
                      <span style={{textAlign:"right"}}>P&L</span><span style={{textAlign:"right"}}>QTY</span>
                    </div>
                    {posEntries.map(p => (
                      <div key={p.sym} className="port-row">
                        <span className="port-sym">{p.sym}</span>
                        <span className="port-val">${p.value.toFixed(2)}</span>
                        <span className={"port-pct " + (p.pnlPct >= 0 ? "pos" : "neg")}>{fmt.pct(p.pnlPct)}</span>
                        <span className="port-qty">{p.qty.toFixed(4)}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Activity log */}
          <div className="panel log-panel">
            <div className="panel-header"><span className="panel-title">ACTIVITY LOG</span></div>
            <div className="log-content">
              {log.map((e, i) => (
                <div key={i} className="log-entry">
                  <span className="log-time">{e.time}</span>
                  <span className={"log-msg log-" + e.type}>{e.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="disclaimer">
          ⚠ PAPER TRADING ONLY — SIMULATED PRICES — NOT FINANCIAL ADVICE — CRYPTO IS HIGH RISK
        </div>
      </div>
    </>
  );
}
