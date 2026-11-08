import { downloadBlob } from './downloadBlob'

beforeEach(() => {
  URL.createObjectURL ??= () => ''
  URL.revokeObjectURL ??= () => {}
})
afterEach(() => vi.restoreAllMocks())

describe('downloadBlob', () => {
  it('clicks a link with the file name and a blob url, then revokes it', async () => {
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake')
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const link = document.createElement('a')
    const click = vi.spyOn(link, 'click').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue(link)

    downloadBlob('{"a":1}', 'out.json', 'application/json')

    expect(document.createElement).toHaveBeenCalledWith('a')
    expect(link.download).toBe('out.json')
    expect(link.href).toBe('blob:fake')
    expect(click).toHaveBeenCalledTimes(1)
    expect(revoke).toHaveBeenCalledWith('blob:fake')
    const blob = create.mock.calls[0][0] as Blob
    expect(blob.type).toBe('application/json')
    expect(await blob.text()).toBe('{"a":1}')
  })
})
