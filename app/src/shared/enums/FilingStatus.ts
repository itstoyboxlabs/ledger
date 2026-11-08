// How the user files their federal return. Only the two statuses the app plans for.
// No value stored means single, which is how the app always worked.
const FilingStatus = {
  single: 'single',
  mfj: 'mfj',
} as const

type FilingStatus = (typeof FilingStatus)[keyof typeof FilingStatus]

export { FilingStatus }
