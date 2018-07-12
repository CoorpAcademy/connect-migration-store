module.exports = function(session) {
  const Store = session.Store;
  function MigrationStore(options) {
    // §TODO ensure from and to store are present
    this.fromStore = options.from;
    this.toStore = options.to;
    Store.call(this, options);
  }

  // Inherit from `Store`
  MigrationStore.prototype.__proto__ = Store.prototype;

  MigrationStore.prototype.get = function(sid, cb) {
    this.toStore.get(sid, (err, res) => {
      if (err) return cb(err);
      if (res) return cb(null, res);
      this.fromStore.get(sid, cb);
    });
  };

  MigrationStore.prototype.set = function(sid, sess, cb) {
    this.toStore.set(sid, sess, cb);
  };

  MigrationStore.prototype.destroy = function(sid, cb) {
    this.toStore.destroy(sid, err => {
      if (err) return cb(err);
      this.fromStore.destroy(sid, cb);
    });
  };

  return MigrationStore;
};
