import type { StateTax } from '@/shared/types/StateTax'
// state definitions: standard deduction + brackets (+ optional local)
//
// Tax year 2026, single filer. Source: Tax Foundation, "State Individual Income
// Tax Rates and Brackets, 2026" (as of Jan 1, 2026),
// https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/
// cross-checked against state revenue department pages where noted.
//
// Conventions:
// - `deduction` = standard deduction + personal exemption folded together.
//   Exemptions granted as a flat credit (AR, CA, IA, NE, OR, UT) are ignored;
//   they are worth well under $1k. Phase-outs (CT, WI, MD, OH, AL) are not
//   modeled, see per-state notes.
// - States with no wage income tax get a single 0% bracket so the shape
//   matches everywhere. WA taxes only capital gains, so it counts as no-tax here.
// - Only two local taxes are modeled: NYC (progressive) and Maryland counties
//   (flat 3.2% approximation). All other city/county taxes are ignored.
// - Entries are alphabetical by label, with 'New York (NYC)' right after
//   'New York'.
export const STATES: Record<string, StateTax> = {
  al: {
    // deduction: $3,000 std + $1,500 exemption (std ded shrinks above ~$33k AGI, not modeled)
    label: 'Alabama',
    deduction: 4500,
    brackets: [[500, 0.02], [3000, 0.04], [Infinity, 0.05]],
  },
  ak: { label: 'Alaska', deduction: 0, brackets: [[Infinity, 0]] },
  az: {
    // AZ uses the federal standard deduction ($16,100 for 2026)
    label: 'Arizona',
    deduction: 16100,
    brackets: [[Infinity, 0.025]],
  },
  ar: {
    label: 'Arkansas',
    deduction: 2470,
    brackets: [[4600, 0.02], [Infinity, 0.039]],
  },
  ca: {
    // top bracket includes the 1% mental health surtax over $1M
    label: 'California',
    deduction: 5540,
    brackets: [
      [11079, 0.01], [26264, 0.02], [41452, 0.04], [57542, 0.06],
      [72724, 0.08], [371479, 0.093], [445771, 0.103], [742953, 0.113],
      [1000000, 0.123], [Infinity, 0.133],
    ],
  },
  co: {
    label: 'Colorado',
    deduction: 16100,
    brackets: [[Infinity, 0.044]],
  },
  ct: {
    // CT has no standard deduction; the $15,000 personal exemption phases out
    // completely by $45k AGI for single filers, so it is set to 0 here
    label: 'Connecticut',
    deduction: 0,
    brackets: [
      [10000, 0.02], [50000, 0.045], [100000, 0.055], [200000, 0.06],
      [250000, 0.065], [500000, 0.069], [Infinity, 0.0699],
    ],
  },
  de: {
    label: 'Delaware',
    deduction: 3250,
    brackets: [
      [2000, 0], [5000, 0.022], [10000, 0.039], [20000, 0.048],
      [25000, 0.052], [60000, 0.0555], [Infinity, 0.066],
    ],
  },
  dc: {
    label: 'District of Columbia',
    deduction: 16100,
    brackets: [
      [10000, 0.04], [40000, 0.06], [60000, 0.065], [250000, 0.085],
      [500000, 0.0925], [1000000, 0.0975], [Infinity, 0.1075],
    ],
  },
  fl: { label: 'Florida', deduction: 0, brackets: [[Infinity, 0]] },
  ga: {
    label: 'Georgia',
    deduction: 12000,
    brackets: [[Infinity, 0.0519]],
  },
  hi: {
    // deduction: $4,400 std + $1,144 exemption
    label: 'Hawaii',
    deduction: 5544,
    brackets: [
      [9600, 0.014], [14400, 0.032], [19200, 0.055], [24000, 0.064],
      [36000, 0.068], [48000, 0.072], [125000, 0.076], [175000, 0.079],
      [225000, 0.0825], [275000, 0.09], [325000, 0.10], [Infinity, 0.11],
    ],
  },
  id: {
    label: 'Idaho',
    deduction: 16100,
    brackets: [[4811, 0], [Infinity, 0.053]],
  },
  il: {
    // no standard deduction; $2,925 personal exemption
    label: 'Illinois',
    deduction: 2925,
    brackets: [[Infinity, 0.0495]],
  },
  in: {
    // no standard deduction; $1,000 personal exemption. County taxes (1-3%) ignored
    label: 'Indiana',
    deduction: 1000,
    brackets: [[Infinity, 0.0295]],
  },
  ia: {
    label: 'Iowa',
    deduction: 16100,
    brackets: [[Infinity, 0.038]],
  },
  ks: {
    // deduction: $3,605 std + $9,160 exemption
    label: 'Kansas',
    deduction: 12765,
    brackets: [[23000, 0.052], [Infinity, 0.0558]],
  },
  ky: {
    label: 'Kentucky',
    deduction: 3360,
    brackets: [[Infinity, 0.035]],
  },
  la: {
    label: 'Louisiana',
    deduction: 12875,
    brackets: [[Infinity, 0.03]],
  },
  me: {
    // deduction: federal-conforming $16,100 std + $5,300 exemption
    label: 'Maine',
    deduction: 21400,
    brackets: [[27399, 0.058], [64849, 0.0675], [Infinity, 0.0715]],
  },
  md: {
    // deduction: $3,350 std + $3,200 exemption. County income taxes range
    // 2.25%-3.3%; approximated as a flat 3.2% (most of the population lives
    // in counties at or near the top rate)
    label: 'Maryland',
    deduction: 6550,
    brackets: [
      [1000, 0.02], [2000, 0.03], [3000, 0.04], [100000, 0.0475],
      [125000, 0.05], [150000, 0.0525], [250000, 0.055], [500000, 0.0575],
      [1000000, 0.0625], [Infinity, 0.065],
    ],
    local: [[Infinity, 0.032]],
  },
  ma: {
    // no standard deduction; $4,400 personal exemption. 4% surtax over ~$1.08M
    label: 'Massachusetts',
    deduction: 4400,
    brackets: [[1083150, 0.05], [Infinity, 0.09]],
  },
  mi: {
    // no standard deduction; $5,900 personal exemption. City taxes (Detroit etc.) ignored
    label: 'Michigan',
    deduction: 5900,
    brackets: [[Infinity, 0.0425]],
  },
  mn: {
    label: 'Minnesota',
    deduction: 15300,
    brackets: [[33310, 0.0535], [109430, 0.068], [203150, 0.0785], [Infinity, 0.0985]],
  },
  ms: {
    // deduction: $2,300 std + $6,000 exemption; first $10,000 of taxable income is exempt
    label: 'Mississippi',
    deduction: 8300,
    brackets: [[10000, 0], [Infinity, 0.04]],
  },
  mo: {
    label: 'Missouri',
    deduction: 16100,
    brackets: [
      [1348, 0], [2696, 0.02], [4044, 0.025], [5392, 0.03], [6740, 0.035],
      [8088, 0.04], [9436, 0.045], [Infinity, 0.047],
    ],
  },
  mt: {
    label: 'Montana',
    deduction: 16100,
    brackets: [[47500, 0.047], [Infinity, 0.0565]],
  },
  ne: {
    label: 'Nebraska',
    deduction: 8850,
    brackets: [[4130, 0.0246], [24760, 0.0351], [Infinity, 0.0455]],
  },
  nv: { label: 'Nevada', deduction: 0, brackets: [[Infinity, 0]] },
  nh: { label: 'New Hampshire', deduction: 0, brackets: [[Infinity, 0]] },
  nj: {
    // no standard deduction; $1,000 personal exemption
    label: 'New Jersey',
    deduction: 1000,
    brackets: [
      [20000, 0.014], [35000, 0.0175], [40000, 0.035], [75000, 0.0553],
      [500000, 0.0637], [1000000, 0.0897], [Infinity, 0.1075],
    ],
  },
  nm: {
    label: 'New Mexico',
    deduction: 16100,
    brackets: [
      [5500, 0.015], [16500, 0.032], [33500, 0.043], [66500, 0.047],
      [210000, 0.049], [Infinity, 0.059],
    ],
  },
  ny: {
    label: 'New York',
    deduction: 8000,
    brackets: [
      [8500, 0.039], [11700, 0.044], [13900, 0.0515], [80650, 0.054],
      [215400, 0.059], [1077550, 0.0685], [5000000, 0.0965],
      [25000000, 0.103], [Infinity, 0.109],
    ],
  },
  'ny-nyc': {
    label: 'New York (NYC)',
    deduction: 8000,
    brackets: [
      [8500, 0.039], [11700, 0.044], [13900, 0.0515], [80650, 0.054],
      [215400, 0.059], [1077550, 0.0685], [5000000, 0.0965],
      [25000000, 0.103], [Infinity, 0.109],
    ],
    local: [
      [12000, 0.03078], [25000, 0.03762], [50000, 0.03819], [Infinity, 0.03876],
    ],
  },
  nc: {
    label: 'North Carolina',
    deduction: 12750,
    brackets: [[Infinity, 0.0399]],
  },
  nd: {
    label: 'North Dakota',
    deduction: 16100,
    brackets: [[48475, 0], [244825, 0.0195], [Infinity, 0.025]],
  },
  oh: {
    // no standard deduction; $2,400 personal exemption (drops to $2,150 above $80k AGI).
    // first $26,050 of taxable income is exempt. City taxes (Columbus etc.) ignored
    label: 'Ohio',
    deduction: 2400,
    brackets: [[26050, 0], [Infinity, 0.0275]],
  },
  ok: {
    // deduction: $6,350 std + $1,000 exemption
    label: 'Oklahoma',
    deduction: 7350,
    brackets: [[3750, 0], [4900, 0.025], [7200, 0.035], [Infinity, 0.045]],
  },
  or: {
    label: 'Oregon',
    deduction: 2910,
    brackets: [[4550, 0.0475], [11400, 0.0675], [125000, 0.0875], [Infinity, 0.099]],
  },
  pa: {
    // no deductions or exemptions. Local earned-income taxes (Philadelphia 3.75%) ignored
    label: 'Pennsylvania',
    deduction: 0,
    brackets: [[Infinity, 0.0307]],
  },
  ri: {
    // deduction: $11,200 std + $5,250 exemption
    label: 'Rhode Island',
    deduction: 16450,
    brackets: [[82050, 0.0375], [186450, 0.0475], [Infinity, 0.0599]],
  },
  sc: {
    // SC uses the federal standard deduction ($16,100 for 2026)
    label: 'South Carolina',
    deduction: 16100,
    brackets: [[3640, 0], [18230, 0.03], [Infinity, 0.06]],
  },
  sd: { label: 'South Dakota', deduction: 0, brackets: [[Infinity, 0]] },
  tn: { label: 'Tennessee', deduction: 0, brackets: [[Infinity, 0]] },
  tx: { label: 'Texas', deduction: 0, brackets: [[Infinity, 0]] },
  ut: {
    // no deduction; Utah instead gives a taxpayer credit (~$966 max, phased out), ignored
    label: 'Utah',
    deduction: 0,
    brackets: [[Infinity, 0.045]],
  },
  vt: {
    // deduction: $7,650 std + $5,300 exemption
    label: 'Vermont',
    deduction: 12950,
    brackets: [[49400, 0.0335], [119700, 0.066], [249700, 0.076], [Infinity, 0.0875]],
  },
  va: {
    // deduction: $8,750 std + $930 exemption
    label: 'Virginia',
    deduction: 9680,
    brackets: [[3000, 0.02], [5000, 0.03], [17000, 0.05], [Infinity, 0.0575]],
  },
  wa: {
    // WA taxes only long-term capital gains over $278k, no wage income tax
    label: 'Washington',
    deduction: 0,
    brackets: [[Infinity, 0]],
  },
  wv: {
    // no standard deduction; $2,000 personal exemption
    label: 'West Virginia',
    deduction: 2000,
    brackets: [[10000, 0.0222], [25000, 0.0296], [40000, 0.0333], [60000, 0.0444], [Infinity, 0.0482]],
  },
  wi: {
    // deduction: $13,960 std + $700 exemption. The std ded phases out between
    // $20k and $136k of income (not modeled), so mid incomes are understated a bit
    label: 'Wisconsin',
    deduction: 14660,
    brackets: [[15110, 0.035], [51950, 0.044], [332720, 0.053], [Infinity, 0.0765]],
  },
  wy: { label: 'Wyoming', deduction: 0, brackets: [[Infinity, 0]] },
}
