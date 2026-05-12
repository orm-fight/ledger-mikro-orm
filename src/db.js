'use strict';

const { MikroORM } = require('@mikro-orm/sqlite');
const { Account, JournalEntry } = require('./entities');

async function open(filename = ':memory:') {
  return MikroORM.init({
    entities: [Account, JournalEntry],
    dbName: filename,
    debug: false,
    discovery: { warnWhenNoEntities: false },
  });
}

async function init(orm) {
  await orm.schema.createSchema();
}

module.exports = { open, init };
