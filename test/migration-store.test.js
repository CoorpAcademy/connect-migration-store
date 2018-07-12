const test = require('ava');
const session = require('express-session');
const MigrationStore = require('../src/migration-store')(session);

test('should be created and substore accessible', t => {
  const store = new MigrationStore({
    from: 12,
    to: 42
  });
  t.true(store instanceof MigrationStore);
  t.is(12, store.fromStore);
  t.is(42, store.toStore);
});
