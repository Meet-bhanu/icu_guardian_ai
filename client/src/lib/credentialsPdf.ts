interface CredentialsPdfOptions {
  type: "patient" | "doctor";
  id: string;
  username: string;
  password: string;
  displayName?: string;
  qrDataUrl?: string;
}

function buildPrintHtml(opts: CredentialsPdfOptions): string {
  const title = opts.type === "patient" ? "Patient Portal Credentials" : "Doctor Portal Credentials";
  const idLabel = opts.type === "patient" ? "Patient ID" : "Doctor ID";
  const hospitalUrl = window.location.origin + "/login";

  return `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; }
    .header { text-align: center; margin-bottom: 32px; }
    .header h1 { color: #0d9488; margin: 0; }
    .card { border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; max-width: 480px; margin: 0 auto; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .label { color: #6b7280; }
    .value { font-weight: bold; font-family: monospace; }
    .qr { text-align: center; margin-top: 24px; }
    .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #9ca3af; }
    .warning { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px; margin-top: 16px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>HealthHalo — ICU Guardian AI</h1>
    <p>${title}</p>
    ${opts.displayName ? `<p><strong>${opts.displayName}</strong></p>` : ""}
  </div>
  <div class="card">
    <div class="row"><span class="label">${idLabel}</span><span class="value">${opts.id}</span></div>
    <div class="row"><span class="label">Username</span><span class="value">${opts.username}</span></div>
    <div class="row"><span class="label">Temporary Password</span><span class="value">${opts.password}</span></div>
    <div class="row"><span class="label">Login URL</span><span class="value">${hospitalUrl}</span></div>
    ${opts.qrDataUrl ? `<div class="qr"><img src="${opts.qrDataUrl}" width="160" height="160" alt="QR Code"/><p>Scan to open login page</p></div>` : ""}
    <div class="warning">⚠ Change your password after first login. Keep these credentials confidential.</div>
  </div>
  <div class="footer">Generated on ${new Date().toLocaleString()}</div>
</body>
</html>`;
}

export function printCredentials(opts: CredentialsPdfOptions): void {
  const html = buildPrintHtml(opts);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}

export function downloadCredentialsPdf(opts: CredentialsPdfOptions): void {
  const html = buildPrintHtml(opts);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opts.type}-credentials-${opts.id}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
