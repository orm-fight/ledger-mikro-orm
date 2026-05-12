'use strict';

const { Account, JournalEntry } = require('./entities');
const { balance } = require('./utils');

async function createAccount(orm, { name, type }) {
  const em = orm.em.fork();
  em.create(Account, { name, type });
  await em.flush();
}

async function postEntry(orm, { description, debit, credit, amount, date }) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(`amount must be a positive integer (got ${amount})`);
  }

  const em = orm.em.fork();
  const entry = em.create(JournalEntry, {
    description,
    account_debit: debit,
    account_credit: credit,
    amount,
    date,
  });
  await em.flush();
  return entry.id;
}

async function getBalance(orm, accountName) {
  const em = orm.em.fork();
  const account = await em.findOne(Account, { name: accountName });
  if (!account) throw new Error(`unknown account: ${accountName}`);

  const [totals] = await em.getConnection().execute(
    `SELECT
       COALESCE(SUM(CASE WHEN account_debit  = ? THEN amount END), 0) AS debit_total,
       COALESCE(SUM(CASE WHEN account_credit = ? THEN amount END), 0) AS credit_total
     FROM journal_entries`,
    [accountName, accountName]
  );

  return balance({
    type: account.type,
    debit_total: Number(totals.debit_total),
    credit_total: Number(totals.credit_total),
  });
}

async function trialBalance(orm) {
  const em = orm.em.fork();
  const rows = await em.getConnection().execute(`
    SELECT a.name, a.type,
           COALESCE(SUM(CASE WHEN e.account_debit  = a.name THEN e.amount END), 0) AS debit_total,
           COALESCE(SUM(CASE WHEN e.account_credit = a.name THEN e.amount END), 0) AS credit_total
    FROM accounts a
    LEFT JOIN journal_entries e
      ON e.account_debit = a.name OR e.account_credit = a.name
    GROUP BY a.name, a.type
    ORDER BY a.name
  `);
  return rows.map((totals) => ({
    account: totals.name,
    type: totals.type,
    balance: balance({
      type: totals.type,
      debit_total: Number(totals.debit_total),
      credit_total: Number(totals.credit_total),
    }),
  }));
}

module.exports = { createAccount, postEntry, getBalance, trialBalance };
