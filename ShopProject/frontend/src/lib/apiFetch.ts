import { getMockResponse } from './mockData'

// Returns mock data instantly — no network call, no delay.
export async function apiFetch(url: string, options?: RequestInit): Promise<{ ok: boolean; json: () => Promise<any> }> {
  const data = getMockResponse(url, options)
  return { ok: true, json: () => Promise.resolve(data) }
}
