delete from
  "PlusSuggestion"
where
  "suggestedId" = @suggestedId
  and "tier" = @tier
  and "month" = @month
  and "year" = @year