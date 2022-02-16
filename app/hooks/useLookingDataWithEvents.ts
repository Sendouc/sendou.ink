import clone from "just-clone";
import * as React from "react";
import { useLoaderData, useNavigate } from "remix";
import type { GroupLikeData } from "server/events";
import { useEvents } from "~/hooks/common";
import { LookingLoaderData } from "~/routes/play/looking";

export function useLookingDataWithEvents(): LookingLoaderData {
  const navigate = useNavigate();
  const data = useLoaderData<LookingLoaderData>();
  const [dataWithEvents, setDataWithEvents] = React.useState(data);
  useEvents({ type: "likes", groupId: data.ownGroup.id }, (data: unknown) => {
    const typedData = data as GroupLikeData;

    console.log({ typedData });

    switch (typedData.action) {
      case "LIKE": {
        const group = dataWithEvents.neutralGroups.find(
          (g) => g.id === typedData.groupId
        );
        const newa = clone(dataWithEvents);
        newa.neutralGroups = newa.neutralGroups.filter(
          (g) => g.id !== group?.id
        );
        newa.likerGroups.push(group!);
        setDataWithEvents(newa);
        break;
      }
      case "UNLIKE": {
        break;
      }
      case "MATCH_UP": {
        navigate(`/play/match/${typedData.matchId}`);
        break;
      }
      case "UNITE_GROUPS": {
        // Reload so the loader kicks in and we fetch new batch of groups
        window.location.reload();
        break;
      }
    }
  });

  return dataWithEvents;
}
