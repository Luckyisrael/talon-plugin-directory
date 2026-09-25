// Reference: Moove payment-link API client (v1). The API key must never
// ship in the app bundle — keep MOOVE_API_KEY on your backend and call
// this server-side (or behind your own endpoint). Adapt error handling
// and transport to the app's conventions.
const API_BASE = 'https://api.moove.xyz/v1'

export type CreatePaymentLinkInput = {
  /** Amount asked for, as a string in your settlement token: "49.99". */
  toAmount: string
  /** Shown to the payer on checkout — up to 500 characters via the API. */
  description?: string
  /** Payments the link accepts before it completes (widget links are always 1). */
  maxUsage?: number
}

export type PaymentLink = {
  /** The checkout page to send the payer to. */
  url: string
}

export async function createPaymentLink(
  input: CreatePaymentLinkInput,
  apiKey: string,
): Promise<PaymentLink> {
  const res = await fetch(`${API_BASE}/payment-link`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(`Moove payment-link failed: ${res.status} ${await res.text()}`)
  }
  const link = (await res.json()) as PaymentLink
  if (!link.url) {
    throw new Error('Moove payment-link response missing url')
  }
  return link
}
