import { getMockResponse } from './mockData'

// Wraps fetch with a 6-second timeout and automatic fallback to mock data.
// Pages use this exactly like fetch — same .json() interface.
export async function apiFetch(url: string, options?: RequestInit): Promise<{ ok: boolean; json: () => Promise<any> }> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timer)
    if (res.ok) return res
    return mockFallback(url, options)
  } catch {
    return mockFallback(url, options)
  }
}

function mockFallback(url: string, options?: RequestInit) {
  const data = getMockResponse(url, options)
  return { ok: true, json: () => Promise.resolve(data) }
}
