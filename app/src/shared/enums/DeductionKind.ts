const DeductionKind = {
  k401: '401k',
  roth401k: 'roth401k',
  insurance: 'insurance',
  dental: 'dental',
  hsa: 'hsa',
  fsa: 'fsa',
  commuter: 'commuter',
  life: 'life',
  dues: 'dues',
  otherPre: 'other-pre',
  otherPost: 'other-post',
} as const

type DeductionKind = (typeof DeductionKind)[keyof typeof DeductionKind]

export { DeductionKind }
