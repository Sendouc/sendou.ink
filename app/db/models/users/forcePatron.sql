update
  User
set
  "patronTier" = @patronTier,
  "patronSince" = @patronSince,
  "patronTill" = @patronTill
where
  "id" = @id;
