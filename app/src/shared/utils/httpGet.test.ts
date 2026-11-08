import { httpGet } from './httpGet'

afterEach(() => vi.unstubAllGlobals())

describe('httpGet', () => {
  it('returns the parsed JSON body', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: true, status: 200, json: async () => ({ a: 1 }) }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await httpGet('/api/x')).toEqual({ a: 1 })
    expect(fetchMock).toHaveBeenCalledWith('/api/x')
  })
  it('throws with the url and status when not ok', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404, json: async () => ({}) })))
    await expect(httpGet('/api/x')).rejects.toThrow('/api/x 404')
  })
  it('passes a network error through', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
    await expect(httpGet('/api/x')).rejects.toThrow('offline')
  })
})
