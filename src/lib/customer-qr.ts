import { SITE_URL } from "@/lib/seo";

/**
 * Постоянная ссылка заказчика. Строится только из токена заказчика —
 * номер сметы или заказа в неё не входит, поэтому новый заказ QR не меняет.
 */
export function customerPublicUrl(customerToken: string, origin?: string) {
  return `${origin ?? SITE_URL}/klient/${customerToken}`;
}
