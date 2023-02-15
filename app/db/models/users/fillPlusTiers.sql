insert into
  "PlusTier" ("userId", "tier")
select
  "userId",
  "tier"
from
  "FreshPlusTier"
where
  "tier" is not null
