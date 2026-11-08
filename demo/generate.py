#!/usr/bin/env python3
"""Builds the demo: fake bank statements (PDF), the ledger-data.json an assistant would make from
them, and exported/ledger-data.json, the same file with a fake person's budget and plans added, as
Export data would save it.
Everything here is made up. Run: python3 demo/generate.py"""
import calendar, datetime as dt, json, os, random
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

HERE = os.path.dirname(os.path.abspath(__file__))
random.seed(7)

HOLDER = ("Jordan Rivera", "410 Example Avenue, Apt 3B", "Brooklyn, NY 11201")
MONTHS = [(2026, m) for m in range(6, 11)]  # June to October 2026
NET_CHECK = 3887.20  # take-home per paycheck for $150k in New York City, from the app's own tax engine

ACCTS = {
    "chase-chk": dict(name="Total Checking", bank="Chase", type="checking", last4="3318"),
    "chase-card": dict(name="Rewards Card", bank="Chase", type="card", last4="5502"),
    "harbor-sav": dict(name="Savings", bank="Harbor Bank", type="savings", last4="7745"),
}
MERCHANT_DOMAINS = {
    "Chase": "chase.com", "Trader Joe's": "traderjoes.com",
    "Whole Foods": "wholefoodsmarket.com", "Sweetgreen": "sweetgreen.com", "Chipotle": "chipotle.com",
    "Uber Eats": "ubereats.com", "Uber": "uber.com", "Blue Bottle": "bluebottlecoffee.com",
    "Starbucks": "starbucks.com", "Netflix": "netflix.com", "Spotify": "spotify.com",
    "iCloud": "apple.com", "OpenAI": "openai.com", "NYT": "nytimes.com", "YouTube Premium": "youtube.com",
    "T-Mobile": "t-mobile.com", "Verizon": "verizon.com", "ConEd": "coned.com", "Geico": "geico.com",
    "Amazon": "amazon.com", "Target": "target.com", "CVS": "cvs.com", "Ticketmaster": "ticketmaster.com",
    "AMC": "amctheatres.com", "Costco membership": "costco.com", "B&H Photo": "bhphotovideo.com",
    "Planet Fitness": "planetfitness.com", "MTA": "mta.info", "Citi Bike": "citibikenyc.com",
    "Toyota Financial": "toyotafinancial.com", "Venmo": "venmo.com",
}

txns = []  # every transaction, as the app stores it (plus a private _bal sort key)
def D(y, m, day):
    return dt.date(y, m, min(day, calendar.monthrange(y, m)[1]))
def add(acct, d, desc, merchant, amount, kind, cat, sub):
    txns.append(dict(account=acct, date=d, desc=desc, merchant=merchant, amount=round(amount, 2), kind=kind, cat=cat, sub=sub))

card_net_by_month = {}
for (y, m) in MONTHS:
    last = calendar.monthrange(y, m)[1]
    d = lambda day: D(y, m, day)
    # ---------- checking ----------
    add("chase-chk", d(15), "ACME CORP DES:PAYROLL ID:XXXXX4471 INDN:JORDAN RIVERA", "Acme Corp payroll", NET_CHECK, "income", "Income", "Payroll")
    add("chase-chk", d(last), "ACME CORP DES:PAYROLL ID:XXXXX4471 INDN:JORDAN RIVERA", "Acme Corp payroll", NET_CHECK, "income", "Income", "Payroll")
    add("chase-chk", d(1), "Zelle payment to Rivera Properties LLC", "Rent", 3300, "expense", "Housing", "Rent")
    add("chase-chk", d(3), "NELNET DES:STUDENTLN ID:XXXXX2210", "Nelnet", 420, "expense", "Other", "Misc")
    add("chase-chk", d(3), "PLANET FITNESS DES:MEMBERSHP", "Planet Fitness", 24.99, "expense", "Health & Insurance", "Health Care")
    add("chase-chk", d(5), "TOYOTA FINANCIAL SVCS DES:ACH PMT", "Toyota Financial", 480, "expense", "Transportation", "Car")
    add("chase-chk", d(8), "CONED ONLINE PMT DES:WEB PMT", "ConEd", round(random.uniform(88, 142), 2), "expense", "Bills & Utilities", "Electricity")
    add("chase-chk", d(9), "GEICO *AUTO DES:INS PREM", "Geico", 165, "expense", "Health & Insurance", "Other Insurance")
    add("chase-chk", d(12), "VERIZON FIOS DES:PAYMENT", "Verizon", 65, "expense", "Bills & Utilities", "Phone & Internet")
    add("chase-chk", d(16), "NYS DTF DES:PYMT PLAN", "NYS Tax (DTF)", 300, "expense", "Taxes & Fees", "Taxes & Gov Fees")
    add("chase-chk", d(17), "Online transfer to SAV 7745 Harbor Bank", "Transfer to savings", 300, "transfer", "Transfers", "Account Transfers")
    add("harbor-sav", d(17), "Transfer from Chase Total Checking 3318", "Transfer from checking", 300, "transfer", "Transfers", "Account Transfers")
    for _ in range(random.randint(8, 10)):
        day = random.randint(1, last)
        add("chase-chk", d(day), f"CARD PURCHASE {m:02d}/{day:02d} MTA*NYCT PAYGO NEW YORK NY CARD 3318", "MTA", random.choice([2.90, 2.90, 5.80, 8.70]), "expense", "Transportation", "Transit")
    for _ in range(2):
        day = random.randint(2, last)
        add("chase-chk", d(day), f"Zelle payment to {random.choice(['Sam K','Priya R','Marcus T'])}", "Venmo", round(random.uniform(20, 80), 2), "expense", "Other", "Venmo & P2P")
    if m in (7, 9):
        add("chase-chk", d(10), "ATM WITHDRAWAL 0310 BROOKLYN NY", "ATM cash", 60, "expense", "Other", "Misc")
    # ---------- savings interest ----------
    add("harbor-sav", d(last), "INTEREST PAYMENT", "Harbor Bank interest", round(random.uniform(44, 50), 2), "income", "Income", "Other Income")
    # ---------- card ----------
    cc = lambda day, desc, merch, amt, cat, sub, kind="expense": add("chase-card", d(day), desc, merch, amt, kind, cat, sub)
    for _ in range(4):
        cc(random.randint(1, last), "TRADER JOE S #567 BROOKLYN NY", "Trader Joe's", round(random.uniform(42, 88), 2), "Food & Dining", "Groceries")
    for _ in range(2):
        cc(random.randint(1, last), "WHOLEFDS BKN 10120", "Whole Foods", round(random.uniform(55, 105), 2), "Food & Dining", "Groceries")
    for _ in range(random.randint(5, 7)):
        pick = random.choice([("SWEETGREEN 0212 BROOKLYN NY", "Sweetgreen", (16, 24)), ("CHIPOTLE 2841 NEW YORK NY", "Chipotle", (11, 19)), ("SQ *CORNER BISTRO BROOKLYN NY", "Corner Bistro", (28, 62))])
        cc(random.randint(1, last), pick[0], pick[1], round(random.uniform(*pick[2]), 2), "Food & Dining", "Restaurants & Takeout")
    for _ in range(3):
        cc(random.randint(1, last), "UBER *EATS HELP.UBER.COM CA", "Uber Eats", round(random.uniform(26, 44), 2), "Food & Dining", "Uber Eats")
    for _ in range(random.randint(7, 9)):
        cc(random.randint(1, last), "BLUE BOTTLE COFFEE BROOKLYN NY", "Blue Bottle", round(random.uniform(5, 8.5), 2), "Food & Dining", "Coffee & Juice")
    cc(5, "SPOTIFY USA NEW YORK NY", "Spotify", 11.99, "Subscriptions & Software", "Streaming & Media")
    cc(10, "GOOGLE *YOUTUBE PREMIUM G.CO/HELPPAY# CA", "YouTube Premium", 13.99, "Subscriptions & Software", "Streaming & Media")
    cc(11, "OPENAI *CHATGPT SUBSCR SAN FRANCISCO CA", "OpenAI", 20.00, "Subscriptions & Software", "Software & AI")
    cc(12, "NETFLIX.COM LOS GATOS CA", "Netflix", 17.99, "Subscriptions & Software", "Streaming & Media")
    cc(15, "NYTIMES*DIGITAL 800-698-4637 NY", "NYT", 17.00, "Subscriptions & Software", "Streaming & Media")
    cc(20, "APPLE.COM/BILL ITUNES.COM CA", "iCloud", 9.99, "Subscriptions & Software", "Software & AI")
    cc(22, "T-MOBILE*AUTO PAY BELLEVUE WA", "T-Mobile", 70, "Bills & Utilities", "Phone & Internet")
    for _ in range(random.randint(2, 4)):
        cc(random.randint(1, last), "UBER *TRIP HELP.UBER.COM CA", "Uber", round(random.uniform(13, 31), 2), "Transportation", "Rideshare & Bikes")
    for _ in range(random.randint(2, 3)):
        cc(random.randint(1, last), "AMAZON MKTPL*XY12Z3 AMZN.COM/BILL WA", "Amazon", round(random.uniform(14, 79), 2), "Shopping", "Amazon")
    cc(random.randint(1, last), "TARGET 00018234 BROOKLYN NY", "Target", round(random.uniform(34, 92), 2), "Shopping", "Retail & Home")
    cc(random.randint(2, last), "CVS/PHARMACY #04417 BROOKLYN NY", "CVS", round(random.uniform(11, 34), 2), "Shopping", "Pharmacy & Convenience")
    cc(random.randint(2, last), "AMC 0801 BROOKLYN 18 BROOKLYN NY", "AMC", round(random.uniform(16, 33), 2), "Entertainment", "Events & Going Out")
    if m == 7: cc(14, "TICKETMASTER*ARENA SHOW 866-448-7849 CA", "Ticketmaster", 178.40, "Entertainment", "Events & Going Out")
    if m == 8:
        cc(17, "COSTCO WHSE #0423 BROOKLYN NY", "Costco membership", 65.00, "Shopping", "Retail & Home")
        cc(24, "AMAZON MKTPL RETURN AMZN.COM/BILL WA", "Amazon", 27.99, "Shopping", "Amazon", "refund")
    if m == 10: cc(9, "B&H PHOTO 800-606-6969 NEW YORK NY", "B&H Photo", 249.00, "Shopping", "Retail & Home")
    card_net_by_month[(y, m)] = sum(t["amount"] for t in txns if t["account"] == "chase-card" and t["date"].month == m and t["kind"] == "expense") \
        - sum(t["amount"] for t in txns if t["account"] == "chase-card" and t["date"].month == m and t["kind"] == "refund")

# card payments: on the 20th, pay last month's card total (June pays an opening balance)
OPEN_CARD = 2186.30
for (y, m) in MONTHS:
    pay = OPEN_CARD if m == 6 else round(card_net_by_month[(y, m - 1)], 2)
    add("chase-chk", D(y, m, 20), "ONLINE PAYMENT TO CHASE CARD ENDING IN 5502", "Card payment", pay, "transfer", "Transfers", "Card Payments")
    add("chase-card", D(y, m, 20), "Payment Thank You-Mobile", "Card payment", pay, "transfer", "Transfers", "Card Payments")

txns.sort(key=lambda t: (t["date"], t["account"], t["desc"]))

# ---------- ids, statements, balances ----------
def stmt_id(acct, d): return f"{acct}-{d.year}-{d.month:02d}"
seq = {}
for t in txns:
    k = (t["account"], t["date"].month); seq[k] = seq.get(k, 0) + 1
    t["id"] = f"{t['account']}-{t['date'].month:02d}-{seq[k]:03d}"
    t["statement"] = stmt_id(t["account"], t["date"])

def signed(t):
    a = t["account"]
    if ACCTS[a]["type"] == "card":
        return t["amount"] if t["kind"] == "expense" else -t["amount"]  # card: purchases raise the balance
    return t["amount"] if t["kind"] in ("income",) or (t["kind"] == "transfer" and t["account"] == "harbor-sav") else -t["amount"]

open_bal = {"chase-chk": 5600.00, "harbor-sav": 13200.00, "chase-card": OPEN_CARD}
bal = dict(open_bal)
by_stmt = {}
for (y, m) in MONTHS:
    for a in ACCTS:
        rows = [t for t in txns if t["account"] == a and t["date"].month == m]
        start = bal[a]
        running = start
        for t in rows:
            running = round(running + signed(t), 2)
            t["_bal"] = running
        bal[a] = running
        by_stmt[(a, y, m)] = dict(rows=rows, start=start, end=running)

# ---------- PDFs ----------
ss = getSampleStyleSheet()
H = ParagraphStyle("H", parent=ss["Heading1"], fontSize=16, spaceAfter=2)
S = ParagraphStyle("S", parent=ss["Normal"], fontSize=8.5, textColor=colors.HexColor("#444444"), leading=11)
B = ParagraphStyle("B", parent=ss["Normal"], fontSize=9, leading=11)
def money(v): return f"${v:,.2f}"
def render(acct, y, m):
    info = ACCTS[acct]; data = by_stmt[(acct, y, m)]
    first = dt.date(y, m, 1); last_day = D(y, m, 31)
    fn = os.path.join(HERE, "statements", f"{info['bank']} {info['name']} {info['last4']} - {first.strftime('%Y-%m')}.pdf")
    doc = SimpleDocTemplate(fn, pagesize=letter, leftMargin=0.7*inch, rightMargin=0.7*inch, topMargin=0.6*inch, bottomMargin=0.6*inch,
                            title=f"{info['bank']} {info['name']} statement", author="Demo")
    el = [Paragraph(f"{info['bank']}", H),
          Paragraph("SAMPLE STATEMENT. Fictional person and fictional numbers. For demonstration only.", S),
          Spacer(1, 8),
          Paragraph(f"<b>{info['name']}</b> ending in {info['last4']}", B),
          Paragraph(f"Statement period: {first.strftime('%B %-d, %Y')} through {last_day.strftime('%B %-d, %Y')}", B),
          Paragraph("<br/>".join(HOLDER), B), Spacer(1, 10)]
    rows = data["rows"]
    if info["type"] == "card":
        purchases = sum(t["amount"] for t in rows if t["kind"] == "expense")
        credits = sum(t["amount"] for t in rows if t["kind"] == "refund")
        pays = sum(t["amount"] for t in rows if t["kind"] == "transfer")
        summ = [["Previous balance", money(data["start"])], ["Payments", "-" + money(pays)], ["Credits", "-" + money(credits)],
                ["Purchases", "+" + money(purchases)], ["Interest charged", "$0.00"], ["New balance", money(data["end"])]]
        head = ["Date", "Description", "Amount"]
        body = [[t["date"].strftime("%m/%d"), t["desc"], ("-" if t["kind"] != "expense" else "") + money(t["amount"])] for t in rows]
        widths = [0.8*inch, 4.6*inch, 1.3*inch]
    else:
        dep = sum(t["amount"] for t in rows if signed(t) > 0); wd = sum(t["amount"] for t in rows if signed(t) < 0)
        summ = [["Beginning balance", money(data["start"])], ["Deposits and additions", "+" + money(dep)],
                ["Withdrawals and fees", "-" + money(wd)], ["Ending balance", money(data["end"])]]
        head = ["Date", "Description", "Amount", "Balance"]
        body = [[t["date"].strftime("%m/%d"), t["desc"], ("+" if signed(t) > 0 else "-") + money(t["amount"]), money(t["_bal"])] for t in rows]
        widths = [0.7*inch, 3.6*inch, 1.1*inch, 1.3*inch]
    st = Table(summ, colWidths=[2.4*inch, 1.4*inch], hAlign="LEFT")
    st.setStyle(TableStyle([("FONTSIZE", (0, 0), (-1, -1), 9), ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"), ("LINEABOVE", (0, -1), (-1, -1), 0.6, colors.black)]))
    el += [Paragraph("<b>Account summary</b>", B), Spacer(1, 4), st, Spacer(1, 12), Paragraph("<b>Transaction detail</b>", B), Spacer(1, 4)]
    tt = Table([head] + body, colWidths=widths, repeatRows=1)
    tt.setStyle(TableStyle([("FONTSIZE", (0, 0), (-1, -1), 8), ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                            ("LINEBELOW", (0, 0), (-1, 0), 0.6, colors.black), ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
                            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f3f3f3")])]))
    el.append(tt)
    doc.build(el)
    return fn
for (y, m) in MONTHS:
    for a in ACCTS:
        render(a, y, m)

# ---------- ledger-data.json ----------
def period(a, y, m):
    return {"account": a, "start": f"{y}-{m:02d}-01", "end": D(y, m, 31).isoformat()}
data_file = {
    "version": 1,
    "updated": "2026-10-31",
    "accounts": ACCTS,
    "merchants": {},
    "periods": {f"{a}-{y}-{m:02d}": period(a, y, m) for (y, m) in MONTHS for a in ACCTS},
    "subscriptions": [
        {"name": "Netflix", "what": "Streaming", "account": "chase-card", "cadence": "monthly", "amount": 17.99, "lastSeen": "2026-10-12", "billing": "12th"},
        {"name": "Spotify", "what": "Music", "account": "chase-card", "cadence": "monthly", "amount": 11.99, "lastSeen": "2026-10-05", "billing": "5th"},
        {"name": "YouTube Premium", "what": "Video", "account": "chase-card", "cadence": "monthly", "amount": 13.99, "lastSeen": "2026-10-10", "billing": "10th"},
        {"name": "OpenAI", "what": "ChatGPT", "account": "chase-card", "cadence": "monthly", "amount": 20.0, "lastSeen": "2026-10-11", "billing": "11th"},
        {"name": "NYT", "what": "News", "account": "chase-card", "cadence": "monthly", "amount": 17.0, "lastSeen": "2026-10-15", "billing": "15th"},
        {"name": "iCloud", "what": "Cloud storage", "account": "chase-card", "cadence": "monthly", "amount": 9.99, "lastSeen": "2026-10-20", "billing": "20th"},
        {"name": "Planet Fitness", "what": "Gym", "account": "chase-chk", "cadence": "monthly", "amount": 24.99, "lastSeen": "2026-10-03", "billing": "3rd"},
        {"name": "Costco membership", "what": "Annual membership", "account": "chase-card", "cadence": "annual", "amount": 65.0, "lastSeen": "2026-08-17", "billing": "~17th"},
    ],
    "transactions": [
        {k: (v.isoformat() if k == "date" else v) for k, v in t.items() if k != "_bal"} for t in txns
    ],
}
# only keep merchants the data actually uses, plus the banks
used = {t["merchant"] for t in txns} | {"Chase"}
data_file["merchants"] = {k: v for k, v in MERCHANT_DOMAINS.items() if k in used}
json.dump(data_file, open(os.path.join(HERE, "ledger-data.json"), "w"), indent=2, ensure_ascii=False)

# ---------- exported/ledger-data.json: the statements plus settings ----------
rows = [
    {"id": "b001", "name": "Rent", "amount": 3300, "source": "tracked", "day": 1, "type": "simple"},
    {"id": "b-loans", "name": "Student loans", "amount": 420, "source": "tracked", "day": 3, "type": "simple", "match": {"merchant": "Nelnet"}},
    {"id": "b-car", "name": "Car payment", "amount": 480, "source": "tracked", "day": 5, "type": "simple", "match": {"merchant": "Toyota Financial"}},
    {"id": "b-geico", "name": "Geico", "amount": 165, "source": "tracked", "day": 9, "type": "simple"},
    {"id": "b-elec", "name": "Electricity", "amount": 115, "source": "manual", "day": 8, "type": "simple", "match": {"merchant": "ConEd"}},
    {"id": "b-fios", "name": "Verizon", "amount": 65, "source": "tracked", "day": 12, "type": "simple"},
    {"id": "b-tmo", "name": "T-Mobile", "amount": 70, "source": "tracked", "day": 22, "type": "simple"},
    {"id": "b-nys", "name": "NYS tax plan", "amount": 300, "source": "manual", "day": 16, "type": "simple", "match": {"merchant": "NYS Tax (DTF)"}},
    {"id": "b-groc", "name": "Groceries", "amount": 480, "source": "tracked", "prorate": True, "type": "breakdown",
     "items": [{"id": "g1", "name": "Weekly shop", "mode": "week", "amount": 95, "perWeek": 1}, {"id": "g2", "name": "Top ups", "mode": "month", "amount": 100, "perWeek": 0}]},
    {"id": "b-rest", "name": "Restaurants", "amount": 420, "source": "tracked", "prorate": True, "type": "breakdown",
     "match": {"cat": "Food & Dining", "sub": "Restaurants & Takeout"},
     "items": [{"id": "r1", "name": "Lunch out", "mode": "week", "amount": 22, "perWeek": 3}, {"id": "r2", "name": "Takeout", "mode": "week", "amount": 39, "perWeek": 1}]},
    {"id": "b-coffee", "name": "Coffee", "amount": 90, "source": "tracked", "prorate": True, "type": "simple", "match": {"cat": "Food & Dining", "sub": "Coffee & Juice"}},
    {"id": "b-transit", "name": "Transit", "amount": 140, "source": "tracked", "prorate": True, "type": "simple", "match": {"merchants": ["MTA", "Uber"]}},
    {"id": "b-fun", "name": "Fun", "amount": 100, "source": "manual", "type": "simple", "match": {"cat": "Entertainment"}},
    {"id": "b-unex", "name": "Unexpected", "amount": 150, "source": "manual", "type": "simple", "match": None},
]
budget = {"updated": "2026-11-07", "rows": rows, "dismissedSubs": {},
          "leftover": [{"id": "l1", "target": "savings", "pct": 60}, {"id": "l2", "target": "b-unex", "pct": 40}]}
local = {
    "ledger:takeHome": {"salary": 150000, "deductions": [
        {"id": "d401k", "kind": "401k", "unit": "pct", "amount": 6, "match": 50},
        {"id": "dmed", "kind": "insurance", "unit": "mo", "amount": 180, "match": 0}]},
    "ledger:taxState": "ny-nyc",
    "ledger:budgetIncomeOverride": {"active": False},
    "ledger:debts": [
        {"id": "loans", "name": "Student loans", "balance": 41200, "apr": 5.5, "payment": 0, "budgetRow": "b-loans"},
        {"id": "car", "name": "Car loan", "balance": 14800, "apr": 6.2, "payment": 0, "budgetRow": "b-car"}],
    "ledger:assets": [
        {"id": "a1", "name": "Chase checking", "balance": round(bal["chase-chk"], 2)},
        {"id": "a2", "name": "Harbor savings", "balance": round(bal["harbor-sav"], 2)},
        {"id": "a3", "name": "401k", "balance": 62000, "pool": "401k"}],
    "ledger:assetsAsOf": "2026-10-31",
    "ledger:stockCalc2": {"exit": 60, "strike": 22, "shares": 20000, "salary": 150000, "years": 4},
    "ledger:retireCalc": {
        "age": 34, "retireAge": 55, "accessAge": 60, "endAge": 95, "start401k": 0, "startSavings": 0, "startFrom": "balances", "startOff": [],
        "contrib401k": 0, "contribSavings": 0, "auto401k": True, "autoSavings": True, "withdrawMo": 7000, "taxPct": 15, "autoTax": True,
        "ss": {"on": True, "claimAge": 67, "auto": True, "monthly": 0},
        "events": [
            {"id": "e1", "name": "House downpayment", "amount": 80000, "kind": "out", "age": 38, "repeat": "once", "years": 1},
            {"id": "e2", "name": "Options payout", "amount": 0, "kind": "in", "age": 36, "repeat": "year", "years": 4, "auto": "equity"}],
        "extras": [{"id": "x1", "name": "Roth IRA", "amount": 6500, "unit": "yr", "to": "401k"}]},
    "ledger:retirePortfolio": [{"name": "VTI", "alloc": 60, "perf": 10.5}, {"name": "VXUS", "alloc": 20, "perf": 5.5}, {"name": "BND", "alloc": 20, "perf": 3.5}],
    "ledger:retirePortfolioAfter": {"same": False, "rows": [{"name": "VTI", "alloc": 40, "perf": 10.5}, {"name": "VXUS", "alloc": 10, "perf": 5.5}, {"name": "BND", "alloc": 50, "perf": 3.5}]},
    "ledger:retireIncludeDebt": True,
    "ledger:rentIncomeCalc2": {"income": 150000, "rent": 3400, "times": 40, "mode": 0},
    "ledger:rentScenario3": {"from": 2000, "to": 5500, "step": 500, "rentRow": "b001"},
    "ledger:lists": [{"id": "sell", "title": "Selling stuff", "description": "List what you plan to sell and what you expect to get for each.",
                      "items": [{"id": "s1", "name": "Road bike", "amount": 900}, {"id": "s2", "name": "Monitor", "amount": 250}]}],
}
log = {"entries": [
    {"id": "log-demo-1", "date": "2026-11-02", "amount": 84.20, "note": "Trader Joe's", "rowId": "b-groc", "createdAt": 1793600000000},
    {"id": "log-demo-2", "date": "2026-11-04", "amount": 38.50, "note": "Takeout", "rowId": "b-rest", "createdAt": 1793780000000},
    {"id": "log-demo-3", "date": "2026-11-05", "amount": 22.00, "note": "Birthday card and flowers", "rowId": "b-unex", "createdAt": 1793860000000},
]}
exported = {"version": 1, "exportedAt": "2026-11-07T00:00:00.000Z",
            **{k: v for k, v in data_file.items() if k != "version"},
            "settings": {"budget": budget, "notes": {"notes": []}, "presets": {}, "log": log, "local": local}}
os.makedirs(os.path.join(HERE, "exported"), exist_ok=True)
json.dump(exported, open(os.path.join(HERE, "exported", "ledger-data.json"), "w"), indent=2, ensure_ascii=False)

print("statements:", len(os.listdir(os.path.join(HERE, "statements"))), "pdfs")
print("transactions:", len(txns))
for a in ACCTS: print(a, "ending balance", money(bal[a]))
for (y, m) in MONTHS:
    inc = sum(t["amount"] for t in txns if t["kind"] == "income" and t["date"].month == m and t["cat"] == "Income" and t["sub"] == "Payroll")
    sp = sum(t["amount"] for t in txns if t["kind"] == "expense" and t["date"].month == m)
    print(f"{y}-{m:02d} payroll {inc:,.2f}  spending {sp:,.2f}")
print("lowest checking balance:", money(min(t["_bal"] for t in txns if t["account"] == "chase-chk")))
