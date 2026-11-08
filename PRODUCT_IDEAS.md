# Product ideas

A product audit of Ledger: where pages could share more and what the Retirement model leaves out. Every idea
here fits the app as it is: local first, no backend, no accounts and small enough for one person to build.

The test for each idea is the tagline. Does it stop the app from oversimplifying you, without making you type
the same thing twice?

What the Retirement model does today was checked against the code in `app/src/screens/retirement`, not the
docs. Where they differ it is noted.

---

## 1. Top 5 recommendations

Ranked by value per effort.

| # | Idea | Why | Effort |
| --- | --- | --- | --- |
| 1 | **Inflation input and real returns** | The page says "today's dollars" but the fund table asks for each fund's lifetime performance, which is a nominal number. A 10% fund against a flat need per month quietly assumes zero inflation for 40 years. That overstates the end balance by more than half. One input fixes it. | Small |
| 2 | **Year-by-year income plan** | Pay is one flat number from today to retirement. Raises, a pay cut, a career change, a sabbatical and part-time work all change the answer, and none can be entered. Full spec in section 4. | Medium |
| 3 | **Tax on 401k withdrawals** | The 401k moves into savings untaxed at the access age. For most people it is pre-tax money, so every dollar out of it owes income tax. The tax engine already exists. | Small |
| 4 | **Need per month from Budget** | Retirement asks for a monthly need that the Budget already knows. An Auto badge (Budget expenses minus debt payments and savings rows) plus a line showing the last 12 months of real spending. | Small |
| 5 | **Bad-years stress test** | Every year earns the same return, so the verdict ignores sequence risk. A second "Money lasts" chip that replays the plan with a crash in the first two years of retirement shows how fragile the plan is. | Small |

Numbers 1, 3, 4 and 5 are each a day or two. Number 2 is the one bigger feature and it makes several other
gaps (raises, match on the new salary, Social Security from real earnings, part-time retirement) fall out of
one data shape.

---

## 2. Connections

### What is connected today

| From | To | What flows |
| --- | --- | --- |
| Statements | Spending | Everything |
| Statements | Budget | Subscription rows, Actual column, income when the source is statements |
| Take-home pay tool | Budget | Monthly income when the source is the tool |
| Take-home pay tool | Retirement | 401k per year (your share plus match), Social Security salary |
| Budget income | Rent scenarios, Vacation, Log | Through `useBudgetIncome` |
| Budget rows | Log | Meters, row picker, leftover shares that raise a meter |
| Budget rows | Balances | A debt's payment when linked to a row |
| Budget rows | Rent scenarios, Cash between two days | Expenses and their days |
| Budget leftover (savings share) | Retirement | Into savings per year, and how freed debt payments are split |
| Balances tax state | Every tax tool, Retirement | State and city brackets, tax on gains |
| Balances debts | Debt payoff, Rent scenarios, Retirement | Balances and payments, starting hole, freed payments, payoff events |
| Balances assets | Retirement | Starting liquid and locked balances by pool |
| Equity payout tool | Retirement | Money-in events while working |

Islands: Log feeds nothing. Notes, Lists, Hourly, Rent-to-income and Effective rental cost read nothing and
feed nothing.

### Duplicated inputs

The same fact typed in more than one place.

- **Salary** is typed in Take-home pay, again in Equity payout ("Salary stacked under") and again in
  Rent-to-income ("Annual income"). Give the other two an Auto badge that reads the Take-home salary.
- **Monthly need** in Retirement is typed while Budget already has the expenses. See recommendation 4.
- **Debt payment** can be typed in Balances and typed again in Debt payoff ("Contribution per month"). Debt
  payoff should offer "Use this payment" to write it back to the debt (or to its linked Budget row).
- **Save per month** in Vacation is typed, while Budget's leftover split can already target a row. Let
  Vacation pick a Budget row or leftover share as its source.
- **Age** lives only in Retirement. Debt payoff shows a debt-free date but not your age then. Equity events and
  Social Security need it too.

### Inconsistent assumptions

- **Debt interest.** Debt payoff uses APR and amortization. Retirement and Rent scenarios use
  `balance / payment` and ignore APR. The same debt can show two payoff dates. Retirement should call the same
  `payoffMonths` the tool uses.
- **Which income.** When Budget income comes from statements, Retirement still uses the Take-home salary for the
  401k and Social Security. If the tool is a hypothetical job, the 401k and the savings leftover describe two
  different lives. Show a one-line warning when the tool's net pay and the statement income differ by more than
  10%.
- **Tax on gains while working** is guessed from the retirement spending level (`withdrawMo * 12`), not the
  salary. While working, the gains bracket should come from the salary.
- **Inflation.** No page has one. See recommendation 1.
- **Tax state in retirement.** Many people retire somewhere else. A "Retire in" state on Retirement that
  defaults to the shared state would cover it.

### Missing links

Results that cannot be sent where they obviously belong.

1. **Log into Remaining this month.** Budget's Remaining this month counts undated rows in full even when the
   Log shows half of Groceries is already spent. Subtract this month's Log entries per row. Same for Cash between
   two days.
2. **Rent scenarios to Budget.** Picking a scenario row should offer "Use this rent" that writes the linked rent
   row, or saves a Budget preset, so the what-if becomes the plan in one click.
3. **Hourly to Take-home.** "Use as my salary" sends rate times hours times 52 to Take-home pay.
4. **Spending averages into Budget.** Next to a manual row's amount, a quiet "last 3 months: $412" from its
   `match`. The matching code already exists for Compare to actual.
5. **Retirement events back to Budget.** A house down payment event with no change to housing cost is half a
   plan. A "Housing changes at age" event (see gaps) closes it.
6. **Annual subscriptions into a sinking fund.** They are left out of Budget on purpose, but nothing saves for
   them. A single derived line "Yearly charges, set aside $X a month" or a Cash between two days warning when
   one is due in range.
7. **Balances "as of" date in Retirement.** Starting balances are only as fresh as Balances. Show "Balances from
   Mar 2" under Starting balances and nudge when it is over 90 days old.
8. **Cross-page scenarios.** Presets are per page. A move to another city changes tax state, rent, salary and
   the retirement plan at once. A named scenario that snapshots the per-page presets together is mostly glue
   over `usePresets`.

---

## 3. Retirement gaps

### What the model does today

From `RetirementCalc.tsx` (the live simulation is inline there; `utils/simulateRetirement.ts` is a pure copy
that nothing imports yet).

- One year per row from current age to plan-to age. Working before the retire age, retired from it.
- Contributions are flat for every working year: 401k (Take-home deferral plus match, or typed) plus your own
  extra lines, and savings (Budget savings share times 12, or typed) plus freed debt payments. The first year's
  payroll 401k is 75%.
- One weighted return while working and one after. The 401k grows at the full rate. Savings grow at the rate
  times (1 minus tax on gains). Negative balances earn nothing.
- The 401k joins savings at the access age (default 60) with no tax.
- Withdrawals are need per month times 12, minus Social Security from the claim age.
- Social Security assumes 35 years at today's Take-home salary.
- Events: money in, money out or pay off a debt. Once, monthly, yearly or every two years, for a set number of
  years. Equity events stop when you retire.
- No inflation, no salary change, no withdrawal tax, single person, flat returns.

### Gaps

Impact means how much the gap can move "Money lasts" or the earliest safe age for a typical user.

| Gap | Impact | How it fits | Smallest useful first version |
| --- | --- | --- | --- |
| Inflation and real vs nominal | High | New input in the Investments card | One "Inflation" input (default 2.5%). Simulate on real returns: `(1 + r) / (1 + i) - 1`. Label the result "in today's dollars". |
| Raises and salary growth | High | Income plan | A "Raises per year" percent on each pay period. |
| Pay changes by year (pay cut, career change at 45, sabbatical) | High | Income plan | Section 4. |
| Part-time or phased retirement | High | Income plan | A pay period that runs past the retire age lowers withdrawals instead of adding contributions. |
| Tax on 401k withdrawals | High | Change the unlock step | Keep a pre-tax pool after the access age. Each withdrawal from it is grossed up with `taxOn` at the retirement income level. Cheaper still: move the 401k in at `1 - effective rate`. |
| Healthcare before Medicare | High for early retirees | Event template | A "Health insurance until 65" template: monthly, from retire age, ends at 65. Default amount with a tip to check a marketplace quote. |
| Sequence of returns risk | High | New result chip | "If markets drop" chip: replay with -25% and 0% in the first two retired years. Monte Carlo later. |
| Partner income, ages and Social Security | High for couples | Shared "About you" plus a second person | Partner age, salary and claim age. Spousal benefit is at least 50% of the higher earner's full amount. Household need stays one number. |
| Roth vs traditional | Medium | New asset pool and extra line pool | Add a `roth` pool. Locked like the 401k, but no tax on the way out. |
| Spending that changes with age (the retirement smile) | Medium | Per-phase need | Three optional needs: until 75, 75 to 85, after 85. Default all equal to today's need. Events can fake it today but nobody will think of it. |
| Long-term care | Medium | Event template | "Care in late life": monthly, 3 years, from 85. |
| Housing: mortgage payoff vs rent, home equity | Medium | New event kind | "Housing cost changes" event: from age X the need per month goes up or down by Y. Equity stays out of the liquid total on purpose, shown as a note. |
| One-time goals (house, kids, college) | Medium | Event templates | A template picker on the plus button: down payment, car, college (4 years), wedding. Same event shape. |
| Employer match on the new salary | Medium | Income plan | Match is a percent of your share, so it follows each period's salary for free. |
| Social Security from real earnings | Medium | Income plan plus a typed override | Average the highest 35 years of the plan (past years at today's salary). The typed monthly amount already covers someone with an SSA statement. |
| Social Security shortfall | Medium | Toggle in the Social Security card | "Plan for a cut" multiplies the benefit by 0.8 from a set year. |
| Fees | Medium | New column in the fund table | Expense ratio per fund, subtracted from its performance. |
| Cash vs invested savings | Medium | Asset pool | A `cash` pool that earns a cash rate. Today an emergency fund in checking earns the stock return. |
| Pensions and annuities | Medium for those who have one | New repeat option | "For life" repeat on monthly money-in events, so they run to the plan-to age. |
| 401k access rules (59 and a half, Rule of 55) | Medium | Hint on the access age input | Tip: "Leave a job at 55 or later and that employer's 401k opens at 55." Default access age to 60 stays. |
| Deferral limit growth and catch-up at 50 | Low | Income plan | Cap each year's deferral at the limit, plus catch-up from 50. Constant already exists. |
| Required minimum distributions | Low | Tax step | Skip until withdrawal tax exists. Then force a minimum from the pre-tax pool from 73 or 75. |
| Windfalls and inheritance | Low | Already possible | A money-in event once. Add it to the template list so people see it. |
| Returns by asset class, glide path | Low | Already close | Two fund tables already exist. A glide path is false precision for this app. |
| End age | Low | Exists | Add a tip with a rough planning range (90 to 95) and why. |
| 4 percent rule cross-check | Low effort, medium value | New result chip | "Rule of thumb: you need about 25 times a year of spending, $X." Shown next to "At retirement". |

---

## 4. Mini spec: year-by-year income plan

### User story

As someone planning a long career, I want to say how my pay changes over time (raises, a pay cut, a switch to
an easier job at 45, a year off, part-time work in my sixties) so the retirement plan saves what I will really
save, matches what my employer will really add and pays the Social Security I will really earn.

### UI sketch

- A new card, **"Your pay over time"**, inside the Saving each year group, above the 401k and savings fields.
- Closed by default it reads one line: "Same pay until you retire. $95,000 a year from Take-home pay." with an
  "Add a change" button.
- Each change is a row: **From age**, **Pay per year**, **401k percent**, **Raises a year**, **Kind** (Full time,
  Part time, Time off). Time off hides pay and 401k.
- The first row is "Now", from current age, with Auto badges on pay and 401k percent that read the Take-home
  tool. It cannot be deleted.
- Rows sort by From age. A period ends where the next one starts, or at the retire age.
- A Part time row may start at or after the retire age. It shows "keeps going after you retire, until" with an
  age input.
- The year table gets a **Pay** column. A small sparkline of pay by age sits in the card header.
- When any change exists, the 401k and savings fields read "from your pay plan" instead of their usual Auto tip.

### Data shape

Stored in `retireCalc` so presets and export pick it up with no extra work.

```ts
// retireCalc.pay
interface RetirePay {
  periods: PayPeriod[]   // empty means today's behavior, exactly
}
interface PayPeriod {
  id: string
  fromAge: number
  toAge?: number         // only for part time past the retire age
  kind: 'full' | 'part' | 'off'
  salary: number         // gross, today's dollars; ignored for 'off'
  auto: boolean          // first row only: read salary from Take-home
  k401Pct: number        // of salary; match comes from the Take-home 401k line
  raisePct: number       // per year inside this period, compounding from fromAge
}
```

`normalizeRetire` fills `pay: { periods: [] }` for old saves, so no number moves.

### How the simulation changes

Move the inline simulation into the pure `simulateRetirement` first (it exists but is not used yet), then add
one function the loop calls each year: `payAt(age) -> { gross, kind }`.

For each working year:

1. **Gross pay** is the period's salary times `(1 + raisePct) ^ (age - fromAge)`.
2. **401k** is `min(gross * k401Pct, deferral limit)` plus the match percent of that. The 75% first-year rule
   applies to the first year of each new full-time period (new employer), not only the current age.
3. **Savings** keeps Budget as the source of truth for spending. Today's savings figure stays the base. Each
   year adds the change in net pay: `net(gross_this_year) - net(gross_today)`, with `net` from
   `takeHomeBreakdown`. A raise raises savings. A pay cut lowers them. A year off makes savings negative, which
   the model already handles as drawing on the pool. Spending stays the Budget plan unless an event says
   otherwise.
4. **Part time after the retire age**: its net pay lowers that year's withdrawal (floor at zero, any extra goes
   into savings). No 401k unless `k401Pct` is set.
5. **Social Security**: the auto benefit averages the highest 35 years of gross pay from the plan, with years
   before the current age at today's salary, capped at the wage base each year.
6. **Find earliest safe age** works as before. Full-time periods stop at the candidate age. Part-time periods
   with their own `toAge` keep going.

### Edge cases

- Two periods with the same From age: the later row in the list wins and the earlier one shows a warning.
- A period that starts after the retire age and is full time: shown greyed with "starts after you retire".
- From age before the current age: clamp to the current age.
- Salary 0 on a full-time row: treat as Time off.
- Take-home tool changed while the first row is on Auto: the plan follows. Off Auto: it keeps the typed value.
- Budget income from statements and a different first-row salary: the net pay delta is still measured against
  the first row, so today's savings stay what Budget says.
- Inflation (recommendation 1) on: salaries are in today's dollars and raises are real raises. Say so in the
  raises tip.
- Equity events still stop at the retire age, not at a Time off period.
- Deferral limit with a 50 plus catch-up: use the existing constant and add the catch-up as its own constant.

### Tests

- Empty `periods` gives exactly the same rows as today for the sample data (a snapshot of the current output).
- A 3% raise compounds: year 10 of a period is `salary * 1.03^10`.
- A pay cut at 45 lowers savings contributions by the net pay difference from 45 on, not the gross difference.
- A Time off year has zero 401k, negative savings contribution and still grows the 401k balance.
- The 401k deferral never exceeds the limit, and the match follows the capped amount.
- The first year of a new full-time period gets the 75% 401k rule. A raise inside a period does not.
- Part time from 62 to 66 after retiring at 60 lowers withdrawals in those years only.
- Social Security auto rises when the plan has higher pay in more than 35 years and falls with long time off.
- Find earliest safe age moves later when a pay cut is added.
- `normalizeRetire` on a save without `pay` returns `periods: []`. A preset saved before the feature applies
  without changing any number.
- Browser test: add a change at 45, see the Pay column drop and "Money lasts" update.

---

## 5. Smaller ideas

- **"What changed" line on Retirement.** When an Auto value moves because another page changed (Budget leftover,
  Take-home salary), show "Savings went from $9,600 to $12,000 a year after your Budget changed". Makes the
  connections visible, which is the product's whole pitch.
- **Event templates** on the plus button: down payment, car, college, wedding, health insurance until 65, care
  in late life, inheritance. Same event shape, prefilled.
- **"For life" repeat** for pensions and annuities.
- **Starting balance freshness.** Show the Balances "as of" date under Starting balances.
- **4 percent chip** next to "At retirement".
- **Safe spending finder.** The mirror of Find earliest age: at this retire age, the highest need per month that
  lasts. Same linear scan, over dollars.
- **Debt-free age** in Debt payoff once age is shared.
- **Same payoff math everywhere.** Retirement and Rent scenarios use the Debt payoff tool's APR math.
- **Withdrawal order hint.** Once pools exist (savings, pre-tax, Roth), say which one each year drew from.
- **Notes attached to a page.** A note can be pinned to Budget or Retirement and shows as a small icon there.
- **Budget suggestion from Spending.** A dotted hint under manual rows with the last 3 months' average.
- **Log meters in Remaining this month.** Subtract what is already logged.
- **Scenario snapshots** that bundle the per-page presets under one name.
