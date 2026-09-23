const clean = (value, max = 500) => String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max);
const esc = (value) => clean(value, 2000).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.RESEND_API_KEY) return res.status(500).json({ error: "Email service not configured" });
  const b = req.body || {};
  if (b.website) return res.status(200).json({ ok: true });
  const data = {
    name: clean(b.name, 120), phone: clean(b.phone, 80), email: clean(b.email, 160),
    pickup: clean(b.pickup, 180), destination: clean(b.destination, 180), date: clean(b.date, 30),
    time: clean(b.time, 30), passengers: clean(b.passengers, 10), flight: clean(b.flight, 80), notes: clean(b.notes, 1000),
    lang: b.lang === "en" ? "en" : "it"
  };
  if (!data.name || !data.phone || !data.email || !data.pickup || !data.destination || !data.date || !data.time || !data.passengers || !/^\S+@\S+\.\S+$/.test(data.email)) return res.status(400).json({ error: "Missing or invalid fields" });
  const rows = [["Name",data.name],["Phone / WhatsApp",data.phone],["Email",data.email],["Pickup",data.pickup],["Destination",data.destination],["Date",data.date],["Time",data.time],["Passengers",data.passengers],["Flight",data.flight||"—"],["Notes",data.notes||"—"]];
  const table = rows.map(([k,v])=>`<tr><td style="padding:10px 14px;color:#777;border-bottom:1px solid #eee">${esc(k)}</td><td style="padding:10px 14px;font-weight:600;border-bottom:1px solid #eee">${esc(v)}</td></tr>`).join("");
  const adminHtml = `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111"><div style="background:#0b0d0f;color:#efece4;padding:28px"><div style="font-family:Georgia,serif;letter-spacing:3px;font-size:20px">NORTH TRANSFER</div><div style="color:#d4c7a7;font-size:11px;letter-spacing:2px;margin-top:7px">NEW TRANSFER REQUEST</div></div><table style="width:100%;border-collapse:collapse">${table}</table></div>`;
  const confirmHtml = data.lang === "it" ? `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#111"><div style="background:#0b0d0f;color:#efece4;padding:28px;font-family:Georgia,serif;letter-spacing:3px;font-size:20px">NORTH TRANSFER</div><div style="padding:30px"><h2>Richiesta ricevuta</h2><p>Grazie ${esc(data.name)}. Abbiamo ricevuto la tua richiesta di transfer da <b>${esc(data.pickup)}</b> a <b>${esc(data.destination)}</b> per il ${esc(data.date)} alle ${esc(data.time)}.</p><p>Ti risponderemo direttamente con disponibilità e preventivo.</p><p>North Transfer<br>+39 328 951 2249</p></div></div>` : `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#111"><div style="background:#0b0d0f;color:#efece4;padding:28px;font-family:Georgia,serif;letter-spacing:3px;font-size:20px">NORTH TRANSFER</div><div style="padding:30px"><h2>Request received</h2><p>Thank you ${esc(data.name)}. We received your transfer request from <b>${esc(data.pickup)}</b> to <b>${esc(data.destination)}</b> for ${esc(data.date)} at ${esc(data.time)}.</p><p>We will reply directly with availability and a quote.</p><p>North Transfer<br>+39 328 951 2249</p></div></div>`;
  const send = async (payload) => fetch("https://api.resend.com/emails", {method:"POST",headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify(payload)});
  try {
    const admin = await send({from:"North Transfer <booking@northtransfer.it>",to:["book@northtransfer.it"],reply_to:data.email,subject:`Transfer request: ${data.pickup} → ${data.destination} · ${data.date}`,html:adminHtml});
    if (!admin.ok) return res.status(502).json({ error: "Email provider error" });
    await send({from:"North Transfer <booking@northtransfer.it>",to:[data.email],reply_to:"book@northtransfer.it",subject:data.lang==="it"?"North Transfer · Richiesta ricevuta":"North Transfer · Request received",html:confirmHtml});
    return res.status(200).json({ ok: true });
  } catch { return res.status(500).json({ error: "Send failed" }); }
}
