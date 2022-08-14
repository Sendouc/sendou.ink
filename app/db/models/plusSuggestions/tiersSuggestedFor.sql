select
  json_group_array("tier")
from
  (
    select
      distinct "tier"
    from
      "PlusSuggestion"
    where
      "month" = @month
      and "year" = @year
      and "suggestedId" = @userId
    order by
      "tier" asc
  )