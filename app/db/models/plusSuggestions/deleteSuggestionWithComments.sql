delete from
  "PlusSuggestion"
where
  "month" = @month
  and "year" = @year
  and "suggestedId" = @suggestedId
  and "tier" = @tier