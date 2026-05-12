# ledger-mikro-orm

A minimal double-entry bookkeeping ledger, persisted in SQLite via [MikroORM](https://mikro-orm.io/), using its `@mikro-orm/sqlite` driver.

The whole repo exists to make one thing legible: the *Transaction Example* from the Wikipedia article on [Double-entry bookkeeping](https://en.wikipedia.org/wiki/Double-entry_bookkeeping#Transaction_Example). If you can read the test file and follow what the ledger does, the repo has done its job.

## The scenario

Four accounts, four journal entries, one final state.

| # | Narrative | Debit | Credit | Amount |
|---|---|---|---|---|
| 1 | Buy inventory on credit | Inventory | Liabilities | 10 000 |
| 2a | Sell inventory for cash | Cash | Equity | 15 000 |
| 2b | Recognize relief of inventory | Equity | Inventory | 10 000 |
| 3 | Pay the vendor | Liabilities | Cash | 10 000 |

Final balances: **Cash = 5 000**, **Equity = 5 000**, Inventory = 0, Liabilities = 0.

## Core rules

Every journal entry names **exactly one debit account and one credit account** with the same amount — the schema enforces this (one row per entry, two FK columns). That makes `Σ debits == Σ credits` structurally true across the whole ledger; it can't drift.

The two remaining checks are:

1. `amount > 0`.
2. Every referenced account exists.

That's it. No periods, no audit trail, no VAT, no multi-currency, no reversal, no split entries. See the [orm-fight hub](https://github.com/orm-fight) for the GoB-compliant superset design.

## Running

```
npm install
npm test
```

Tests run on an in-memory SQLite database — nothing is written to disk.

## Why MikroORM (and why EntitySchema, not decorators)

MikroORM brings Doctrine/Hibernate concepts (Data Mapper, Unit of Work, Identity Map) to the Node world. Its docs lead with decorators; this repo uses the `EntitySchema` form so the code stays plain JavaScript and the entity declarations read like data.

Each store operation runs on a fresh `em.fork()` to keep Identity Map state isolated between operations — that mirrors how MikroORM is typically used in request-scoped server code.

## Units

Amounts are stored as **integer dollars** to keep the tests readable (`10000` means $10,000).

## Siblings

This is one repo in the [orm-fight](https://github.com/orm-fight) series.

- [`ledger-mikro-orm`](https://github.com/orm-fight/ledger-mikro-orm) (this repo) — MikroORM (EntitySchema, no decorators)
- Other ORMs: [`ledger-prisma`](https://github.com/orm-fight/ledger-prisma), [`ledger-drizzle`](https://github.com/orm-fight/ledger-drizzle), [`ledger-sequelize`](https://github.com/orm-fight/ledger-sequelize), [`ledger-objection`](https://github.com/orm-fight/ledger-objection), [`ledger-typeorm`](https://github.com/orm-fight/ledger-typeorm)
- Query builder: [`ledger-kysely`](https://github.com/orm-fight/ledger-kysely)
- No-ORM baselines: [`ledger-sqlite3`](https://github.com/orm-fight/ledger-sqlite3), [`ledger-better-sqlite3`](https://github.com/orm-fight/ledger-better-sqlite3), [`ledger-node-sqlite`](https://github.com/orm-fight/ledger-node-sqlite)
