const test = require('ava');
const AWS = require('aws-sdk');
const Bromise = require('bluebird');
const session = require('express-session');
const DynamoDbStore = require('connect-dynamodb')({session});
const RedisStore = require('connect-redis')(session);
const MigrationStore = require('../src/migration-store')(session);

const makeDynamoDbStore = () => {
  const client = new AWS.DynamoDB({
    endpoint: new AWS.Endpoint('http://localhost:8000'),
    region: 'eu-west-4'
  });
  return new DynamoDbStore({client, table: 'migration-session-test'});
};
const makeRedisStore = () => new RedisStore();

test.beforeEach(t => {
  t.context.from = makeRedisStore();
  t.context.to = makeDynamoDbStore();
});
test.afterEach.always(async t => {
  await Bromise.fromCallback(cb => t.context.from.destroy('42'));
  await Bromise.fromCallback(cb => t.context.to.destroy('42'));
});

test('should be created and substore accessible', t => {
  const store = new MigrationStore({
    from: t.context.from,
    to: t.context.to
  });
  t.true(store instanceof MigrationStore);
  t.true(store.fromStore instanceof RedisStore);
  t.true(store.toStore instanceof DynamoDbStore);
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
