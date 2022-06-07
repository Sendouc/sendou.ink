- /plus
  -> Shows if you are suggested or not
- CRUD suggestions for your own tier and below
- CUD disabled when voting is active

- /plus/voting

## Voting is active

-> If not member just show same view as when voting is not active

- When voting the progress is saved in your browser so even if you leave the page you can continue where you left off.
- +1/-1 regardless of region

## Voting is not active

- You will see who passed the last voting and who didn't.
- If you didn't pass the voting and you were a suggestion then you will see your own percentage
  - others see who passed and who didn't per tier
  - at the top show your own results in green/red per tier

## Tables

- "User"

* "plusTier" 1/2/3

- "PlusSuggestion"

* "text" text
* "authorId" text
* "suggestedId" text
* "month"
* "year"
* "tier" 1/2/3
* "createdAt"

- "PlusVote"

* "month"
* "year"
* "tier"
* "authorId"
* "votedId"
* "score"

unique on month, year, authorId, votedId

# Cypress

- uses different db file
- uses different port
- NODE_ENV = test
