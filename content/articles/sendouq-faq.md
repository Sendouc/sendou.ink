---
title: SendouQ FAQ
date: 2023-09-28
author: Joy
---

## What is SendouQ?

SendouQ is a third-party matchmaking service for Splatoon 3, offering a more competitive alternative to the in-game matchmaking. Matches are conducted in a first-to-4 format, with maps and modes selected by the players. The service is free and open to all players.

## How do I use SendouQ?

Begin by logging in to [sendou.ink](https://sendou.ink) and setting up your profile. Access SendouQ via [https://sendou.ink/q](https://sendou.ink/q). Upon entry, select your placement; if unsure, pick lower—the system will adjust your placement based on performance. Specify your game mode preference and map selection. Once set, join the queue. For more details, view the [feature showcase](https://www.youtube.com/watch?v=XIRNcTFDYzA).

## Why can't I see my rank?

Ranks are assigned after completing 7 sets.

## Why can't I see my rank history?

Rank history becomes available once you've played 7 sets, provided three server days have elapsed since your first set.

## Both teams misreported the score. What do I do?

Currently, misreported scores cannot be corrected. A score is accepted if reported identically by both teams. Verify the score before submission to avoid this issue.

## Why do I have more points than my opponent but I'm ranked lower?

Rank updates aren't real-time. Allow a few minutes for the server to update, then check your rank again.

## I won a set but my rank didn't go up. Why?

Ranking points are influenced by the relative team skills. High-ranked teams gain fewer points defeating lower-ranked teams, reflecting the expected outcome. To earn more points, compete against similarly or higher-ranked teams.

## I won a set but my rank went down. Why?

SendouQ employs [openskill.js](https://github.com/philihp/openskill.js) for rank calculations. Though widely utilized and accurate, its behavior may occasionally seem counterintuitive. In rare instances, you might lose points on a win or gain points on a loss, albeit with small changes. You can reduce how often this can happen by competing against similarly ranked teams. For an elementary understanding, refer to the [openskill.py documentation](https://openskill.me/en/stable/manual.html). For deeper insight, the [whitepaper](https://www.csie.ntu.edu.tw/~cjlin/papers/online_ranking/online_journal.pdf) is available, though it requires a strong grasp of Bayesian statistics, equivalent to upper-undergraduate level math.

## What if the FAQ doesn't answer my question?

Join the [sendou.ink Discord server](https://discord.gg/sendou) and ask in the #helpdesk channel.
