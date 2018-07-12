const test = require('ava');
const AWS = require('aws-sdk')
const session = require('express-session');
const DynamoDbStore = require('connect-dynamodb')({session})
const RedisStore = require('connect-redis')(session)
const MigrationStore = require('../src/migration-store')(session);

const makeDynamoDbStore = () => {
  const client = new AWS.DynamoDB({
    endpoint: new AWS.Endpoint('http://localhost:8000'),
    region: 'eu-west-4'
  });
  return new DynamoDbStore({client, table: 'migration-session-test'});
};
const makeRedisStore = () => new RedisStore();

test('should be created and substore accessible', t => {
  const store = new MigrationStore({
    from: makeRedisStore(),
    to: makeDynamoDbStore()
  });
  t.true(store instanceof MigrationStore);
  t.true(store.fromStore instanceof RedisStore);
  t.true(store.toStore instanceof DynamoDbStore);
});
