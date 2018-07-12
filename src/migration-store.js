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

  return MigrationStore;
};
