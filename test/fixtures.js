'use strict';

const { open, init } = require('../src/db');

async function createFixture() {
  const orm = await open(':memory:');
  await init(orm);
  return {
    db: orm,
    cleanup: () => orm.close(),
  };
}

module.exports = { createFixture };
