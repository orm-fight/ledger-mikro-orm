'use strict';

const { EntitySchema } = require('@mikro-orm/core');

const Account = new EntitySchema({
  name: 'Account',
  tableName: 'accounts',
  properties: {
    name: { type: 'string', primary: true },
    type: { type: 'string' },
  },
});

const JournalEntry = new EntitySchema({
  name: 'JournalEntry',
  tableName: 'journal_entries',
  properties: {
    id: { type: 'number', primary: true, autoincrement: true },
    description: { type: 'string' },
    account_debit: {
      kind: 'm:1',
      entity: 'Account',
      fieldName: 'account_debit',
      referenceColumnName: 'name',
    },
    account_credit: {
      kind: 'm:1',
      entity: 'Account',
      fieldName: 'account_credit',
      referenceColumnName: 'name',
    },
    amount: { type: 'number' },
    date: { type: 'string' },
  },
});

module.exports = { Account, JournalEntry };
