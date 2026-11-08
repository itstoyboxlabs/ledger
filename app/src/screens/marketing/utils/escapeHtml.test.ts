import { escapeHtml } from '@/screens/marketing/utils/escapeHtml'

describe('escapeHtml', () => {
  it('escapes the characters that break attributes and tags', () => {
    expect(escapeHtml('a & "b" <c>')).toBe('a &amp; &quot;b&quot; &lt;c&gt;')
  })
  it('leaves plain text alone', () => {
    expect(escapeHtml('Ledger · tutorial')).toBe('Ledger · tutorial')
  })
})
