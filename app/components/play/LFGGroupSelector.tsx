import * as React from "react";
import { RadioGroup } from "@headlessui/react";
import { layoutIcon } from "~/utils";
import clsx from "clsx";
import { PlayFrontPageLoader } from "~/routes/play/index";
import { UsersIcon } from "../icons/Users";

const OPTIONS = [
  {
    type: "VERSUS-RANKED",
    image: "rotations",
    text: "Versus",
    explanation: "Ranked",
  },
  {
    type: "VERSUS-UNRANKED",
    image: "rotations",
    text: "Versus",
    explanation: "Scrim",
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
] as const;

type Type = "VERSUS-RANKED" | "VERSUS-UNRANKED" | "TWIN" | "QUAD";

export function LFGGroupSelector({
  counts,
}: {
  counts: PlayFrontPageLoader["counts"];
}) {
  const [selectedType, setSelectedType] = React.useState<Type>("VERSUS-RANKED");

  const count = (
    type: "VERSUS-RANKED" | "VERSUS-UNRANKED" | "TWIN" | "QUAD"
  ) => {
    switch (type) {
      case "VERSUS-RANKED":
      case "VERSUS-UNRANKED":
        return counts["VERSUS"];
      case "QUAD":
        return counts["QUAD"];
      case "TWIN":
        return counts["TWIN"];
    }
  };

  return (
    <>
      <input type="hidden" name="type" value={selectedType} />
      <RadioGroup
        className="play__type-radio-group"
        value={selectedType}
        onChange={setSelectedType}
      >
        {OPTIONS.map((option, i) => {
          return (
            <RadioGroup.Option
              key={i}
              className={clsx({ "mt-3": i > 1 })}
              value={option.type}
            >
              {({ checked }) => (
                <div
                  className={clsx("play__type-radio-group__item", {
                    checked,
                    "top-half": i === 0,
                    "bottom-half": i === 1,
                  })}
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
                    <span
                      className={clsx("play__type-radio-group__label__count", {
                        checked,
                        "scooted-over": i === 0,
                        invisible: i === 1,
                      })}
                    >
                      <UsersIcon className="play__type-radio-group__label__icon" />
                      <span
                        className={clsx("z-10", {
                          "play__forced-black-number":
                            option.type === "VERSUS-RANKED" &&
                            selectedType === "VERSUS-UNRANKED",
                          "play__forced-white-number":
                            option.type === "VERSUS-RANKED" &&
                            selectedType === "VERSUS-RANKED",
                        })}
                      >
                        {count(option.type)}
                      </span>
                    </span>
                  </label>
                  {/* TODO: remove */}
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
