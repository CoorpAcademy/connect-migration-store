connect-migration-store
=======================

[![npm](https://img.shields.io/npm/v/connect-migration-store.svg)](https://github.com/CoorpAcademy/connect-migration-store)
[![Build Status](https://travis-ci.org/CoorpAcademy/connect-migration-store.svg?branch=master)](https://travis-ci.org/CoorpAcademy/connect-migration-store)
[![codecov](https://codecov.io/gh/CoorpAcademy/connect-migration-store/branch/master/graph/badge.svg)](https://codecov.io/gh/CoorpAcademy/connect-migration-store)

> Connect Migration Store for express

This lib is here to help you migrate from an existing session store to another.

## Installation

Project can be found on npm, and installed with a classic

```sh
  npm install --save connect-migration-store
```

## Usage
To use migration store, you need to instantiate your the migration store with two store:
the original one you want to migrate from, and the new one you want to migrate to.
Then you can feed it to the session express middleware.

Here is below an example migrating from *redis* to *dynamodb*.

```js
const express = require('express');
const session = require('express-session');
const DynamoDBStore = require('connect-dynamodb')({session});
const RedisStore = require('connect-redis')(session);
const RedisStore = require('connect-redis')(session);
const MigrationStore = require('connect-migration-store')(session);

// Store creation
const originalStore = new RedisStore({url: 'some-redis-url'});
const newStore = new DynamoDBStore({table: 'some-dynamodb-table'});
const migrationStore = new MigrationStore({from: originalStore, to: newStore})

// instiate app with express then load session middleware with migration store
const app = express();
app.use(session({store: migrationStore, secret: '42'});
// and do what you need with your server
```

Then deploy, let it in place for few days, the duration of your migration,
then you can remove it and replace it with the new store.
Your migration is now complete :wink:

## License and Contributing

Licence is MIT. If there is a feature you want to add, or bug you want to report,
just open an issue, or fork and submit a PR.
