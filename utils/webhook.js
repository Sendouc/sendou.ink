const webhook = require("webhook-discord")

function sendFAPostToDiscord(args) {
  const Hook = new webhook.Webhook(process.env.FA_WEBHOOK_URL)

  const msg = new webhook.MessageBuilder()
    .setName(args.user.username)
    .setColor("#2c5364")
    .addField("", `<@${args.user.discord_id}>`)

  if (args.can_vc) {
    const can_vc = args.can_vc.toLowerCase()
    msg.addField("Voice Chat", can_vc[0].toUpperCase() + can_vc.slice(1))
  }

  if (args.playstyles) {
    msg.addField(
      "Playstyle",
      args.playstyles.map(playstyle => playstyle.toLowerCase()).join(", ")
    )
  }

  if (args.user.weapons) {
    msg.addField("Weapons", args.user.weapons.join(", "))
  }

  if (args.past_experience) {
    msg.addField("Past experience", args.past_experience)
  }

  if (args.activity) {
    msg.addField("Activity", args.activity)
  }

  if (args.looking_for) {
    msg.addField("Looking for", args.looking_for)
  }

  if (args.description) {
    msg.addField("Description", args.description)
  }

  if (args.user.twitter_name) {
    msg.setAvatar(`https://avatars.io/twitter/${args.user.twitter_name}`)
  }

  if (args.user.country) {
    msg.setText(
      `:flag_${args.user.country}:${args.user.top500 &&
        " <:top500:594551830764191763>"}`
    )
  }

  return Hook.send(msg)
}

module.exports = sendFAPostToDiscord
