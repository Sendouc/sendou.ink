// this is a pretty random solution but basically some strings in /lists I want in the messages.po file and not game.po as they need to be
// manually translated so I use this file to make it so

import { t } from "@lingui/macro";

const translateThese = [
  t`Shooters`,
  t`Blasters`,
  t`Rollers`,
  t`Brushes`,
  t`Chargers`,
  t`Sloshers`,
  t`Splatlings`,
  t`Dualies`,
  t`Brellas`,
];
