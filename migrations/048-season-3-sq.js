module.exports.up = function (db) {
  db.transaction(() => {
    db.prepare(/* sql */ `update "User" set "mapModePreferences" = null`).run();
  })();
};
