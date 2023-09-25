import { suite } from "uvu";
import * as assert from "uvu/assert";

import { cutToNDecimalPlaces } from "./number";

const CutToNDecimalPlaces = suite("cutToNDecimalPlaces()");

CutToNDecimalPlaces("cutOff truncates decimal places correctly", () => {
  const result = cutToNDecimalPlaces(3.9999, 2);
  assert.is(result, 3.99);
});

CutToNDecimalPlaces("cutOff can change amount of decimals returned", () => {
  const result = cutToNDecimalPlaces(3.12, 1);
  assert.is(result, 3.1);
});

CutToNDecimalPlaces(
  "cutOff preserves decimal values with the desired number of decimal places correctly",
  () => {
    const result = cutToNDecimalPlaces(100, 2);
    assert.is(result, 100);
  },
);

CutToNDecimalPlaces(
  "cutOff cuts off decimal places and removes trailing zeros correctly",
  () => {
    const result = cutToNDecimalPlaces(3.0001, 2);
    assert.is(result, 3);
  },
);

CutToNDecimalPlaces.run();
