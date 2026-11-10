import type { GuideSection } from '@/screens/guide/types/GuideSection'
import { GITHUB_URL } from '@/shared/constants/GITHUB_URL'

// The Getting started guide. The page and its "On this page" table of contents are both built
// from this list, so a heading added here shows up in both. Ids must be unique on the page.
// Labels wrapped in { label } are spelled exactly as they read in the app.
export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'what-is-ledger',
    title: 'What is Ledger',
    blocks: [
      {
        kind: 'p',
        text: [
          'Ledger is a financial planning app built on your own bank statements. Most money apps stop at a spending chart and a monthly budget. Ledger keeps going. It follows your salary through taxes and your 401k, tracks each debt until it is paid off and turns all of it into a retirement plan that starts from what is true this month.',
        ],
      },
    ],
    subsections: [
      {
        id: 'planning-that-fits',
        title: 'Planning that does not oversimplify you',
        blocks: [
          {
            kind: 'p',
            text: [
              'Real planning has moving parts that depend on each other. Your paycheck is not your salary, because a 401k deferral lowers your income tax but not Social Security and Medicare. Each debt has its own balance, rate and payment, and the month it is paid off, that payment is free to go somewhere else. A 401k and a savings account are not the same money either, since one of them is locked until you are old enough to reach it.',
            ],
          },
          {
            kind: 'p',
            text: [
              'Ledger models these things instead of hiding them, and it connects its pages so a change in one place shows up everywhere it matters. Change your salary once and your Budget, your rent scenarios and your retirement plan all move with it.',
            ],
          },
        ],
      },
      {
        id: 'reads-your-statements',
        title: 'It reads your statements through an assistant you choose',
        blocks: [
          {
            kind: 'p',
            text: [
              'Ledger has no bank connections and no login. You download your statements from your bank, as PDF or CSV from any bank, and give them to an AI assistant you already use, such as Claude or ChatGPT, together with Ledger\'s import prompt. The assistant turns them into one file, ',
              { code: 'ledger-data.json' },
              ', and you upload that file here.',
            ],
          },
          {
            kind: 'p',
            text: [
              'Ledger itself never sees your statements. Only the assistant you picked reads them, the same way it reads any file you attach to a chat, under its own privacy terms.',
            ],
          },
        ],
      },
      {
        id: 'stays-on-your-device',
        title: 'Where your data lives',
        blocks: [
          {
            kind: 'p',
            text: [
              'On the website, your statements and the numbers you enter live in this browser\'s own storage and are not uploaded anywhere. The app does send usage details, which are just which page and tool is used plus a random session ID. They help with product design, analytics and making sure the app works well. No personal information and no actual values you enter are ever sent.',
            ],
          },
          {
            kind: 'p',
            text: [
              'If you run Ledger on your own computer instead, your data lives in a folder of plain files and the browser is not involved at all.',
            ],
          },
        ],
      },
      {
        id: 'free-and-open-source',
        title: 'Free and open source',
        blocks: [
          {
            kind: 'p',
            text: [
              'Ledger is free and MIT licensed. All of its code is public, so you can read it to check these promises, run your own copy or help make it better. ',
              { anchor: 'open-source', text: 'Open source and contributing' },
              ' at the end of this guide says how.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'how-tabs-fit',
    title: 'How the tabs fit together',
    blocks: [
      {
        kind: 'p',
        text: [
          'Ledger is a set of tabs that feed each other. Some hold facts about you, some hold your plan and one, Retirement, brings it all together. Here is what each tab is for, in the order they sit in the sidebar.',
        ],
      },
    ],
    subsections: [
      {
        id: 'tab-getting-started',
        title: 'Getting started',
        blocks: [
          {
            kind: 'p',
            text: [
              'This page. It explains how Ledger works, how your file is kept and how to set up a retirement plan step by step. Reading it never changes your data, so come back whenever you need a reminder.',
            ],
          },
        ],
      },
      {
        id: 'tab-about-you',
        title: 'About you',
        blocks: [
          {
            kind: 'p',
            text: [
              'The few facts that several pages share: your birth date, your filing status and the state and city you pay tax in. You set them once on ',
              { tab: 'about', text: 'About you' },
              ' and the planning pages read them from there. Your birth date gives Retirement your age. Your filing status and state change every tax figure in the app, from Take-home pay to the tax on what you take out of a 401k.',
            ],
          },
        ],
      },
      {
        id: 'tab-spending',
        title: 'Spending',
        blocks: [
          {
            kind: 'p',
            text: [
              'What really happened, straight from your statements. ',
              { tab: 'actuals', text: 'Spending' },
              ' shows your income, spending and net for a month or a range of months, a breakdown by category that you can click into all the way down to each merchant, trends over time, cash flow and your subscriptions. Transfers between your own accounts, like a card payment from checking, are left out so nothing is counted twice. The accounts listed in the sidebar switch each account on and off on this page.',
            ],
          },
        ],
      },
      {
        id: 'tab-budget',
        title: 'Budget',
        blocks: [
          {
            kind: 'p',
            text: [
              'Your plan for a normal month. On ',
              { tab: 'budget', text: 'Budget' },
              ' you add a row for rent, groceries and everything else you spend on, and your subscriptions fill themselves in from your statements. Turn on ',
              { label: 'Compare to actual' },
              ' to see each row next to what you really spent in a month. Your income comes from your statements, from the Take-home pay tool or from a number you type. At the bottom, ',
              { label: 'What to do with what is left' },
              ' decides where the money left over each month goes, such as into savings.',
            ],
          },
        ],
      },
      {
        id: 'tab-log',
        title: 'Log',
        blocks: [
          {
            kind: 'p',
            text: [
              'A diary for the weeks between statements. Statements arrive weeks late, so when you buy something today you can write it in the ',
              { tab: 'log', text: 'Log' },
              ' against one of your Budget rows. Each row gets a meter that fills toward that row\'s budget for the month, so you can tell if you are on track before the statement shows up. Log entries never turn into statement transactions. Once a month\'s statements are in, they are the truth.',
            ],
          },
        ],
      },
      {
        id: 'tab-tools',
        title: 'Tools',
        blocks: [
          {
            kind: 'p',
            text: [
              'Calculators for the money questions that come up, such as Take-home pay, Rent scenarios, Debt payoff, Hourly calculator, Vacation planning and Equity payout. Pick which ones show on ',
              { tab: 'tools', text: 'Tools' },
              ' with ',
              { label: 'What to show' },
              ' in the page header. Several of them read your Budget and Balances, so their answers agree with the rest of the app. Take-home pay matters most for planning, because Budget and Retirement both read it.',
            ],
          },
        ],
      },
      {
        id: 'tab-retirement',
        title: 'Retirement',
        blocks: [
          {
            kind: 'p',
            text: [
              'A year by year projection from your current age to the age you plan to. ',
              { tab: 'retirement', text: 'Retirement' },
              ' shows how much you will have when you stop working, whether the money lasts and the earliest age you could retire. Almost every number on it can come from another tab, so the plan moves when your life does.',
            ],
          },
        ],
      },
      {
        id: 'tab-balances',
        title: 'Balances',
        blocks: [
          {
            kind: 'p',
            text: [
              'What you have and what you owe, typed in by hand. On ',
              { tab: 'balances', text: 'Balances' },
              ' each debt gets a balance, an interest rate and a monthly payment, and Ledger works out when each one is paid off. Each savings or retirement account gets an account type. Retirement starts from these numbers.',
            ],
          },
        ],
      },
      {
        id: 'how-data-flows',
        title: 'How data flows between tabs',
        blocks: [
          {
            kind: 'p',
            text: ['This is the part that makes Ledger different. Each arrow below is a number you never have to type twice.'],
          },
          {
            kind: 'list',
            items: [
              [
                { label: 'Take-home pay into Budget and Retirement.' },
                ' When the Budget income source is ',
                { label: 'From the Take-home tool' },
                ', your monthly income is the take-home pay from that tool. Retirement reads the same tool for what goes into your 401k each year, your employer\'s match included, and for its Social Security estimate.',
              ],
              [
                { label: 'Budget leftover into Retirement savings.' },
                ' The Savings share under ',
                { label: 'What to do with what is left' },
                ', times 12, becomes ',
                { label: 'Into savings per year' },
                ' on Retirement.',
              ],
              [
                { label: 'Balances debts and assets into Retirement.' },
                ' ',
                { label: 'Starting balances' },
                ' can come from Balances, so your savings, your retirement accounts and your debts are where the plan begins. Each debt\'s payment is freed up once the debt is paid off and goes where your Budget sends leftover money, usually savings.',
              ],
              [
                { label: 'Log into Budget meters.' },
                ' Every Log entry counts against a Budget row and fills that row\'s meter on the Log. A row that gets a share of the leftover adds that share to its meter too.',
              ],
              [
                { label: 'About you into everything that plans.' },
                ' Your age for Retirement and the payoff ages on Balances, and your filing status and state for every tax figure.',
              ],
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'your-data',
    title: 'Your data and your file',
    blocks: [
      {
        kind: 'p',
        text: [
          'Everything Ledger knows about you fits in one file, ',
          { code: 'ledger-data.json' },
          '. Knowing how that file works is the key to never losing your work, so this section is worth a careful read.',
        ],
      },
    ],
    subsections: [
      {
        id: 'first-time',
        title: 'The first time',
        blocks: [
          {
            kind: 'steps',
            items: [
              ['Download your statements from your bank, as PDF or CSV. A few months give better averages than one.'],
              [
                'Open your AI assistant, attach the statements and paste the import prompt. On an empty Ledger, ',
                { label: 'Copy import prompt' },
                ' puts it on your clipboard. It is also in ',
                { href: `${GITHUB_URL}/blob/main/IMPORT_PROMPT.md`, text: 'IMPORT_PROMPT.md' },
                ' on GitHub, and once you have data you can ',
                { anchor: 'import-prompt', text: 'get the import prompt again' },
                ' on this page.',
              ],
              [
                'The assistant checks what it read against the totals printed on each statement, tells you how each one came out and gives you ',
                { code: 'ledger-data.json' },
                '.',
              ],
              [
                'Upload it with ',
                { label: 'Upload ledger-data.json' },
                '. Later on, the ',
                { label: 'Upload file' },
                ' icon at the bottom of the sidebar opens ',
                { label: 'Upload your data' },
                ', where ',
                { label: 'Choose a file' },
                ' does the same thing.',
              ],
            ],
          },
          {
            kind: 'p',
            text: [
              'A first file holds only your statements. Ledger starts your budget and settings from its defaults, and they join the file the first time you export.',
            ],
          },
        ],
      },
      {
        id: 'what-export-saves',
        title: 'What Export data saves',
        blocks: [
          {
            kind: 'p',
            text: [
              'The ',
              { label: 'Export data' },
              ' icon at the bottom of the sidebar saves one ',
              { code: 'ledger-data.json' },
              ' with everything in it: your statements plus your budget, your presets, your Log, your Retirement plan, your balances and your settings such as your birth date. There is no second settings file.',
            ],
          },
          {
            kind: 'p',
            text: [
              'Because it holds the whole picture, an export is a complete backup. Upload it in another browser, on another computer or after clearing this one, and Ledger looks exactly as it did when you exported. It is also the file you give your assistant, together with ',
              { anchor: 'import-prompt', text: 'the import prompt' },
              ', when you add new months.',
            ],
          },
        ],
      },
      {
        id: 'uploading-replaces',
        title: 'Uploading replaces what is stored',
        blocks: [
          {
            kind: 'p',
            text: [
              'Uploading a file with the ',
              { label: 'Upload file' },
              ' icon replaces what this device has stored, and a file replaces only the parts it contains. Nothing is merged. A full export replaces everything. A file with only statements, like a first file or one your assistant made fresh from ',
              { anchor: 'import-prompt', text: 'the import prompt' },
              ', replaces your statements and keeps your budget and settings. Over the sample data, any file replaces everything.',
            ],
          },
          {
            kind: 'note',
            title: 'Before you upload',
            text: [
              'Make sure the file is your newest one. If you are not sure, use Export data first, so you keep a copy of what is here right now.',
            ],
          },
        ],
      },
      {
        id: 'monthly-update',
        title: 'Updating each month',
        blocks: [
          {
            kind: 'steps',
            items: [
              ['Click ', { label: 'Export data' }, ' to save your latest ', { code: 'ledger-data.json' }, '.'],
              [
                'Give that file and your new statements to your assistant with ',
                { anchor: 'import-prompt', text: 'the import prompt' },
                '. The prompt tells it to keep every account, transaction and setting exactly as it is and only add the new month.',
              ],
              ['Upload the file it gives back. It replaces what Ledger had, now with the new month added.'],
            ],
          },
        ],
      },
      {
        id: 'import-prompt',
        title: 'Get the import prompt again',
        blocks: [
          {
            kind: 'p',
            text: [
              'The empty screen\'s ',
              { label: 'Copy import prompt' },
              ' button goes away once Ledger has your data, so the same prompt is here too, and in the ',
              { label: 'Upload your data' },
              ' window that the ',
              { label: 'Upload file' },
              ' icon in the sidebar opens. You need it whenever your assistant has to read statements:',
            ],
          },
          {
            kind: 'list',
            items: [
              ['You are updating with new months. Give your assistant your last export, the new statements and the prompt.'],
              ['You want to redo or replace your statements, for example to add an account you left out or to start over from a fresh set of statements.'],
              ['Something went wrong, like a statement whose totals did not match, and you want to run the import again.'],
            ],
          },
          {
            kind: 'p',
            text: [
              'If you give your assistant only statements and no earlier file, it makes a file with only statements. Uploading that file replaces just your statements and keeps your About you, Balances, Budget, Tools and Retirement settings, because a file replaces only the parts it contains. Export first anyway, so you have a backup of everything.',
            ],
          },
          { kind: 'importPrompt' },
        ],
      },
      {
        id: 'where-stored',
        title: 'Where your data is stored',
        blocks: [
          {
            kind: 'p',
            text: [
              'On the website, everything lives in this browser on this device. It is not uploaded anywhere, and it does not follow you to another browser or another computer. When you run Ledger on your own computer, the data lives as plain files in a data folder instead.',
            ],
          },
          {
            kind: 'note',
            title: 'Export regularly',
            text: [
              'Clearing your browser data removes what Ledger stored here. Export after each monthly update and keep the file somewhere safe, so you can always upload it again.',
            ],
          },
        ],
      },
      {
        id: 'sample-data',
        title: 'The sample data',
        blocks: [
          {
            kind: 'p',
            text: [
              'The sample data is a made-up person, so you can explore every tab before you have a file of your own. ',
              { label: 'Try it with sample data' },
              ' on the empty screen loads it. It tells a whole story: a 25 year old in Texas with a corporate job until 40, an easier job after that and a plan to retire at 62, with a Budget, Balances, presets and a Retirement plan already filled in.',
            ],
          },
          {
            kind: 'p',
            text: [
              'To leave it, upload your own ',
              { code: 'ledger-data.json' },
              '. Any file you upload over the sample replaces all of it, so none of the made-up numbers stay behind.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'retirement-setup',
    title: 'Set up the Retirement tab, step by step',
    blocks: [
      {
        kind: 'p',
        text: [
          'Retirement ties everything together, and it is most useful when it reads from the other tabs instead of from numbers you type. Follow these steps in order and most of the plan fills itself in. Each step takes a few minutes, and you can come back to any of them later.',
        ],
      },
    ],
    subsections: [
      {
        id: 'step-about-you',
        title: '1. About you',
        blocks: [
          {
            kind: 'p',
            text: [
              'Open ',
              { tab: 'about', text: 'About you' },
              ' and type your birth date in ',
              { label: 'Your birth date' },
              ' as MM-DD-YYYY, for example 05-14-1990. There is no calendar to click through. Just type it, and Ledger shows your age under the box so you can check it.',
            ],
          },
          {
            kind: 'p',
            text: [
              'Then pick your ',
              { label: 'Filing status' },
              ', Single or Married filing jointly, and your state and city under ',
              { label: 'Tax state and city' },
              '. Retirement starts from your age, and it uses your filing status and state to work out the tax on what you take out of a pre-tax 401k.',
            ],
          },
        ],
      },
      {
        id: 'step-balances',
        title: '2. Balances',
        blocks: [
          {
            kind: 'p',
            text: [
              'Open ',
              { tab: 'balances', text: 'Balances' },
              '. Under ',
              { label: 'What you owe' },
              ', click ',
              { label: 'Add a debt' },
              ' for each debt and fill in its ',
              { label: 'Balance' },
              ', its interest rate as ',
              { label: 'APR' },
              ' and its monthly payment. If you already pay it from a Budget row, like a Car loan row, set ',
              { label: 'Payment comes from' },
              ' to that row so the two always match. Under each debt, Ledger tells you when it is paid off and how much is freed up each month after that.',
            ],
          },
          {
            kind: 'p',
            text: [
              'Under ',
              { label: 'What you have' },
              ', click ',
              { label: 'Add something you have' },
              ' for each account and pick its account type:',
            ],
          },
          {
            kind: 'list',
            items: [
              [{ label: 'Savings (use anytime)' }, ' for cash and investments you can reach today.'],
              [{ label: 'Pre-tax 401k or IRA (locked)' }, ' for a traditional 401k or IRA. It is taxed as income when you take it out.'],
              [{ label: 'Roth 401k or IRA (locked)' }, ' for Roth money. It was taxed going in and comes out tax free.'],
            ],
          },
          {
            kind: 'p',
            text: [
              'Locked accounts stay locked until the ',
              { label: '401k access age' },
              ' on Retirement, 60 unless you change it. Last, set the ',
              { label: 'As of' },
              ' date to the day these numbers are from.',
            ],
          },
          {
            kind: 'note',
            title: 'Why the As of date matters',
            text: [
              'Retirement uses your age on the day you last updated Balances, not your age today. Your balances are a snapshot from that day, so the plan starts from the age you were when they were true. That way the plan does not drift as the months go by without an update. When you update your balances, move the date forward and your starting age moves with it.',
            ],
          },
        ],
      },
      {
        id: 'step-take-home',
        title: '3. Take-home pay',
        blocks: [
          {
            kind: 'p',
            text: [
              'Open ',
              { tab: 'tools', text: 'Tools' },
              ' and find Take-home pay. If it is hidden, switch it on in ',
              { label: 'What to show' },
              '. Enter your ',
              { label: 'Salary per year' },
              '. Then use ',
              { label: 'Add something that comes out' },
              ' to add your 401k, as a percent of your pay or a dollar amount, and set its ',
              { label: 'Employer match' },
              ' as a percent of what you put in. A 50% match on a 6% contribution means your employer adds half of what you do. Add health insurance and anything else your pay stub shows.',
            ],
          },
          {
            kind: 'p',
            text: [
              'The tool taxes your pay in the state you chose on About you, and its ',
              { label: 'Change' },
              ' button takes you there. A good habit is to adjust the health insurance amount until the paycheck matches a real pay stub, so every other salary you try is just as accurate.',
            ],
          },
          {
            kind: 'p',
            text: [
              'When it looks right, open the ',
              { label: 'Presets' },
              ' menu in the card\'s header and choose ',
              { label: 'Save as new preset' },
              '. Give it a name like Today.',
            ],
          },
        ],
      },
      {
        id: 'step-budget',
        title: '4. Budget',
        blocks: [
          {
            kind: 'p',
            text: [
              'Open ',
              { tab: 'budget', text: 'Budget' },
              ' and add a row with ',
              { label: 'Add row' },
              ' for each thing you spend on in a normal month. Your subscriptions are already there. Set the source of your monthly income to ',
              { label: 'From the Take-home tool' },
              ' to keep it in step with step 3.',
            ],
          },
          {
            kind: 'p',
            text: [
              'At the bottom, under ',
              { label: 'What to do with what is left' },
              ', click ',
              { label: 'Add' },
              ' and give a share to Savings. That share, times 12, is what Retirement saves for you each year. If you add no shares at all, Retirement counts the whole leftover as savings. Then save this Budget as a preset too, for example Today.',
            ],
          },
        ],
      },
      {
        id: 'step-badges',
        title: '5. Back on Retirement: let the badges fill it in',
        blocks: [
          {
            kind: 'p',
            text: [
              'Open ',
              { tab: 'retirement', text: 'Retirement' },
              '. Small badges on the fields let it read from the other tabs instead of from numbers you type. A field that follows another tab shows its number and an info icon that says where it came from. Here is what each one does, with an example.',
            ],
          },
          {
            kind: 'list',
            items: [
              [
                { label: 'Current age' },
                ' has an ',
                { label: 'Auto' },
                ' badge that uses your age from About you on your Balances As of date. With a birth date of 05-14-2001 and an As of date of October 31 2026, the plan starts at 25.',
              ],
              [
                { label: 'Starting balances' },
                ' set to ',
                { label: 'From Balances' },
                ' lists everything on Balances with a checkbox. With $28,200 in savings and $25,200 owed, your savings start at $3,000, and money in retirement accounts is counted on its own.',
              ],
              [
                { label: 'Into 401k per year' },
                ' has a ',
                { label: 'Take-home preset' },
                ' badge. Set to ',
                { label: 'Today\'s Take-home' },
                ', it follows the tool. A $105,000 salary with 6% into the 401k and a 50% match puts in $6,300 a year, your employer adds $3,150 and the field shows $9,450.',
              ],
              [
                { label: 'Into savings per year' },
                ' has a ',
                { label: 'Budget preset' },
                ' badge. Set to ',
                { label: 'Today\'s Budget' },
                ', it follows your Budget. If your Savings share of the leftover is $1,000 a month, the field shows $12,000.',
              ],
              [
                { label: 'Need per month' },
                ' has a ',
                { label: 'Budget' },
                ' badge that opens a list of your Budget presets. Pick one called Retirement and the field shows that preset\'s monthly total. Change the preset on Budget and Retirement follows it.',
              ],
            ],
          },
          {
            kind: 'p',
            text: [
              'The 401k and savings badges also list the presets you saved. Picking one starts a pay plan, which ',
              { anchor: 'phases-of-life', text: 'the next section' },
              ' explains.',
            ],
          },
        ],
      },
      {
        id: 'step-numbers',
        title: '6. What the numbers mean',
        blocks: [
          {
            kind: 'list',
            items: [
              [
                { label: 'At retirement' },
                ' is the spendable money you will have the year you retire, with what is still locked in your 401k shown next to it.',
              ],
              [
                { label: 'Money lasts' },
                ' reads "to 95+" when your spendable money never runs out before your ',
                { label: 'Plan to age' },
                '. If it reads "runs out at" an age, try a later ',
                { label: 'Retire at' },
                ', a lower Need per month or more savings. The ',
                { label: 'Find' },
                ' badge on Retire at searches for the earliest age where the money lasts.',
              ],
              [
                { label: 'Left over at' },
                ' 70, 80 and so on is how much spendable money is left at each of those ages.',
              ],
              [
                { label: 'Tax on 401k withdrawals' },
                ', under ',
                { label: 'In retirement' },
                ', is on unless you turn it off. Money in a pre-tax 401k was never taxed, so it is taxed as income when you take it out. Ledger takes out enough to pay that tax and still cover what you need, and shows the tax for each year in the ',
                { label: 'Year by year' },
                ' table. Your savings are spent first and Roth money last.',
              ],
            ],
          },
          {
            kind: 'note',
            title: 'A careful estimate, not a promise',
            text: [
              'Ledger plans in today\'s dollars with the same return every year and no inflation, and the note under the table says so. Use it to compare choices, like retiring at 60 or 65, rather than to predict an exact number.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'phases-of-life',
    title: 'Plan different phases of life with presets',
    blocks: [
      {
        kind: 'p',
        text: [
          'Your life will not look the same for forty years. You might move to an easier job, have a family or cut back before you stop. Presets let you plan each of those parts of your life once and line them up by age.',
        ],
      },
    ],
    subsections: [
      {
        id: 'presets-idea',
        title: 'The idea',
        blocks: [
          {
            kind: 'p',
            text: [
              'A preset is a saved version of a page. Save several Budgets and several Take-home pay presets, one for each part of your life. For example:',
            ],
          },
          {
            kind: 'list',
            items: [
              [{ label: 'Today' }, ': the job you have and the budget you live on now.'],
              [{ label: 'Easier job' }, ': a lower salary and a leaner budget for later.'],
              [{ label: 'Retirement' }, ': what you expect to spend once you stop working.'],
            ],
          },
          {
            kind: 'p',
            text: [
              'On Retirement, the ',
              { label: 'Pay and saving over time' },
              ' card lets each period of your life, by age, pick a Take-home preset for what goes into your 401k and a Budget preset for what goes into savings. Need per month can follow your Retirement budget. When you change a preset on its own tab, the plan follows.',
            ],
          },
        ],
      },
      {
        id: 'worked-example',
        title: 'A worked example',
        blocks: [
          {
            kind: 'p',
            text: [
              'This is the story the sample data tells, so you can load it and follow along. Picture a 25 year old with a corporate job until 40, an easier job after that and a plan to retire at 62.',
            ],
          },
          {
            kind: 'steps',
            items: [
              [
                'In the Take-home pay tool, save two presets: Corporate job, at $105,000 with 6% into the 401k and a 50% match, and Easier job, at $62,000 with nothing into the 401k.',
              ],
              ['On Budget, save three presets: Today, Leaner (easier job) and Retirement.'],
              [
                'On Retirement, click ',
                { label: 'Plan pay changes' },
                '. It adds a period that starts today and a second one ten years on.',
              ],
              [
                'Call the first period Corporate job, from 25 until 40. Pick Corporate job with the Take-home preset badge and Today with the Budget preset badge, and set ',
                { label: 'Contributions grow a year' },
                ' to 3% for raises.',
              ],
              [
                'Call the second period Easier job, from 40, with ',
                { label: 'Ends' },
                ' set to ',
                { label: 'When I retire' },
                '. Pick Easier job and Leaner (easier job).',
              ],
              ['Set Retire at to 62, then use the Budget badge on Need per month to follow the Retirement preset.'],
            ],
          },
          {
            kind: 'p',
            text: [
              'Now the plan saves hard while the pay is high, saves less after the switch and spends what the Retirement budget says from 62 on. Change the Easier job salary in the Take-home pay tool and the whole plan moves with it.',
            ],
          },
        ],
      },
      {
        id: 'create-budget-preset',
        title: 'Create a Budget preset',
        blocks: [
          {
            kind: 'p',
            text: [
              'On ',
              { tab: 'budget', text: 'Budget' },
              ', set up the rows for that part of your life. Open the ',
              { label: 'Presets' },
              ' menu in the toolbar (it shows the name of the active preset once you have one) and choose ',
              { label: 'Save as new preset' },
              '. Name it after the part of life it stands for.',
            ],
          },
          {
            kind: 'p',
            text: [
              'Picking a preset from the menu loads its rows into your Budget, so save the Budget you have first if you want to keep it. To update a preset, change the rows and click the save icon beside it in the menu. The pencil renames it and the X deletes it. The menu is hidden while ',
              { label: 'Remaining this month' },
              ' is on.',
            ],
          },
        ],
      },
      {
        id: 'create-take-home-preset',
        title: 'Create a Take-home pay preset',
        blocks: [
          {
            kind: 'p',
            text: [
              'In the Take-home pay tool on ',
              { tab: 'tools', text: 'Tools' },
              ', enter the salary and what comes out of the pay for that job. Open the ',
              { label: 'Presets' },
              ' menu in the card\'s header and choose ',
              { label: 'Save as new preset' },
              '. The same save icon, pencil and X work here as on Budget.',
            ],
          },
        ],
      },
      {
        id: 'pick-presets',
        title: 'Pick presets on Retirement',
        blocks: [
          {
            kind: 'p',
            text: [
              'In ',
              { label: 'Pay and saving over time' },
              ', click ',
              { label: 'Plan pay changes' },
              '. Each period has a label, a ',
              { label: 'From age' },
              ' and an end: ',
              { label: 'When I retire' },
              ' or ',
              { label: 'At an age' },
              ' with an ',
              { label: 'Until age' },
              '. The until age is not part of the period, so until 40 means the last year in it is 39 and the next period starts at 40.',
            ],
          },
          {
            kind: 'p',
            text: [
              'Use the ',
              { label: 'Take-home preset' },
              ' badge on Into 401k per year and the ',
              { label: 'Budget preset' },
              ' badge on Into savings per year to choose the presets for each period. Add more periods with ',
              { label: 'Add a pay period' },
              ', or click ',
              { label: 'Back to one period' },
              ' to start over. The ',
              { label: 'How this works' },
              ' button in the card explains the same idea in a few lines.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'good-habits',
    title: 'Good habits',
    blocks: [
      {
        kind: 'p',
        text: ['A few small routines keep your plan honest and your data safe.'],
      },
    ],
    subsections: [
      {
        id: 'habit-update-balances',
        title: 'Update Balances when your numbers change',
        blocks: [
          {
            kind: 'p',
            text: [
              'When your savings or debts change in a way you care about, update What you have and What you owe on ',
              { tab: 'balances', text: 'Balances' },
              ' and move the As of date forward. Retirement\'s starting age and balances move with it. Once a month, when you add new statements, is a good rhythm.',
            ],
          },
        ],
      },
      {
        id: 'habit-export',
        title: 'Export regularly',
        blocks: [
          {
            kind: 'p',
            text: [
              'On the website, this browser is the only place your data lives. Export after each monthly update and after any big change to your plan, and keep the file somewhere safe.',
            ],
          },
        ],
      },
      {
        id: 'habit-fixed-ages',
        title: 'Use fixed numbers if you prefer',
        blocks: [
          {
            kind: 'p',
            text: [
              'If you would rather pencil things in, click ',
              { label: 'Auto' },
              ' on Current age and type an age. Ledger keeps the age you typed, so clicking Auto again brings back the age from About you. In the same way, Starting balances has ',
              { label: 'Type it in' },
              ', and the 401k, savings and Need per month badges all end with Type it in.',
            ],
          },
        ],
      },
      {
        id: 'habit-auto',
        title: 'What Auto means and how to turn it off',
        blocks: [
          {
            kind: 'p',
            text: [
              'An ',
              { label: 'Auto' },
              ' badge means Ledger fills that field in from somewhere else in the app, such as Current age from About you or the tax on investment gains from your state. Hover the info icon next to the field to see where the number comes from. Click Auto to switch it off and type your own number, and click it again to go back. The Take-home preset, Budget preset and Budget badges work the same way, with Type it in as the way out.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'open-source',
    title: 'Open source and contributing',
    blocks: [
      {
        kind: 'p',
        text: [
          'Ledger is built in the open, and help of every size is welcome, from a typo fix to a new calculator.',
        ],
      },
    ],
    subsections: [
      {
        id: 'mit-license',
        title: 'MIT licensed on GitHub',
        blocks: [
          {
            kind: 'p',
            text: [
              'The code lives at ',
              { href: GITHUB_URL, text: 'github.com/itstoyboxlabs/ledger' },
              ' under the MIT license. You can read it, run it, change it and share it.',
            ],
          },
        ],
      },
      {
        id: 'run-it-yourself',
        title: 'Run it on your own computer',
        blocks: [
          {
            kind: 'p',
            text: [
              'Clone the repository, then in the ',
              { code: 'app' },
              ' folder run ',
              { code: 'npm install' },
              ' and ',
              { code: 'npm run dev' },
              '. That starts local mode, where Ledger reads and writes plain files in a data folder and a coding assistant can import your statements straight into it. Browser mode, ',
              { code: 'npm run dev -- --mode browser' },
              ', keeps everything in the browser just like the website.',
            ],
          },
        ],
      },
      {
        id: 'add-a-tool',
        title: 'Add a tool',
        blocks: [
          {
            kind: 'p',
            text: [
              'A new calculator is a good first change. Add a folder for it under ',
              { code: 'app/src/screens/tools/features/' },
              ', then add it to ',
              { code: 'TOOL_LIST' },
              ' with an id, a title and a one line description. ',
              { href: `${GITHUB_URL}/blob/main/CONTRIBUTING.md`, text: 'CONTRIBUTING.md' },
              ' has the details and the checks to run before you open a pull request.',
            ],
          },
        ],
      },
      {
        id: 'privacy-promise',
        title: 'What Ledger sends',
        blocks: [
          {
            kind: 'p',
            text: [
              'Ledger never uploads your statements or the values you enter. The only thing it sends is usage details: which page and tool is used, a random session ID and the message of a crash. Every change has to keep it that way and must not add personal information or entered values to what is sent. Never post your own statements, account numbers or ',
              { code: 'ledger-data.json' },
              ' in an issue or a pull request. Use the sample data instead.',
            ],
          },
        ],
      },
      {
        id: 'report-security',
        title: 'Report a security problem',
        blocks: [
          {
            kind: 'p',
            text: [
              'Please do not open a public issue. Email itstoyboxlabs@gmail.com with what you found and how to reproduce it, as ',
              { href: `${GITHUB_URL}/blob/main/SECURITY.md`, text: 'SECURITY.md' },
              ' describes. You will hear back within a few days.',
            ],
          },
        ],
      },
      {
        id: 'give-feedback',
        title: 'Give feedback',
        blocks: [
          {
            kind: 'p',
            text: [
              'Ideas, bugs and questions are welcome as an ',
              { href: `${GITHUB_URL}/issues`, text: 'issue on GitHub' },
              '. For anything big, open an issue first so we can agree on the idea before you spend time building it.',
            ],
          },
        ],
      },
    ],
  },
]
