const test = require('ava');
const Bromise = require('bluebird');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const MigrationStore = require('../src/migration-store')(session);

test.beforeEach(t => {
  t.context.from = new MemoryStore();
  t.context.to = new MemoryStore();
});

test('should be created and substore accessible', t => {
  const store = new MigrationStore({
    from: t.context.from,
    to: t.context.to
  });
  t.true(store instanceof MigrationStore);
  t.true(store.fromStore instanceof MemoryStore);
  t.true(store.toStore instanceof MemoryStore);
});

test('should not be created with invalid arguments', t => {
  t.throws(
    () =>
      new MigrationStore({
        from: t.context.from
      })
  );
  t.throws(
    () =>
      new MigrationStore({
        from: 3,
        to: 'to'
      })
  );
});

test('should get session from "to" if defined', async t => {
  const store = new MigrationStore({from: t.context.from, to: t.context.to});
  await Bromise.fromCallback(cb =>
    t.context.to.set('42', {cookie: {maxAge: 2000}, name: 'dynamodbStore'}, cb)
  );
  const sess = await Bromise.fromCallback(cb => store.get('42', cb));
  t.deepEqual(sess, {cookie: {maxAge: 2000}, name: 'dynamodbStore'});
});

test('should get session from "from" if not defined in "to"', async t => {
  const store = new MigrationStore({from: t.context.from, to: t.context.to});
  await Bromise.fromCallback(cb =>
    t.context.from.set('42', {cookie: {maxAge: 2000}, name: 'redisStore'}, cb)
  );
  const sess = await Bromise.fromCallback(cb => store.get('42', cb));
  t.deepEqual(sess, {cookie: {maxAge: 2000}, name: 'redisStore'});
});

test('should get session from "from" if not defined in "to" and set back session in "to"', async t => {
  const store = new MigrationStore({from: t.context.from, to: t.context.to});
  await Bromise.fromCallback(cb =>
    t.context.from.set('42', {cookie: {maxAge: 2000}, name: 'redisStore'}, cb)
  );
  const sess = await Bromise.fromCallback(cb => store.get('42', cb));
  t.deepEqual(sess, {cookie: {maxAge: 2000}, name: 'redisStore'});
  const newSess = await Bromise.fromCallback(cb => store.toStore.get('42', cb));
  t.deepEqual(newSess, {cookie: {maxAge: 2000}, name: 'redisStore'});
});

test('should set session in "to"', async t => {
  const store = new MigrationStore({from: t.context.from, to: t.context.to});
  await Bromise.fromCallback(cb =>
    store.set('42', {cookie: {maxAge: 2000}, name: 'migration'}, cb)
  );
  const sess = await Bromise.fromCallback(cb => store.toStore.get('42', cb));
  t.deepEqual(sess, {cookie: {maxAge: 2000}, name: 'migration'});
});

test('should destroy session in "to" and "from', async t => {
  const store = new MigrationStore({from: t.context.from, to: t.context.to});
  await Bromise.fromCallback(cb =>
    store.fromStore.set('42', {cookie: {maxAge: 2000}, name: 'tobedestroyed'}, cb)
  );
  await Bromise.fromCallback(cb =>
    store.toStore.set('42', {cookie: {maxAge: 2002}, name: 'tobedestroyed'}, cb)
  );
  await Bromise.fromCallback(cb => store.destroy('42', cb));
  const sess = await Bromise.fromCallback(cb => store.toStore.get('42', cb));
  t.is(sess, undefined);
});
