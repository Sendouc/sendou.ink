update
  "User"
set
  "patronTier" = null,
  "patronSince" = null,
  "patronTill" = null
where
  "patronTill" < @now;
