import { httpPost } from './httpPost'

afterEach(() => vi.unstubAllGlobals())

describe('httpPost', () => {
  it('posts the body as JSON', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: true, status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await httpPost('/api/x', { a: 1 })
    expect(fetchMock).toHaveBeenCalledWith('/api/x', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"a":1}',
    })
  })
  it('resolves with nothing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200 })))
    expect(await httpPost('/api/x', {})).toBeUndefined()
  })
  it('throws with the url and status when not ok', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 })))
    await expect(httpPost('/api/x', {})).rejects.toThrow('/api/x 500')
  })
})
