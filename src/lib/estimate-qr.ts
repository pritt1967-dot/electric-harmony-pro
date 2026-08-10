import QRCode from "qrcode";

/** Public URL of an estimate page for a given token. */
export function estimatePublicUrl(token: string, origin?: string) {
  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/smeta/${token}`;
}

export async function qrDataUrl(text: string, size = 512) {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#111111", light: "#FFFFFF" },
  });
}

export async function downloadQrPng(text: string, fileName: string) {
  const url = await qrDataUrl(text, 1024);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
}
