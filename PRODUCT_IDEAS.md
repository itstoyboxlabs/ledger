# Product ideas

A product audit of Ledger: where pages could share more and what the Retirement model leaves out. Every idea
here fits the app as it is: local first, no backend, no accounts and small enough for one person to build.

The test for each idea is the tagline. Does it stop the app from oversimplifying you, without making you type
the same thing twice?

What the Retirement model does today was checked against the code in `app/src/screens/retirement`, not the
docs. Where they differ it is noted.

---

## 1. Top recommendations

Ranked by value per effort. The year-by-year pay plan, the tax on 401k withdrawals and the Budget preset for the
monthly need have shipped and are not listed.

| # | Idea | Why | Effort |
| --- | --- | --- | --- |
| 1 | **About you: filing status, ages and a partner** | One shared card for birth year, single or married, tax state and an optional partner. Married filing jointly changes the brackets and the standard deduction, so for many households every tax figure is off today. Retirement, Debt payoff and every tax tool would read from it. | Medium |
| 2 | **Inflation after you retire** | Pay keeps pace with prices while you work, but nothing raises your savings once you stop. One optional input that only touches the retired years, with returns turned into real returns. | Small |
| 3 | **Bad-years stress test** | Every year earns the same return, so the verdict ignores sequence risk. A second "Money lasts" chip that replays the plan with a crash in the first two years of retirement shows how fragile the plan is. | Small |
| 4 | **Healthcare and long-term care templates** | Insurance before Medicare is one of the biggest costs of retiring early. Event templates with sensible defaults make it one click. | Small |
| 5 | **Cross-page scenarios** | A move to another city changes tax state, rent, salary and the retirement plan at once. A named scenario that snapshots the per-page presets together is mostly glue over presets. | Medium |

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
- **Filing status.** The tax engine is single filer only and there is no setting. A married user gets wrong tax
  on every page. Add a shared filing status next to tax state.
- **Tax on gains while working** is guessed from the retirement spending level (`withdrawMo * 12`), not the
  salary. While working, the gains bracket should come from the salary.
- **Inflation.** No page has one. See recommendation 1.
- **Tax state in retirement.** Many people retire somewhere else. A "Retire in" state on Retirement that
  defaults to the shared state would cover it.

### Missing links

Results that cannot be sent where they obviously belong.

1. **A shared "About you" card on Balances.** Birth year, filing status, tax state and an optional partner. Balances
   already owns tax state and its preset is literally called `planningVariables`. Retirement reads age from it,
   Debt payoff shows "debt free at 41", the tax engine reads filing status.
2. **Log into Remaining this month.** Budget's Remaining this month counts undated rows in full even when the
   Log shows half of Groceries is already spent. Subtract this month's Log entries per row. Same for Cash between
   two days.
3. **Rent scenarios to Budget.** Picking a scenario row should offer "Use this rent" that writes the linked rent
   row, or saves a Budget preset, so the what-if becomes the plan in one click.
4. **Hourly to Take-home.** "Use as my salary" sends rate times hours times 52 to Take-home pay.
5. **Spending averages into Budget.** Next to a manual row's amount, a quiet "last 3 months: $412" from its
   `match`. The matching code already exists for Compare to actual.
6. **Retirement events back to Budget.** A house down payment event with no change to housing cost is half a
   plan. A "Housing changes at age" event (see gaps) closes it.
7. **Annual subscriptions into a sinking fund.** They are left out of Budget on purpose, but nothing saves for
   them. A single derived line "Yearly charges, set aside $X a month" or a Cash between two days warning when
   one is due in range.
8. **Balances "as of" date in Retirement.** Starting balances are only as fresh as Balances. Show "Balances from
   Mar 2" under Starting balances and nudge when it is over 90 days old.
9. **Cross-page scenarios.** Presets are per page. A move to another city changes tax state, rent, salary and
   the retirement plan at once. A named scenario that snapshots the per-page presets together is mostly glue
   over `usePresets`.

---

## 3. Retirement gaps

### What the model does today

From `screens/retirement` (the simulation is `utils/simulateRetirement.ts`).

- One year per row from current age to plan-to age. Working before the retire age, retired from it.
- Pay and saving come from periods by age. Each period picks a Take-home preset for the 401k and a Budget preset
  for savings (or typed amounts) and can grow by a percent a year. Money-in events can go to savings or the locked
  retirement account.
- One weighted return while working and one after. Savings grow at the rate times (1 minus tax on gains).
  Negative balances earn nothing.
- Each account has a type: savings, pre-tax or Roth. Pre-tax withdrawals are grossed up and taxed with the
  federal, state and city brackets. Savings are spent first, then pre-tax, then Roth.
- The monthly need is typed or follows a Budget preset, minus Social Security from the claim age.
- Events: money in, money out or pay off a debt, with repeats. Equity events stop when you retire.
- Still missing: inflation, a partner, filing status, healthcare, flat returns only.

### Gaps

Impact means how much the gap can move "Money lasts" or the earliest safe age for a typical user.

| Gap | Impact | How it fits | Smallest useful first version |
| --- | --- | --- | --- |
| Healthcare before Medicare | High for early retirees | Event template | A "Health insurance until 65" template: monthly, from retire age, ends at 65. Default amount with a tip to check a marketplace quote. |
| Sequence of returns risk | High | New result chip | "If markets drop" chip: replay with -25% and 0% in the first two retired years. Monte Carlo later. |
| Partner income, ages and Social Security | High for couples | Shared "About you" plus a second person | Partner age, salary and claim age. Spousal benefit is at least 50% of the higher earner's full amount. Household need stays one number. |
| Spending that changes with age (the retirement smile) | Medium | Per-phase need | Three optional needs: until 75, 75 to 85, after 85. Default all equal to today's need. Events can fake it today but nobody will think of it. |
| Long-term care | Medium | Event template | "Care in late life": monthly, 3 years, from 85. |
| Housing: mortgage payoff vs rent, home equity | Medium | New event kind | "Housing cost changes" event: from age X the need per month goes up or down by Y. Equity stays out of the liquid total on purpose, shown as a note. |
| One-time goals (house, kids, college) | Medium | Event templates | A template picker on the plus button: down payment, car, college (4 years), wedding. Same event shape. |
| Social Security from real earnings | Medium | Pay plan plus a typed override | Average the highest 35 years of the plan (past years at today's salary). The typed monthly amount already covers someone with an SSA statement. |
| Social Security shortfall | Medium | Toggle in the Social Security card | "Plan for a cut" multiplies the benefit by 0.8 from a set year. |
| Fees | Medium | New column in the fund table | Expense ratio per fund, subtracted from its performance. |
| Cash vs invested savings | Medium | Asset pool | A `cash` pool that earns a cash rate. Today an emergency fund in checking earns the stock return. |
| Pensions and annuities | Medium for those who have one | New repeat option | "For life" repeat on monthly money-in events, so they run to the plan-to age. |
| 401k access rules (59 and a half, Rule of 55) | Medium | Hint on the access age input | Tip: "Leave a job at 55 or later and that employer's 401k opens at 55." Default access age to 60 stays. |
| Required minimum distributions | Low | Tax step | Skip until withdrawal tax exists. Then force a minimum from the pre-tax pool from 73 or 75. |
| Windfalls and inheritance | Low | Already possible | A money-in event once. Add it to the template list so people see it. |
| Returns by asset class, glide path | Low | Already close | Two fund tables already exist. A glide path is false precision for this app. |
| End age | Low | Exists | Add a tip with a rough planning range (90 to 95) and why. |
| 4 percent rule cross-check | Low effort, medium value | New result chip | "Rule of thumb: you need about 25 times a year of spending, $X." Shown next to "At retirement". |

---

## 4. Smaller ideas

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
- **Filing status** in the tax engine: married filing jointly brackets and standard deduction. It is the most
  common reason the tax figures will be wrong for a real household.
