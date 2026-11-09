import { copyText } from './copyText'

describe('copyText', () => {
  it('writes the text to the clipboard', async () => {
    const write = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText: write } })
    expect(await copyText('hello')).toBe(true)
    expect(write).toHaveBeenCalledWith('hello')
    vi.unstubAllGlobals()
  })

  it('says false when the browser blocks it', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('no')) } })
    expect(await copyText('hello')).toBe(false)
    vi.unstubAllGlobals()
  })

  it('says false when there is no clipboard', async () => {
    vi.stubGlobal('navigator', {})
    expect(await copyText('hello')).toBe(false)
    vi.unstubAllGlobals()
  })
})
