import * as React from "react";
import { RadioGroup } from "@headlessui/react";
import { layoutIcon } from "~/utils";
import clsx from "clsx";

const OPTIONS = [
  {
    type: "VERSUS-RANKED",
    image: "rotations",
    text: "Versus",
    explanation: "Private Battle (ranked)",
  },
  {
    type: "VERSUS-UNRANKED",
    image: "rotations",
    text: "Versus",
    explanation: "Private Battle (unranked)",
  },
  {
    type: "TWIN",
    image: "rotations",
    text: "Twin",
    explanation: "League Battle",
  },
  {
    type: "QUAD",
    image: "rotations",
    text: "Quad",
    explanation: "League Battle",
  },
];

export function LFGGroupSelector() {
  const [type, setType] = React.useState("VERSUS-RANKED");

  return (
    <>
      <input type="hidden" name="type" value={type} />
      <RadioGroup
        className="play__type-radio-group"
        value={type}
        onChange={setType}
      >
        {OPTIONS.map((option, i) => {
          return (
            <RadioGroup.Option key={i} value={option.type}>
              {({ checked }) => (
                <div
                  className={clsx("play__type-radio-group__item", { checked })}
                >
                  <label className="play__type-radio-group__label">
                    {option.text}
                    <span
                      className={clsx(
                        "play__type-radio-group__label__explanation",
                        { checked }
                      )}
                    >
                      {option.explanation}
                    </span>
                  </label>
                  <img
                    className={clsx("play__type-radio-group__image", {
                      checked,
                    })}
                    src={layoutIcon(option.image)}
                  />
                </div>
              )}
            </RadioGroup.Option>
          );
        })}
      </RadioGroup>
    </>
  );
}
