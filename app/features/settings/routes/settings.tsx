import { Main } from "~/components/Main";
import { useIsMounted } from "~/hooks/useIsMounted";
import * as React from "react";
import { soundCodeToLocalStorageKey } from "~/features/chat/chat-utils";

export default function SettingsPage() {
  const isMounted = useIsMounted();

  return (
    <Main>
      <h2>Settings</h2>
      {isMounted ? <Sounds /> : null}
    </Main>
  );
}

const sounds = [
  {
    code: "sq_like",
    name: "SendouQ like received",
  },
  {
    code: "sq_new-group",
    name: "SendouQ group new members",
  },
  {
    code: "sq_match",
    name: "SendouQ match started",
  },
];

function Sounds() {
  // default to true
  const currentValue = (code: string) =>
    !localStorage.getItem(soundCodeToLocalStorageKey(code)) ||
    localStorage.getItem(soundCodeToLocalStorageKey(code)) === "true";

  const [soundValues, setSoundValues] = React.useState(
    Object.fromEntries(
      sounds.map((sound) => [sound.code, currentValue(sound.code)]),
    ),
  );

  // toggle in local storage
  const toggleSound = (code: string) => {
    localStorage.setItem(
      soundCodeToLocalStorageKey(code),
      String(!currentValue(code)),
    );
    setSoundValues((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  return (
    <div>
      <h3 className="text-lighter">Sounds</h3>
      {sounds.map((sound) => (
        <div key={sound.code}>
          <label className="stack horizontal xs items-center">
            <input
              type="checkbox"
              checked={soundValues[sound.code]}
              onChange={() => toggleSound(sound.code)}
            />
            {sound.name}
          </label>
        </div>
      ))}
    </div>
  );
}
