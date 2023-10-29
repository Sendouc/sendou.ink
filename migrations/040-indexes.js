module.exports.up = function (db) {
  db.transaction(() => {
    db.prepare(
      /* sql */ `create index user_patron_tier on "User"("patronTier")`,
    ).run();
  })();
};
