const baseUrl = process.env.APP_URL ?? "http://localhost:5173";
const response = await fetch(`${baseUrl}/api/cron/daily`, { method: "POST", headers: process.env.CRON_SECRET ? { authorization: `Bearer ${process.env.CRON_SECRET}` } : undefined });
console.log(await response.text());
if (!response.ok) process.exitCode = 1;

export {};
