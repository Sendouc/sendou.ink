import {
  json,
  Link,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  useLoaderData,
} from "remix";
import { LeaderboardEntry } from "~/core/mmr/leaderboards";
import styles from "~/styles/leaderboard.css";
import { makeTitle } from "~/utils";
import { playerMatchHistoryPage } from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Leaderboards"),
  };
};

export type LookingLoaderDataGroup = {
  players: LeaderboardEntry[];
};

export const loader: LoaderFunction = () => {
  // TODO: dynamic
  //const skills = await Skill.findAllByMonth({ month: 3, year: 2022 });
  // return json<LookingLoaderDataGroup>({ players: skillsToLeaderboard(skills) });
  return json<LookingLoaderDataGroup>(hardcodedLeaderboard());
};

export default function LeaderboardsPage() {
  const data = useLoaderData<LookingLoaderDataGroup>();

  let placementToRender = 1;
  let lastMMR = 0;
  return (
    <div className="leaderboard__container">
      <h1 className="leaderboard__title">March 2022 SP Leaderboard</h1>
      <table className="leaderboard__table">
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th className="leaderboard__table-header-cell">Peak SP</th>
            <th className="leaderboard__table-header-cell">Sets</th>
          </tr>
        </thead>
        <tbody>
          {data.players.map((p, i) => {
            if (p.MMR !== lastMMR) {
              lastMMR = p.MMR;
              placementToRender = i + 1;
            }

            return (
              <tr key={p.user.id} className="leaderboard__table__row">
                <td>{placementToRender}</td>
                <td>
                  <Link to={playerMatchHistoryPage(p.user.id)}>
                    {p.user.discordName}
                  </Link>
                </td>
                <td className="leaderboard__table__small-text-cell">{p.MMR}</td>
                <td className="leaderboard__table__small-text-cell secondary">
                  {p.entries}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function hardcodedLeaderboard() {
  return {
    players: [
      {
        MMR: 1353.15,
        user: {
          discordName: "Elis",
          id: "3f3d10dc-ac32-409d-bf78-bd337204311a",
        },
        entries: 81,
      },
      {
        MMR: 1317.67,
        user: {
          discordName: "Thunder",
          id: "0119930f-55f7-415d-87e5-f7f1e652e0e6",
        },
        entries: 37,
      },
      {
        MMR: 1317,
        user: {
          discordName: "ωανε",
          id: "6343aa2e-2a83-4063-a052-ca5a81fc922c",
        },
        entries: 45,
      },
      {
        MMR: 1313.08,
        user: {
          discordName: "stalk",
          id: "308102d0-0430-4461-a7db-3723b9c97fce",
        },
        entries: 43,
      },
      {
        MMR: 1311.72,
        user: {
          discordName: "anger",
          id: "994ce9e6-bc2f-4bef-b62e-bcb878935d20",
        },
        entries: 42,
      },
      {
        MMR: 1298.7,
        user: {
          discordName: "home!",
          id: "a8fe89c9-e1be-4b2c-bc76-6ce274f89d13",
        },
        entries: 49,
      },
      {
        MMR: 1289.2,
        user: {
          discordName: "Wadsm",
          id: "d390e417-788b-48e2-b5bc-7ca562cee597",
        },
        entries: 54,
      },
      {
        MMR: 1288.23,
        user: {
          discordName: "Shak!",
          id: "50b50376-f2b2-47b8-9403-414f0bdd54f7",
        },
        entries: 33,
      },
      {
        MMR: 1286.89,
        user: {
          discordName: "IsabelT.J.",
          id: "3beb7b7c-319c-4f72-95a7-ae12b42835d7",
        },
        entries: 51,
      },
      {
        MMR: 1286.41,
        user: {
          discordName: "sighnaps",
          id: "40d0175f-1039-4405-b394-6be4e6672f0b",
        },
        entries: 33,
      },
      {
        MMR: 1285.53,
        user: {
          discordName: "phoenix",
          id: "a2c2e650-bc13-438f-8f15-99b4ef2399ed",
        },
        entries: 68,
      },
      {
        MMR: 1283.37,
        user: {
          discordName: "Dark!",
          id: "97d30fb8-db11-422b-94ac-1c63707b87ca",
        },
        entries: 75,
      },
      {
        MMR: 1274.96,
        user: {
          discordName: "jayy_sushi",
          id: "596ef771-1165-4232-85f9-cc0fa690b884",
        },
        entries: 68,
      },
      {
        MMR: 1274.27,
        user: {
          discordName: "Yng Obito",
          id: "673a4ed3-b4eb-4dab-9510-68f36b2bc750",
        },
        entries: 29,
      },
      {
        MMR: 1271.85,
        user: {
          discordName: "WMehdi",
          id: "c85300f6-af33-4698-a5fa-552fc9a1afc3",
        },
        entries: 73,
      },
      {
        MMR: 1268.9,
        user: {
          discordName: "zeke🌎🎯",
          id: "50ec7e14-d905-4fbe-943d-8cb0a28eafaa",
        },
        entries: 55,
      },
      {
        MMR: 1267.21,
        user: {
          discordName: "Alexx",
          id: "a5903ef9-2623-483a-94fb-083db546949e",
        },
        entries: 67,
      },
      {
        MMR: 1266.46,
        user: {
          discordName: ".q",
          id: "d7bffb8e-0bdf-4a91-9a8b-2f45b6c1a14a",
        },
        entries: 27,
      },
      {
        MMR: 1264.64,
        user: {
          discordName: "gos🦋",
          id: "cde2aadd-1c4d-49ce-8a93-cb49c5c38c27",
        },
        entries: 90,
      },
      {
        MMR: 1261.86,
        user: {
          discordName: "Trizy",
          id: "256e8e1d-cc9f-4fa7-8141-7036a5d946da",
        },
        entries: 41,
      },
      {
        MMR: 1260.74,
        user: {
          discordName: "Isaac",
          id: "3e9001df-a222-449d-bc03-dd121cb6aeb6",
        },
        entries: 67,
      },
      {
        MMR: 1260.66,
        user: {
          discordName: "n.",
          id: "ec9bbff2-ff1c-4ae3-ab1b-8e169619747f",
        },
        entries: 15,
      },
      {
        MMR: 1259.67,
        user: {
          discordName: "SMEXY LEGEND",
          id: "10edd2dd-7532-4c25-a60e-00373879f2ad",
        },
        entries: 43,
      },
      {
        MMR: 1257.27,
        user: {
          discordName: "axis",
          id: "ee652292-367d-4873-a2f0-7f0d9bef6923",
        },
        entries: 61,
      },
      {
        MMR: 1256.5,
        user: {
          discordName: "Leafiiii",
          id: "7d223b7e-d263-4560-a601-7e33cbfcf4aa",
        },
        entries: 31,
      },
      {
        MMR: 1250.55,
        user: {
          discordName: "2ƒяesн4γoυ",
          id: "f0d3b378-9ed7-461e-96cc-423282ffd939",
        },
        entries: 72,
      },
      {
        MMR: 1249.02,
        user: {
          discordName: "Heaven",
          id: "6e057559-ac77-41c3-901a-6aa028f0d5e1",
        },
        entries: 42,
      },
      {
        MMR: 1248.38,
        user: {
          discordName: "KyochaN",
          id: "f4a18836-0642-46a9-a78d-02c03c840777",
        },
        entries: 59,
      },
      {
        MMR: 1245.58,
        user: {
          discordName: "~Ulysse~",
          id: "2637d6f1-8058-41a4-8a6e-ce77ae36a4df",
        },
        entries: 34,
      },
      {
        MMR: 1243.14,
        user: {
          discordName: "PikminX",
          id: "6a32729e-f5b3-46fa-a12f-9fb15bb49b85",
        },
        entries: 29,
      },
      {
        MMR: 1240.48,
        user: {
          discordName: "boi_†",
          id: "b4d5bf5a-0baf-4a86-a823-d0d98b08477c",
        },
        entries: 50,
      },
      {
        MMR: 1240.2,
        user: {
          discordName: "Twig",
          id: "f73b2d03-ec2e-4fe1-9bcf-d5d45c289e6a",
        },
        entries: 23,
      },
      {
        MMR: 1238.14,
        user: {
          discordName: "ice",
          id: "8441036a-25ab-4139-87f1-8bd95173e600",
        },
        entries: 15,
      },
      {
        MMR: 1237.79,
        user: {
          discordName: "biscuit",
          id: "a43ad493-9951-4535-8804-9fdabb67b257",
        },
        entries: 23,
      },
      {
        MMR: 1236.81,
        user: {
          discordName: "senø",
          id: "2eeba6e4-5777-44bd-b5ae-d1b7068c6cdc",
        },
        entries: 24,
      },
      {
        MMR: 1236.65,
        user: {
          discordName: "Caden",
          id: "729e8fd0-6c3f-46b4-af12-2ded48b1ceb2",
        },
        entries: 24,
      },
      {
        MMR: 1236.45,
        user: {
          discordName: "Pelu",
          id: "f4f43d00-74fe-4603-beb8-eebfa9ef8ff3",
        },
        entries: 63,
      },
      {
        MMR: 1236.21,
        user: {
          discordName: "Azo",
          id: "7acf69b7-5980-4dfd-a149-357bc27d54ea",
        },
        entries: 34,
      },
      {
        MMR: 1235.2,
        user: {
          discordName: "Hyeon",
          id: "67bf2a2f-5090-4cab-ba64-d6afff96f27e",
        },
        entries: 70,
      },
      {
        MMR: 1234.81,
        user: {
          discordName: "Jay'",
          id: "cabd813b-13ee-4b51-a7be-bbeb0359b801",
        },
        entries: 45,
      },
      {
        MMR: 1233.54,
        user: {
          discordName: "ИX!",
          id: "bd2ae41f-9bcc-4de5-86ed-4a695019a43e",
        },
        entries: 14,
      },
      {
        MMR: 1232.39,
        user: {
          discordName: "SporeCloud",
          id: "35140557-0caf-4579-9183-9dfd2bd46a04",
        },
        entries: 36,
      },
      {
        MMR: 1230.93,
        user: {
          discordName: "Skyy",
          id: "75348499-53ec-4097-8fc9-977a6b37633d",
        },
        entries: 46,
      },
      {
        MMR: 1228.39,
        user: {
          discordName: "Chara",
          id: "e45eb016-3556-48a9-b7d9-ec83f2f8b659",
        },
        entries: 70,
      },
      {
        MMR: 1227.81,
        user: {
          discordName: "Luke",
          id: "30425669-1eeb-4183-a300-c48d45f0771d",
        },
        entries: 61,
      },
      {
        MMR: 1227.44,
        user: {
          discordName: "Eclipse",
          id: "a4ec3f7e-47ee-4c3a-91ee-3eb9d00fbcd2",
        },
        entries: 19,
      },
      {
        MMR: 1226.39,
        user: {
          discordName: "Shadowind",
          id: "81dcba64-0f6d-40a5-a36c-0153f7d3bab8",
        },
        entries: 61,
      },
      {
        MMR: 1223.38,
        user: {
          discordName: "Gettway🧃🍇🍒",
          id: "1c9845d1-be21-4e4f-9dbf-8414f7fbda16",
        },
        entries: 37,
      },
      {
        MMR: 1222.19,
        user: {
          discordName: "Volty",
          id: "5736ad3b-3f86-4aeb-830f-7e3403a85db5",
        },
        entries: 39,
      },
      {
        MMR: 1218.89,
        user: {
          discordName: "Exy",
          id: "da9d01b1-f3cf-4376-b132-7d615faffa13",
        },
        entries: 64,
      },
      {
        MMR: 1217.96,
        user: {
          discordName: "bran",
          id: "85339ded-0d69-41fa-9e03-ddf55b11e738",
        },
        entries: 21,
      },
      {
        MMR: 1217.08,
        user: {
          discordName: "Nepia",
          id: "e7102dc9-1ea0-4eea-8728-78772c0eb5eb",
        },
        entries: 56,
      },
      {
        MMR: 1214.15,
        user: {
          discordName: "ovayya",
          id: "3f95cfcf-6b9e-43fa-99e3-bab9c1a5017b",
        },
        entries: 36,
      },
      {
        MMR: 1213.28,
        user: {
          discordName: "Danish",
          id: "349f3f04-dd72-4e81-a2e7-f7bb8db6429e",
        },
        entries: 34,
      },
      {
        MMR: 1212.63,
        user: {
          discordName: "Bagel",
          id: "6ce34fea-7192-4f28-a290-653c0a410616",
        },
        entries: 12,
      },
      {
        MMR: 1212.43,
        user: {
          discordName: "Miner",
          id: "8a4b4738-17d4-44c5-b1bb-ea86d84fa9dd",
        },
        entries: 36,
      },
      {
        MMR: 1211.91,
        user: {
          discordName: "yoshi_",
          id: "80dee57b-884a-4c21-841e-a7eab15e6ea3",
        },
        entries: 68,
      },
      {
        MMR: 1211.45,
        user: {
          discordName: "Lex",
          id: "59c08ec3-5c5f-4437-a87c-dac2e7c26e7e",
        },
        entries: 84,
      },
      {
        MMR: 1210.48,
        user: {
          discordName: "tacko",
          id: "d4d01508-9c0f-43de-a284-4cd69568fc83",
        },
        entries: 57,
      },
      {
        MMR: 1209.68,
        user: {
          discordName: "Kelpdrew",
          id: "ccdd1dbb-a474-4e11-9011-41c1389101f7",
        },
        entries: 59,
      },
      {
        MMR: 1207.67,
        user: {
          discordName: "Toyoben",
          id: "25a1d3b1-9109-4d24-aa26-345dd12c1b31",
        },
        entries: 50,
      },
      {
        MMR: 1206.85,
        user: {
          discordName: "tommithy",
          id: "3ee8d2ab-977c-4d0a-bb92-feb451e4eaea",
        },
        entries: 42,
      },
      {
        MMR: 1206.85,
        user: {
          discordName: "Morphyy",
          id: "83df933d-1582-43a2-9cf2-e1baaebc9f01",
        },
        entries: 43,
      },
      {
        MMR: 1205.73,
        user: {
          discordName: "King 👑",
          id: "0962f135-9971-4ac8-8605-4460d073819f",
        },
        entries: 117,
      },
      {
        MMR: 1204.42,
        user: {
          discordName: "Smile",
          id: "d74c7718-217e-41dc-a133-75dc10f27513",
        },
        entries: 52,
      },
      {
        MMR: 1202.64,
        user: {
          discordName: "An☂o",
          id: "1db8a371-fb8f-44cb-8fc3-07e13726d075",
        },
        entries: 43,
      },
      {
        MMR: 1201.28,
        user: {
          discordName: "Lucaas",
          id: "29011558-8489-4b25-bc86-ae54cb3cbd84",
        },
        entries: 56,
      },
      {
        MMR: 1200.83,
        user: {
          discordName: "REDSPY",
          id: "ca619fcb-6997-4627-b688-148475dfb1ce",
        },
        entries: 69,
      },
      {
        MMR: 1199.32,
        user: {
          discordName: "samacado",
          id: "bbd280d9-f446-4740-9229-d84f11525a39",
        },
        entries: 15,
      },
      {
        MMR: 1198.67,
        user: {
          discordName: "Synphu",
          id: "4ed62368-faf1-42ed-baa4-73533f8da1c2",
        },
        entries: 63,
      },
      {
        MMR: 1197.67,
        user: {
          discordName: "prosper",
          id: "2340fd3a-e012-4ff3-9a22-52d2428090cf",
        },
        entries: 68,
      },
      {
        MMR: 1196.98,
        user: {
          discordName: "Mαx",
          id: "8bbca3c7-bc7a-4301-ae11-ee57ca1a3a0a",
        },
        entries: 62,
      },
      {
        MMR: 1195.75,
        user: {
          discordName: "Fantarrr",
          id: "2a60e946-7926-4eac-ad1c-3d8587ede50c",
        },
        entries: 94,
      },
      {
        MMR: 1194.99,
        user: {
          discordName: "Maxim",
          id: "e6d7f899-714a-4f14-99bd-68309a72d0f0",
        },
        entries: 44,
      },
      {
        MMR: 1194.58,
        user: {
          discordName: "Lorraine",
          id: "cc9af7ec-6a85-4a8e-a139-41eba3cc21ad",
        },
        entries: 37,
      },
      {
        MMR: 1193.63,
        user: {
          discordName: "Dafter",
          id: "04f3e8f9-20a4-41b1-91c8-78a6a8205536",
        },
        entries: 73,
      },
      {
        MMR: 1193.33,
        user: {
          discordName: "Orion",
          id: "b002243a-5d05-4778-a54d-2dbbdfdbdef9",
        },
        entries: 21,
      },
      {
        MMR: 1191.67,
        user: {
          discordName: "Kaldemar",
          id: "fd3eb46d-8459-4657-bbbc-66794064a004",
        },
        entries: 29,
      },
      {
        MMR: 1191.31,
        user: {
          discordName: "Berry",
          id: "68d07734-849e-4ecd-8e59-02c5a3e51056",
        },
        entries: 38,
      },
      {
        MMR: 1190.99,
        user: {
          discordName: "Channo",
          id: "e248151a-4d57-4349-a83d-39c0f70890d6",
        },
        entries: 46,
      },
      {
        MMR: 1190.59,
        user: {
          discordName: "kiwi",
          id: "2f577e28-3916-468e-a35c-60f4adbaee95",
        },
        entries: 27,
      },
      {
        MMR: 1189.43,
        user: {
          discordName: "Masked Bandit",
          id: "fddee4ef-657f-4e32-ab94-4559ceeb83eb",
        },
        entries: 38,
      },
      {
        MMR: 1188.25,
        user: {
          discordName: "SG√Gekkou",
          id: "6053a86b-1287-4990-ac22-2f370f3047a2",
        },
        entries: 16,
      },
      {
        MMR: 1187.5,
        user: {
          discordName: "3x  oreo",
          id: "a5bb7c55-a37c-4fde-bb3f-df2cf072cf56",
        },
        entries: 36,
      },
      {
        MMR: 1186.9,
        user: {
          discordName: "ふんど",
          id: "a11fc931-d3ba-49f6-a5a2-d065c18ae188",
        },
        entries: 29,
      },
      {
        MMR: 1186.32,
        user: {
          discordName: "OmarComing",
          id: "904677c7-59a7-4648-8db2-2b8cfda5a4ba",
        },
        entries: 43,
      },
      {
        MMR: 1185.07,
        user: {
          discordName: "Glash",
          id: "de72270f-9103-4320-b596-8bfa97532c48",
        },
        entries: 23,
      },
      {
        MMR: 1184.9,
        user: {
          discordName: "Gorah",
          id: "c76070d8-e0f8-4012-83ea-71e04a733dcd",
        },
        entries: 34,
      },
      {
        MMR: 1184.37,
        user: {
          discordName: "beanii🌺",
          id: "2142e166-1233-49e7-888e-0a755b04c415",
        },
        entries: 45,
      },
      {
        MMR: 1181.9,
        user: {
          discordName: "EchoTommi",
          id: "da1bda51-c38e-48da-b33b-7a6da6503f17",
        },
        entries: 54,
      },
      {
        MMR: 1181.77,
        user: {
          discordName: "berryy",
          id: "feec0fb8-4f97-4ea2-a99b-4501e72befbc",
        },
        entries: 33,
      },
      {
        MMR: 1181.51,
        user: {
          discordName: "storm",
          id: "56d9f6ae-fac4-4f82-ad75-112135269b17",
        },
        entries: 34,
      },
      {
        MMR: 1180.57,
        user: {
          discordName: "bishop",
          id: "4c93b5f6-e466-4319-b34f-f6e44e7fdeb1",
        },
        entries: 43,
      },
      {
        MMR: 1180.41,
        user: {
          discordName: "SlyMe",
          id: "9f08d025-f992-4384-b485-2b41bac1bc0d",
        },
        entries: 28,
      },
      {
        MMR: 1180.41,
        user: {
          discordName: "AtomicZebra",
          id: "cdfd70c8-bbb7-42e1-a96d-ac2806c07c12",
        },
        entries: 28,
      },
      {
        MMR: 1179.45,
        user: {
          discordName: "nova_",
          id: "31967aa9-1393-4b17-b04d-bf064134a1af",
        },
        entries: 49,
      },
      {
        MMR: 1179.33,
        user: {
          discordName: "Mewty",
          id: "423b2922-adf2-4087-af07-588c8223e97e",
        },
        entries: 51,
      },
      {
        MMR: 1178.36,
        user: {
          discordName: "Joshy",
          id: "5ec78260-382a-4369-a64e-144744b9f5a1",
        },
        entries: 31,
      },
      {
        MMR: 1177.87,
        user: {
          discordName: "Matchaaa",
          id: "fab91806-0d2d-4bde-bafa-9a8984535732",
        },
        entries: 101,
      },
      {
        MMR: 1177.76,
        user: {
          discordName: "NinjaTrain",
          id: "6232c37b-506b-4a56-ada2-8b81b497b7f6",
        },
        entries: 46,
      },
      {
        MMR: 1177.67,
        user: {
          discordName: "Lew",
          id: "57a7765c-2161-49cb-ab3e-55c1d25f1dac",
        },
        entries: 25,
      },
      {
        MMR: 1177.31,
        user: {
          discordName: "zero_rapid",
          id: "179c191d-d5dd-43db-be2f-264d2e907788",
        },
        entries: 38,
      },
      {
        MMR: 1176.15,
        user: {
          discordName: "plague doctor",
          id: "5ce1aa85-d914-4bdf-9f0e-7903f19be84e",
        },
        entries: 55,
      },
      {
        MMR: 1173.78,
        user: {
          discordName: "Half",
          id: "b37d1fe4-d54c-4a91-92f0-e4b1bc74c0f5",
        },
        entries: 36,
      },
      {
        MMR: 1172.97,
        user: {
          discordName: "Hilmar",
          id: "acd2ab8a-6d1f-4260-8d1c-fe256645c8ff",
        },
        entries: 28,
      },
      {
        MMR: 1172.36,
        user: {
          discordName: "Veloce",
          id: "0a274630-001d-4370-91b3-803739e4d36b",
        },
        entries: 48,
      },
      {
        MMR: 1171.65,
        user: {
          discordName: "buns",
          id: "9839abcc-e29b-4f27-935f-b2f7c3b21c46",
        },
        entries: 9,
      },
      {
        MMR: 1171.26,
        user: {
          discordName: "RhyThM",
          id: "e47dd20a-0d33-4f52-996d-6c32af3d397e",
        },
        entries: 81,
      },
      {
        MMR: 1170.87,
        user: {
          discordName: "soup",
          id: "5e6bc337-80d1-405f-8c96-f8a7cdc7173d",
        },
        entries: 25,
      },
      {
        MMR: 1169.98,
        user: {
          discordName: "Nikaido...",
          id: "0bdce89d-1531-47f1-b4e5-951902c111e6",
        },
        entries: 26,
      },
      {
        MMR: 1169.97,
        user: {
          discordName: "Kobayashi",
          id: "a34e70b1-74d9-423f-9638-f9a580b611c7",
        },
        entries: 83,
      },
      {
        MMR: 1169.87,
        user: {
          discordName: "eya",
          id: "b4efd420-5c6f-42fa-ab80-0936c6796256",
        },
        entries: 53,
      },
      {
        MMR: 1169.58,
        user: {
          discordName: "fillstan",
          id: "4ff098ba-dbe1-442b-b399-81ff146663ce",
        },
        entries: 29,
      },
      {
        MMR: 1169.03,
        user: {
          discordName: "NicoChico",
          id: "864f9ceb-e9fd-490a-b10e-1a018bc6e084",
        },
        entries: 38,
      },
      {
        MMR: 1168.92,
        user: {
          discordName: "Kaji",
          id: "4f1ac6bf-bc49-419f-b1bf-483c84ec0abc",
        },
        entries: 22,
      },
      {
        MMR: 1167.86,
        user: {
          discordName: "Keen🌙",
          id: "64181222-e1ad-41ad-8248-7883ac6ba496",
        },
        entries: 41,
      },
      {
        MMR: 1167.25,
        user: {
          discordName: "SnipeZ!",
          id: "cbc5bd6f-d343-4734-8fe9-2471854a9d8f",
        },
        entries: 19,
      },
      {
        MMR: 1167.18,
        user: {
          discordName: "Shíлэx✘⚡",
          id: "3fbb563c-80b0-4ea3-88ba-b5adb24f6c51",
        },
        entries: 21,
      },
      {
        MMR: 1167.05,
        user: {
          discordName: "Cue",
          id: "d534c6fe-ec93-4938-aeac-4bf7735b577d",
        },
        entries: 74,
      },
      {
        MMR: 1166.79,
        user: {
          discordName: "Takimi",
          id: "b54323ea-5cb3-4b2b-a678-403074b3940a",
        },
        entries: 41,
      },
      {
        MMR: 1166.55,
        user: {
          discordName: "Alexaï",
          id: "69f57d11-aa6b-45b8-a204-2af83c2dcc50",
        },
        entries: 22,
      },
      {
        MMR: 1165.43,
        user: {
          discordName: "Brayyy",
          id: "b30c971a-08c9-4c6d-892b-918363e40872",
        },
        entries: 38,
      },
      {
        MMR: 1165.42,
        user: {
          discordName: "bless",
          id: "744b7fe3-ab96-43ec-a78d-184f3936c403",
        },
        entries: 18,
      },
      {
        MMR: 1164.09,
        user: {
          discordName: "Sαmidge",
          id: "781d455c-770a-43e9-ab2d-206c9f8af847",
        },
        entries: 13,
      },
      {
        MMR: 1163.32,
        user: {
          discordName: "Ponyyy",
          id: "c406c997-b99b-4f3f-b89f-eb79cb8212ee",
        },
        entries: 15,
      },
      {
        MMR: 1163.24,
        user: {
          discordName: "Mecha",
          id: "952b6764-31c1-433c-98cd-876f6b3c456f",
        },
        entries: 28,
      },
      {
        MMR: 1160.73,
        user: {
          discordName: "swy",
          id: "22973fee-3683-489c-9265-1ddee5129894",
        },
        entries: 25,
      },
      {
        MMR: 1159.78,
        user: {
          discordName: "SSNolan ミ★",
          id: "a8e0d84d-d9c4-430f-b8bb-2a74eb62d0b0",
        },
        entries: 21,
      },
      {
        MMR: 1159.47,
        user: {
          discordName: "seth",
          id: "a2b04b62-5c47-4dfc-a24c-ee8bc0816204",
        },
        entries: 53,
      },
      {
        MMR: 1158.31,
        user: {
          discordName: "landon",
          id: "40d64bbd-0203-462d-b9c8-dfa0163aaccf",
        },
        entries: 32,
      },
      {
        MMR: 1157.77,
        user: {
          discordName: "Lidl",
          id: "355cf865-756b-4e0d-9bac-11697e72463b",
        },
        entries: 74,
      },
      {
        MMR: 1156.59,
        user: {
          discordName: "Thømαs",
          id: "3bf0d700-d2b5-48ed-a4ab-c795b6f65402",
        },
        entries: 32,
      },
      {
        MMR: 1155.55,
        user: {
          discordName: "Voice",
          id: "bca04da0-ff51-42ed-b383-9c1f71161bd7",
        },
        entries: 42,
      },
      {
        MMR: 1155.55,
        user: {
          discordName: "T_y__n",
          id: "e0434092-0c89-4fe7-8d94-a8966146736f",
        },
        entries: 15,
      },
      {
        MMR: 1155.05,
        user: {
          discordName: "Kiver",
          id: "e8663735-9472-4914-ac92-a3ac80e4e166",
        },
        entries: 15,
      },
      {
        MMR: 1154.99,
        user: {
          discordName: "april",
          id: "c78859c3-52f8-474a-b2ff-fdb66aaf5aff",
        },
        entries: 29,
      },
      {
        MMR: 1153.56,
        user: {
          discordName: "Mevlingo",
          id: "7302e36b-fd42-48ad-a45f-bd78f49bc81d",
        },
        entries: 27,
      },
      {
        MMR: 1153.05,
        user: {
          discordName: "Omegα",
          id: "d9de4bd9-d51e-4f3e-993a-96be2a42ddd5",
        },
        entries: 17,
      },
      {
        MMR: 1151.96,
        user: {
          discordName: "flamingfire😴",
          id: "c3f39dd6-19ba-47aa-bac7-361f2af90350",
        },
        entries: 23,
      },
      {
        MMR: 1151.95,
        user: {
          discordName: "Blopwher",
          id: "c99a3467-7093-4425-aa6e-8ddd81147383",
        },
        entries: 31,
      },
      {
        MMR: 1151.9,
        user: {
          discordName: "Fury",
          id: "7fcbccb3-c207-46a5-9caa-ac88d032c59e",
        },
        entries: 28,
      },
      {
        MMR: 1150,
        user: {
          discordName: "Mario-v",
          id: "df68207e-2ccb-481d-97e8-0f251848a1a3",
        },
        entries: 21,
      },
      {
        MMR: 1149.41,
        user: {
          discordName: "SG»Porky",
          id: "0e8b9a65-2086-4186-9b12-d835cae9be79",
        },
        entries: 27,
      },
      {
        MMR: 1148,
        user: {
          discordName: "kenetsu",
          id: "2b2d77f2-7a0d-4682-8395-aab6f7c46d33",
        },
        entries: 44,
      },
      {
        MMR: 1147.24,
        user: {
          discordName: "ant 🇧🇷",
          id: "dd9e710f-8729-4a76-b6f0-05188945d441",
        },
        entries: 27,
      },
      {
        MMR: 1146.89,
        user: {
          discordName: "Boopy",
          id: "975ea4c2-c258-4ff6-b8db-728bec6b73ff",
        },
        entries: 31,
      },
      {
        MMR: 1146.44,
        user: {
          discordName: "proof",
          id: "3ffded87-c579-49b1-8ac4-8f8a766ad590",
        },
        entries: 30,
      },
      {
        MMR: 1145.96,
        user: {
          discordName: "Yéti",
          id: "fb0e9082-bc41-4cf0-8b0c-1ee59ed82029",
        },
        entries: 33,
      },
      {
        MMR: 1145.61,
        user: {
          discordName: "AgentGiovanni",
          id: "77dc6c2d-fe4d-4dc0-8614-5cf36ba8235a",
        },
        entries: 23,
      },
      {
        MMR: 1143.57,
        user: {
          discordName: "Mar$el",
          id: "3f78bd6b-648c-4c41-b2cd-2ea88b82b392",
        },
        entries: 10,
      },
      {
        MMR: 1143.48,
        user: {
          discordName: "redshell1",
          id: "b83a279a-2fa3-4530-be6b-1451ffd16cbe",
        },
        entries: 10,
      },
      {
        MMR: 1143.19,
        user: {
          discordName: "SHH DAROO!",
          id: "312652a0-21b0-44c1-b0a5-b18e43a3bc99",
        },
        entries: 33,
      },
      {
        MMR: 1142.69,
        user: {
          discordName: "Soldier",
          id: "8acbc27f-05f1-456c-90da-3b0c5e5a0df7",
        },
        entries: 25,
      },
      {
        MMR: 1142.63,
        user: {
          discordName: "tokin",
          id: "8992c9b2-eb03-42a9-a181-da77730b3c20",
        },
        entries: 24,
      },
      {
        MMR: 1141.63,
        user: {
          discordName: "Arashi",
          id: "a5b367c4-e30c-49ba-a825-c17ac8e4748a",
        },
        entries: 17,
      },
      {
        MMR: 1141.54,
        user: {
          discordName: "stephy",
          id: "77e7cf08-95e8-4d9f-b515-fc43f5fe313f",
        },
        entries: 24,
      },
      {
        MMR: 1140.99,
        user: {
          discordName: "Kraken Mare",
          id: "a4029f99-7782-435f-bf15-8faaa5a88591",
        },
        entries: 39,
      },
      {
        MMR: 1139.09,
        user: {
          discordName: "Meiko",
          id: "ebf14a77-a2d7-4c2b-b584-bbbff24caaec",
        },
        entries: 22,
      },
      {
        MMR: 1139.07,
        user: {
          discordName: "toonbeoulve 🍥",
          id: "54d81743-f12a-44e1-a580-7c15577c1b09",
        },
        entries: 36,
      },
      {
        MMR: 1137.76,
        user: {
          discordName: "GreGuru",
          id: "c432435f-4b11-44da-9586-04dbe0dbb065",
        },
        entries: 48,
      },
      {
        MMR: 1136.66,
        user: {
          discordName: "Genesis",
          id: "613ab1da-a01f-41c8-a2d5-20f23c376941",
        },
        entries: 27,
      },
      {
        MMR: 1136.48,
        user: {
          discordName: "Pixy...",
          id: "7e92aebb-766c-4e80-97e3-a0b27e344ae1",
        },
        entries: 9,
      },
      {
        MMR: 1135.54,
        user: {
          discordName: "Hiyah",
          id: "6c9196df-7d5b-4cb6-b945-7734e9b72dae",
        },
        entries: 27,
      },
      {
        MMR: 1135.18,
        user: {
          discordName: "Lux",
          id: "cbfdfc78-adc9-4fd8-baf0-cd94d8a0a3f9",
        },
        entries: 30,
      },
      {
        MMR: 1134.65,
        user: {
          discordName: "Eliasmo",
          id: "1fc26e1d-c14f-4eb3-91b1-e5ac2dfc0269",
        },
        entries: 24,
      },
      {
        MMR: 1134.21,
        user: {
          discordName: "bnana",
          id: "a14eae1b-deb3-4f4b-b4a5-ef9fb82b7064",
        },
        entries: 30,
      },
      {
        MMR: 1134.05,
        user: {
          discordName: "redrum",
          id: "c1f6f598-092a-4800-8b7f-dea4189f35ca",
        },
        entries: 11,
      },
      {
        MMR: 1133.66,
        user: {
          discordName: "Dylan !",
          id: "40288c53-5235-4f3e-9f4c-f1d5a8f69cd7",
        },
        entries: 15,
      },
      {
        MMR: 1133.54,
        user: {
          discordName: "Emmett",
          id: "01bf1b11-e27d-490b-903b-2706e03b4812",
        },
        entries: 12,
      },
      {
        MMR: 1133.04,
        user: {
          discordName: "Rydia",
          id: "f44ec03e-a95c-4277-9202-e34962578094",
        },
        entries: 18,
      },
      {
        MMR: 1131.81,
        user: {
          discordName: "Izana.",
          id: "59ca701d-e076-4556-a1b2-3c5516822b04",
        },
        entries: 23,
      },
      {
        MMR: 1131.62,
        user: {
          discordName: "Arcanigon",
          id: "bb0a105f-8eeb-47f7-a428-60d2c61f829b",
        },
        entries: 32,
      },
      {
        MMR: 1131.54,
        user: {
          discordName: "Daλbreak",
          id: "dfa4345f-28a5-4e90-b32b-d8dde05190fc",
        },
        entries: 94,
      },
      {
        MMR: 1130.77,
        user: {
          discordName: "Storm",
          id: "5f2420f5-9e8d-4539-a9b8-ed34732a57df",
        },
        entries: 29,
      },
      {
        MMR: 1130.52,
        user: {
          discordName: "Brian",
          id: "01c694d1-75e1-48a9-a9b1-c2e69733d0d7",
        },
        entries: 14,
      },
      {
        MMR: 1129.9,
        user: {
          discordName: "Garett",
          id: "fe6aeb15-d125-46db-8246-2452d3d0a503",
        },
        entries: 19,
      },
      {
        MMR: 1129.76,
        user: {
          discordName: "jess3",
          id: "741f0d5f-4dc0-487e-96cd-5a395c8bd33d",
        },
        entries: 13,
      },
      {
        MMR: 1129.27,
        user: {
          discordName: "ドレイゴ",
          id: "a96679a0-555e-4033-9615-7e9d15213405",
        },
        entries: 22,
      },
      {
        MMR: 1128.62,
        user: {
          discordName: "crops",
          id: "9c1df3b9-7ee8-4ae5-a254-8732c71ad903",
        },
        entries: 8,
      },
      {
        MMR: 1128.39,
        user: {
          discordName: "scarfy",
          id: "1528800f-5fe0-4d86-a970-175950b4ecda",
        },
        entries: 40,
      },
      {
        MMR: 1127.95,
        user: {
          discordName: "Lindą",
          id: "1f69b893-7422-46b7-bdef-46f63404ae3f",
        },
        entries: 42,
      },
      {
        MMR: 1127.86,
        user: {
          discordName: "Imer/Nory",
          id: "1c54f23a-6cc6-40da-bd71-50e443789e44",
        },
        entries: 82,
      },
      {
        MMR: 1127.06,
        user: {
          discordName: "Litblurocker",
          id: "5d378f15-50dc-465d-a1b2-7c5b57c51953",
        },
        entries: 71,
      },
      {
        MMR: 1126.74,
        user: {
          discordName: "clem",
          id: "7c062086-8526-40e8-b569-e4f5cfa8df53",
        },
        entries: 19,
      },
      {
        MMR: 1126.24,
        user: {
          discordName: "Sendou",
          id: "ee2d82dd-624f-4b07-9d8d-ddee1f8fb36f",
        },
        entries: 27,
      },
      {
        MMR: 1126.13,
        user: {
          discordName: "PuLpuLous",
          id: "580b763b-ed68-447c-9160-70f861bbf55e",
        },
        entries: 41,
      },
      {
        MMR: 1125.77,
        user: {
          discordName: "Lucky♧🔥",
          id: "633842d6-3f82-439b-b245-d88a2d447c5d",
        },
        entries: 23,
      },
      {
        MMR: 1123.62,
        user: {
          discordName: "Soarn_",
          id: "2cc41d89-0564-42ff-b8b7-56dc6ef783b1",
        },
        entries: 26,
      },
      {
        MMR: 1123.12,
        user: {
          discordName: "Skyuwu",
          id: "d0effdf1-4442-4af9-942f-32088ee09c10",
        },
        entries: 12,
      },
      {
        MMR: 1123.02,
        user: {
          discordName: "Spara",
          id: "ba2cd33c-ea35-4b95-b762-05e996967bb8",
        },
        entries: 44,
      },
      {
        MMR: 1122.99,
        user: {
          discordName: "Morsa",
          id: "1f280488-dc95-4b41-b193-67df3329c995",
        },
        entries: 23,
      },
      {
        MMR: 1122.89,
        user: {
          discordName: "nishi",
          id: "ccc32d05-6146-4543-a665-c4f287dd9536",
        },
        entries: 36,
      },
      {
        MMR: 1121.6,
        user: {
          discordName: "Setu",
          id: "cfdeff42-7cd1-4c8f-bced-acc97690657a",
        },
        entries: 33,
      },
      {
        MMR: 1121.07,
        user: {
          discordName: "meji",
          id: "6cd315d0-b214-4216-a7e1-0f2a0459637f",
        },
        entries: 28,
      },
      {
        MMR: 1120.52,
        user: {
          discordName: "Swen",
          id: "a0d43036-eb6c-4ea6-9972-3912f178d385",
        },
        entries: 10,
      },
      {
        MMR: 1120.24,
        user: {
          discordName: "not kino",
          id: "0b851616-43a9-4092-8434-c6a4b8a176f5",
        },
        entries: 15,
      },
      {
        MMR: 1119.76,
        user: {
          discordName: "Théo⚡🦎",
          id: "870ba270-a514-4f0f-8036-aa3b4bf7dd40",
        },
        entries: 10,
      },
      {
        MMR: 1119.04,
        user: {
          discordName: "mangoswr",
          id: "ca303ffb-15b9-43aa-a7a8-56b289971fea",
        },
        entries: 8,
      },
      {
        MMR: 1118.36,
        user: {
          discordName: "Dαs'",
          id: "fc4d3f86-03f1-4013-975d-83cfd26f7c58",
        },
        entries: 15,
      },
      {
        MMR: 1118.07,
        user: {
          discordName: "ingite",
          id: "9ee3c01d-a836-4571-901b-cb41b32010c2",
        },
        entries: 12,
      },
      {
        MMR: 1118,
        user: {
          discordName: "Lewie",
          id: "7a9150f2-fae7-4153-a118-d08f85ce7af4",
        },
        entries: 21,
      },
      {
        MMR: 1117.64,
        user: {
          discordName: "Fun~Z",
          id: "8ac4cc46-863f-4cf8-b1ae-e044079aa892",
        },
        entries: 24,
      },
      {
        MMR: 1117.13,
        user: {
          discordName: "Myst",
          id: "24bea12a-eb50-4fcd-a5da-9f1cc85158e0",
        },
        entries: 67,
      },
      {
        MMR: 1116.53,
        user: {
          discordName: "Custom",
          id: "828a26e9-5f5e-4cb7-a3ae-fdf1b3694dde",
        },
        entries: 72,
      },
      {
        MMR: 1116.45,
        user: {
          discordName: "leonidasxlii",
          id: "0ba56ff7-894d-4bc7-b5fe-6c7d929ab16f",
        },
        entries: 28,
      },
      {
        MMR: 1116.35,
        user: {
          discordName: "Val'",
          id: "a534de7c-46d2-4067-926c-e939ce95d99d",
        },
        entries: 22,
      },
      {
        MMR: 1116.04,
        user: {
          discordName: "Cuber",
          id: "617ce4ab-2d40-440f-a151-d9fbc7621198",
        },
        entries: 39,
      },
      {
        MMR: 1115.17,
        user: {
          discordName: "jump",
          id: "9732e2a1-3c06-4101-8332-0026d75046a5",
        },
        entries: 42,
      },
      {
        MMR: 1113.67,
        user: {
          discordName: "mert.",
          id: "da9dd620-87ad-4889-afa5-4ea25aec5d86",
        },
        entries: 24,
      },
      {
        MMR: 1113.49,
        user: {
          discordName: "Republic",
          id: "645f69e5-54ed-4a54-bb85-eea93ed39a25",
        },
        entries: 32,
      },
      {
        MMR: 1112.15,
        user: {
          discordName: "Jonny",
          id: "d5672060-b4ad-4695-bd4d-4a47ceed4088",
        },
        entries: 48,
      },
      {
        MMR: 1111.9,
        user: {
          discordName: "BERSERKER!",
          id: "e82d10d9-fc33-4add-af08-17e5155aec50",
        },
        entries: 9,
      },
      {
        MMR: 1111.24,
        user: {
          discordName: "ENRi😴",
          id: "81588ace-f88e-4f9b-bf7f-9246606f9afa",
        },
        entries: 21,
      },
      {
        MMR: 1110.37,
        user: {
          discordName: "SGxOrochi",
          id: "c393506f-f36a-4f41-96c2-2582348dcbaf",
        },
        entries: 27,
      },
      {
        MMR: 1110.22,
        user: {
          discordName: "Rish",
          id: "cfcb9543-1b81-46ab-a2a4-7a05a47b1201",
        },
        entries: 13,
      },
      {
        MMR: 1109.95,
        user: {
          discordName: "Lonk",
          id: "6b8b4f79-72cb-4913-876f-7eab3fa32c3d",
        },
        entries: 41,
      },
      {
        MMR: 1108.2,
        user: {
          discordName: "Just a Lame",
          id: "9301f0ca-30e0-412f-9c74-da09f5d95924",
        },
        entries: 7,
      },
      {
        MMR: 1108.03,
        user: {
          discordName: "Kerni",
          id: "3be29612-45a9-4581-adb7-e3138456b95d",
        },
        entries: 28,
      },
      {
        MMR: 1107.82,
        user: {
          discordName: "Umbre",
          id: "78e2e710-6509-403a-b7ed-281df5d3b400",
        },
        entries: 72,
      },
      {
        MMR: 1107.55,
        user: {
          discordName: "not jakoob.",
          id: "f537e4e8-0747-417c-8149-8d092b3465e6",
        },
        entries: 27,
      },
      {
        MMR: 1107.29,
        user: {
          discordName: "Pezpop",
          id: "76a227bd-a681-4d81-8ed1-c29662da1461",
        },
        entries: 8,
      },
      {
        MMR: 1107.11,
        user: {
          discordName: "Keno",
          id: "2b141031-c35d-4cb1-b737-60e8e15ba65d",
        },
        entries: 11,
      },
      {
        MMR: 1106.65,
        user: {
          discordName: "yann",
          id: "2add5720-94e4-4273-be73-80eeb367f864",
        },
        entries: 9,
      },
      {
        MMR: 1106.53,
        user: {
          discordName: "96Magi",
          id: "ca3baeb1-a2fd-4259-a2ed-448ebd34cab5",
        },
        entries: 16,
      },
      {
        MMR: 1106.52,
        user: {
          discordName: "X0nI",
          id: "d6528408-2513-499d-add5-953e0f06993a",
        },
        entries: 8,
      },
      {
        MMR: 1106.33,
        user: {
          discordName: "Havoc",
          id: "293b808b-a1e2-48d1-814a-43f7e1c37ab7",
        },
        entries: 54,
      },
      {
        MMR: 1105.81,
        user: {
          discordName: "Honedge",
          id: "b5eebbe6-2560-46e4-8cf6-a0d85f04143f",
        },
        entries: 11,
      },
      {
        MMR: 1105.61,
        user: {
          discordName: "Melan",
          id: "0efa44b4-0b4d-46fb-9c28-ab0b002869d6",
        },
        entries: 48,
      },
      {
        MMR: 1105.32,
        user: {
          discordName: "Boudah",
          id: "477e220d-d8b9-42ba-b8fa-2adb775f48a4",
        },
        entries: 38,
      },
      {
        MMR: 1105.13,
        user: {
          discordName: "UnserRegenbogen",
          id: "c1f72d02-5860-4c72-a114-55e76c3afe04",
        },
        entries: 10,
      },
      {
        MMR: 1105.1,
        user: {
          discordName: "Cojo♰",
          id: "9dd5cffd-ff96-40f5-933a-c1a9a00cd057",
        },
        entries: 12,
      },
      {
        MMR: 1103.96,
        user: {
          discordName: "Martinolo",
          id: "3816fe89-c976-4846-8d11-50ba8f02b240",
        },
        entries: 35,
      },
      {
        MMR: 1103.55,
        user: {
          discordName: "Danget",
          id: "7741570f-dcce-4f9d-aa2f-6368a35b7b3b",
        },
        entries: 21,
      },
      {
        MMR: 1102.67,
        user: {
          discordName: "あそやぶ",
          id: "04efde6a-7c59-4cff-a5e3-b6146d74218e",
        },
        entries: 19,
      },
      {
        MMR: 1101.81,
        user: {
          discordName: "magnolia*",
          id: "e56f17a0-2a3f-409c-b412-1cdf7495e1d0",
        },
        entries: 35,
      },
      {
        MMR: 1101.66,
        user: {
          discordName: "Luκαs",
          id: "9fc319c9-bdd6-43fe-bc60-3a2c44a37654",
        },
        entries: 17,
      },
      {
        MMR: 1101.51,
        user: {
          discordName: "Ripping",
          id: "f82838fa-d8eb-4ddc-abd7-b6e32108416d",
        },
        entries: 38,
      },
      {
        MMR: 1101.45,
        user: {
          discordName: "Ozuna",
          id: "7bfe5f97-6c00-4e6d-b882-d714c6b4c025",
        },
        entries: 49,
      },
      {
        MMR: 1101.4,
        user: {
          discordName: "dragib",
          id: "935be06d-fc55-45ca-996f-47a841f2d3a8",
        },
        entries: 20,
      },
      {
        MMR: 1101.31,
        user: {
          discordName: "Ben",
          id: "c04312fb-74c5-4be3-b984-a54c686d847f",
        },
        entries: 49,
      },
      {
        MMR: 1098.35,
        user: {
          discordName: "IPS",
          id: "019ac4d3-dfbb-423f-8cdc-332d93994409",
        },
        entries: 16,
      },
      {
        MMR: 1097.18,
        user: {
          discordName: "Toby",
          id: "1cfea248-027f-4112-ab87-c3caa2d15c15",
        },
        entries: 14,
      },
      {
        MMR: 1095.32,
        user: {
          discordName: "Crim",
          id: "43178a6e-55e4-4c97-ac32-b27ddcd6a1db",
        },
        entries: 13,
      },
      {
        MMR: 1095.27,
        user: {
          discordName: "Kento",
          id: "1599d27a-bd23-411d-966f-8eb3d69e5532",
        },
        entries: 11,
      },
      {
        MMR: 1095.21,
        user: {
          discordName: "Lucki",
          id: "91c02f16-230e-4f77-980e-f3d6c49cb679",
        },
        entries: 7,
      },
      {
        MMR: 1094.73,
        user: {
          discordName: "blueez",
          id: "ee5aa64d-3c74-4fd7-badb-276bb0559655",
        },
        entries: 15,
      },
      {
        MMR: 1094.7,
        user: {
          discordName: "EST",
          id: "81a02ebf-58f1-42c7-9016-e8b8f3bed52e",
        },
        entries: 27,
      },
      {
        MMR: 1094.12,
        user: {
          discordName: "Ruka",
          id: "c54ae2c6-2bf4-4727-95d6-b40898cea5f6",
        },
        entries: 10,
      },
      {
        MMR: 1094.01,
        user: {
          discordName: "Archer",
          id: "cef24e3d-f344-42cf-ba9f-362115203744",
        },
        entries: 9,
      },
      {
        MMR: 1093.6,
        user: {
          discordName: "Nick",
          id: "2ba5feb4-7d65-4aab-944d-a1a4d2f6cb7e",
        },
        entries: 9,
      },
      {
        MMR: 1093.45,
        user: {
          discordName: "Roundy",
          id: "7f76bed1-1eb1-4b98-b7ea-b4cec208a206",
        },
        entries: 46,
      },
      {
        MMR: 1091.78,
        user: {
          discordName: "Tera",
          id: "8ae9444f-513a-4d61-9452-f76525e4ad19",
        },
        entries: 11,
      },
      {
        MMR: 1090.16,
        user: {
          discordName: "ZZZ",
          id: "92f69998-853c-437b-bcda-6e3bb745710a",
        },
        entries: 35,
      },
      {
        MMR: 1090.15,
        user: {
          discordName: "Typoh",
          id: "e8917ad6-fc90-418a-aa7a-d4fdba4407d0",
        },
        entries: 25,
      },
      {
        MMR: 1089.81,
        user: {
          discordName: "Orion ツ",
          id: "934daed5-fe23-4897-801c-1ca4b9c3f3fa",
        },
        entries: 39,
      },
      {
        MMR: 1089.71,
        user: {
          discordName: "Evan01",
          id: "58b6838a-801d-4d3c-af86-f3bfa57f91a9",
        },
        entries: 10,
      },
      {
        MMR: 1088.73,
        user: {
          discordName: "Jimmy!",
          id: "d3c41765-e28a-408e-b164-6ea26de2327f",
        },
        entries: 46,
      },
      {
        MMR: 1088.16,
        user: {
          discordName: "bashdug",
          id: "0ffccf63-20d1-4cdf-a7bf-383394fae287",
        },
        entries: 13,
      },
      {
        MMR: 1088.13,
        user: {
          discordName: "Campy",
          id: "d67fe40c-6430-4451-88de-3d648668d9ce",
        },
        entries: 20,
      },
      {
        MMR: 1088.01,
        user: {
          discordName: "Hypnos",
          id: "4196fd88-c67a-427a-bbf4-97ce41fa5f74",
        },
        entries: 15,
      },
      {
        MMR: 1087.32,
        user: {
          discordName: "Reiya",
          id: "6a48be88-a799-4f67-a8fd-9e6ba506cf0a",
        },
        entries: 8,
      },
      {
        MMR: 1085.57,
        user: {
          discordName: "Villy",
          id: "b430d540-b49b-4b0d-a49e-b2002e3599a1",
        },
        entries: 10,
      },
      {
        MMR: 1085.14,
        user: {
          discordName: "y.Chomper",
          id: "53481ae2-57b9-4a51-9159-7e848f1ee2ee",
        },
        entries: 9,
      },
      {
        MMR: 1083.91,
        user: {
          discordName: "Jonjon",
          id: "6c7b337a-eb92-4d0f-9de5-3a8870ed6d61",
        },
        entries: 33,
      },
      {
        MMR: 1083.61,
        user: {
          discordName: "Dawage",
          id: "5421d035-212d-4763-be1c-dceebfd7a8b9",
        },
        entries: 86,
      },
      {
        MMR: 1083.55,
        user: {
          discordName: "Elite",
          id: "c8da13e4-6586-4453-ac49-b4acf7337995",
        },
        entries: 7,
      },
      {
        MMR: 1083.5,
        user: {
          discordName: "Tweeezel",
          id: "76909cd8-a7a6-42fe-95c0-fd5948ba33d8",
        },
        entries: 21,
      },
      {
        MMR: 1083.45,
        user: {
          discordName: "clang",
          id: "d8ec9d80-17f5-48c8-9bf0-babd1b47487e",
        },
        entries: 12,
      },
      {
        MMR: 1083.18,
        user: {
          discordName: "Zonink",
          id: "0657978f-34e3-48ef-ba93-1f700570313c",
        },
        entries: 20,
      },
      {
        MMR: 1082.05,
        user: {
          discordName: "Pork Smork",
          id: "868d712f-344f-47c1-9b43-a43b01638140",
        },
        entries: 28,
      },
      {
        MMR: 1081.54,
        user: {
          discordName: "Wøηdεr(Dario)",
          id: "346bbc68-dd63-4a6f-a48b-fb33f2f17ac0",
        },
        entries: 13,
      },
      {
        MMR: 1080.25,
        user: {
          discordName: "zyf",
          id: "c253d15c-7eff-4bbc-917d-950387f5b54d",
        },
        entries: 23,
      },
      {
        MMR: 1079.33,
        user: {
          discordName: "yokaru7",
          id: "cf0ceae1-40c4-42dd-a2a0-e9cf3955d311",
        },
        entries: 14,
      },
      {
        MMR: 1079.02,
        user: {
          discordName: "KINGTAMO",
          id: "0edc25b2-68c4-4c9b-91c6-8c47455d37eb",
        },
        entries: 7,
      },
      {
        MMR: 1078.51,
        user: {
          discordName: "Tommie",
          id: "08af6c4a-b4dd-4584-bbeb-da24c0287b1d",
        },
        entries: 10,
      },
      {
        MMR: 1078.08,
        user: {
          discordName: "AverageLia",
          id: "e566d7d1-9e0e-4839-80cd-6fba6dbdda1c",
        },
        entries: 21,
      },
      {
        MMR: 1077.14,
        user: {
          discordName: "Argo",
          id: "84f7ef0d-5584-4ab9-86b8-a1699d832c46",
        },
        entries: 25,
      },
      {
        MMR: 1076.53,
        user: {
          discordName: "NeoYuga",
          id: "9cc63fd2-c250-4d90-9c64-37c816010daa",
        },
        entries: 10,
      },
      {
        MMR: 1076.21,
        user: {
          discordName: "Cóbalt",
          id: "7f1dd4b6-8acd-4521-884f-e01e62077cff",
        },
        entries: 56,
      },
      {
        MMR: 1075.87,
        user: {
          discordName: "Blu",
          id: "c6c2ef9c-ffde-4d1b-b6c0-dc00c90485b4",
        },
        entries: 40,
      },
      {
        MMR: 1075.77,
        user: {
          discordName: "Omega",
          id: "bf4b229a-e19b-4072-aaa6-7cabbdef52f5",
        },
        entries: 20,
      },
      {
        MMR: 1075.5,
        user: {
          discordName: "Yuni",
          id: "63f0e807-a799-4042-bbea-e7538ccd8707",
        },
        entries: 18,
      },
      {
        MMR: 1075.4,
        user: {
          discordName: "Bolt",
          id: "7f38f96d-cf93-48ad-a6c2-94942860d849",
        },
        entries: 8,
      },
      {
        MMR: 1075.16,
        user: {
          discordName: "Dazai",
          id: "21313f0a-580b-49aa-b4d2-63b0b409d035",
        },
        entries: 18,
      },
      {
        MMR: 1074.59,
        user: {
          discordName: "Lizz?",
          id: "1397596c-9b62-4179-ad2d-e5d8fbb3b95c",
        },
        entries: 19,
      },
      {
        MMR: 1074.43,
        user: {
          discordName: "Migue_CaS",
          id: "c93af8a6-d79b-4d33-abb2-08118a7a4080",
        },
        entries: 35,
      },
      {
        MMR: 1073.76,
        user: {
          discordName: "f(x)martin",
          id: "3f14cc4a-89cf-4427-bb30-8cee61944282",
        },
        entries: 19,
      },
      {
        MMR: 1073.35,
        user: {
          discordName: "Anni",
          id: "42452435-546a-45b7-a613-27c4e8e3d641",
        },
        entries: 13,
      },
      {
        MMR: 1071.55,
        user: {
          discordName: "Loulo",
          id: "59deec8c-1b0c-45e0-aad1-f042c7838e52",
        },
        entries: 14,
      },
      {
        MMR: 1070.95,
        user: {
          discordName: "Raze",
          id: "7ed6d744-0948-4155-8f2c-30f5e8a5ef63",
        },
        entries: 20,
      },
      {
        MMR: 1070.73,
        user: {
          discordName: "Stans",
          id: "7f591e2e-f1a1-4780-892c-9de1ea803864",
        },
        entries: 19,
      },
      {
        MMR: 1070.64,
        user: {
          discordName: "y0shell",
          id: "6fdc472a-d7fe-489d-ae03-33c75fb0cef9",
        },
        entries: 14,
      },
      {
        MMR: 1070.51,
        user: {
          discordName: "X!",
          id: "f4c75ecd-848a-4527-b4c5-3e2d054374b2",
        },
        entries: 9,
      },
      {
        MMR: 1070.36,
        user: {
          discordName: "Pagnaaa",
          id: "a1742cf8-1360-4dff-8fe1-5ffa1d87b4ec",
        },
        entries: 12,
      },
      {
        MMR: 1069.86,
        user: {
          discordName: "Ng5",
          id: "8449de55-89bd-4309-9b98-2f9b38d8488f",
        },
        entries: 36,
      },
      {
        MMR: 1069.71,
        user: {
          discordName: "SEDSAR",
          id: "d8675382-cc92-4464-a612-b3dcbd85a322",
        },
        entries: 9,
      },
      {
        MMR: 1069.07,
        user: {
          discordName: "Yumura",
          id: "6b58bb6b-8c5e-4798-928c-629f6a526c84",
        },
        entries: 30,
      },
      {
        MMR: 1068.98,
        user: {
          discordName: "smile!",
          id: "97a8d3b4-1262-4d82-b38c-9efa69bf35ae",
        },
        entries: 29,
      },
      {
        MMR: 1068.49,
        user: {
          discordName: "Rainbox",
          id: "e5545b04-bf60-4f1d-a086-3ef3f96f8795",
        },
        entries: 29,
      },
      {
        MMR: 1068.41,
        user: {
          discordName: "Halo",
          id: "7f13be58-47db-4ace-9940-60726b6b9a68",
        },
        entries: 30,
      },
      {
        MMR: 1067.53,
        user: {
          discordName: "Zardha.",
          id: "13e288f4-ac0d-4caa-8522-0f305873bc0c",
        },
        entries: 8,
      },
      {
        MMR: 1067.45,
        user: {
          discordName: "ShockWavee",
          id: "710ee279-a289-4535-b795-7250e40a73cd",
        },
        entries: 7,
      },
      {
        MMR: 1066.79,
        user: {
          discordName: "Kairo",
          id: "0e640b78-2b4f-4121-b07a-aa68fbe47f7d",
        },
        entries: 28,
      },
      {
        MMR: 1066.79,
        user: {
          discordName: "Rotciv",
          id: "1114e26a-9c30-4fab-a475-0929461de487",
        },
        entries: 21,
      },
      {
        MMR: 1066.6,
        user: {
          discordName: "helix🧬⏳🕊",
          id: "925dd49c-2020-48b1-a5fe-eb41ad641fc9",
        },
        entries: 16,
      },
      {
        MMR: 1066.41,
        user: {
          discordName: "Apple2.0",
          id: "0b5c3b08-eedc-41bc-bb8e-790135478f27",
        },
        entries: 15,
      },
      {
        MMR: 1066.37,
        user: {
          discordName: "MasterRS",
          id: "13197103-bafa-4add-a69f-9dea851876b0",
        },
        entries: 14,
      },
      {
        MMR: 1065.72,
        user: {
          discordName: "chendyyy",
          id: "eae7703b-d2a4-4c64-9d8e-ef05e1361110",
        },
        entries: 10,
      },
      {
        MMR: 1065.01,
        user: {
          discordName: "Cone",
          id: "adbf6a3e-c43a-44bd-a996-94e50c25c5ad",
        },
        entries: 26,
      },
      {
        MMR: 1064.84,
        user: {
          discordName: "Chicharron",
          id: "72f94286-764b-4f58-b577-e7bd37782f11",
        },
        entries: 14,
      },
      {
        MMR: 1064.79,
        user: {
          discordName: "Mr_Cookie",
          id: "b0099577-8be7-48fe-a5cf-6ddec9fbfb5c",
        },
        entries: 54,
      },
      {
        MMR: 1064.66,
        user: {
          discordName: "Soveliss",
          id: "264b84d1-7dd2-4799-a7ab-385faabafbad",
        },
        entries: 25,
      },
      {
        MMR: 1064.5,
        user: {
          discordName: "Bass",
          id: "939f82cc-b864-4352-9307-869f5bd13eba",
        },
        entries: 20,
      },
      {
        MMR: 1064.47,
        user: {
          discordName: "Baha_Blast",
          id: "1c63d69b-4f7e-4524-9561-95529b8fdeeb",
        },
        entries: 33,
      },
      {
        MMR: 1064.32,
        user: {
          discordName: "Yata",
          id: "44d36e60-0190-4c4f-ada2-b5252eacad85",
        },
        entries: 18,
      },
      {
        MMR: 1064.27,
        user: {
          discordName: "(Kde_r4)",
          id: "c654c035-b789-430e-9abb-963422ee85ca",
        },
        entries: 15,
      },
      {
        MMR: 1063.36,
        user: {
          discordName: "Shooper",
          id: "3ec4e1e2-e899-4c20-9ce9-ec589cd6ff14",
        },
        entries: 18,
      },
      {
        MMR: 1062.3,
        user: {
          discordName: "KC still 🗡🗡",
          id: "c5b1bf69-9db9-49c1-891a-f7c7f0e0f190",
        },
        entries: 11,
      },
      {
        MMR: 1062.15,
        user: {
          discordName: "Linc",
          id: "8939a608-bcea-48fc-bdeb-a1d5985851ba",
        },
        entries: 9,
      },
      {
        MMR: 1061.85,
        user: {
          discordName: "lying 4 fun",
          id: "d60181d5-fb1e-499a-a0ee-10708bcf91fc",
        },
        entries: 12,
      },
      {
        MMR: 1060.96,
        user: {
          discordName: "Andhy",
          id: "6de3f1aa-7c35-402a-92cb-e6a843928425",
        },
        entries: 10,
      },
      {
        MMR: 1060.71,
        user: {
          discordName: "Sias",
          id: "f3d4f6e4-115a-43dd-b2a0-42c0b1953517",
        },
        entries: 12,
      },
      {
        MMR: 1060.71,
        user: {
          discordName: "Jamil",
          id: "51f632b5-63d5-4a28-bf8e-a7068edb22bc",
        },
        entries: 14,
      },
      {
        MMR: 1060.56,
        user: {
          discordName: "Smokey",
          id: "ffd34203-a6c8-4333-b52a-b22f60f43e60",
        },
        entries: 8,
      },
      {
        MMR: 1060.38,
        user: {
          discordName: "Pop",
          id: "956f179c-deea-4711-ab71-02c3ef706e79",
        },
        entries: 55,
      },
      {
        MMR: 1060.18,
        user: {
          discordName: "Magnus",
          id: "48d89e3f-9ee0-4927-95d5-850a6845458c",
        },
        entries: 28,
      },
      {
        MMR: 1059.44,
        user: {
          discordName: "Ballóòn",
          id: "22e9a25f-51fd-44a6-9af0-e66a66fcec7e",
        },
        entries: 12,
      },
      {
        MMR: 1059.33,
        user: {
          discordName: "rissa",
          id: "0643a2b5-72c9-4dec-af15-d1ebbc6b35ab",
        },
        entries: 29,
      },
      {
        MMR: 1059.24,
        user: {
          discordName: "Wiesel",
          id: "f0bf4bbe-4adb-4660-b476-27e4472fd061",
        },
        entries: 9,
      },
      {
        MMR: 1059.03,
        user: {
          discordName: "Chaseee",
          id: "54abdaf0-4253-407c-aa6e-2e52187587c3",
        },
        entries: 24,
      },
      {
        MMR: 1058.67,
        user: {
          discordName: "cappy",
          id: "26879c48-13c6-4460-bd1d-c7619b78cf39",
        },
        entries: 11,
      },
      {
        MMR: 1058.38,
        user: {
          discordName: "Ardino",
          id: "b9f871bd-55e5-4833-8409-bed271623459",
        },
        entries: 11,
      },
      {
        MMR: 1057.7,
        user: {
          discordName: "Kaii",
          id: "3c8834a6-f535-4e97-b5c8-76b016ceef26",
        },
        entries: 18,
      },
      {
        MMR: 1057.29,
        user: {
          discordName: "FзαЯŁзsż",
          id: "8e5d9c57-9eab-4616-8940-e16ae22673d8",
        },
        entries: 8,
      },
      {
        MMR: 1056.89,
        user: {
          discordName: "Ellis",
          id: "f5fe34cd-12a7-47b1-850d-efd529c1d849",
        },
        entries: 21,
      },
      {
        MMR: 1056.87,
        user: {
          discordName: "Oeth💫🐬",
          id: "dee28de5-9891-4cbf-b91e-7bf20eec9d1a",
        },
        entries: 8,
      },
      {
        MMR: 1056.59,
        user: {
          discordName: "Nice O",
          id: "963ca796-fc18-4e25-bcbe-db3cfebd8187",
        },
        entries: 30,
      },
      {
        MMR: 1056.55,
        user: {
          discordName: "Daη",
          id: "4d68106b-227e-4327-b52a-8b8ee1d6f226",
        },
        entries: 9,
      },
      {
        MMR: 1056.25,
        user: {
          discordName: "Ｗａｌｋｅｒ　雲けネ",
          id: "cad3196c-7434-4ac4-873a-f01201359338",
        },
        entries: 12,
      },
      {
        MMR: 1055.95,
        user: {
          discordName: "Wasa",
          id: "ceccb092-f9e9-404f-9b23-fff16e1a8666",
        },
        entries: 10,
      },
      {
        MMR: 1055.6,
        user: {
          discordName: "Luki",
          id: "30ac6d3a-31a4-446d-b14b-c43e894bd370",
        },
        entries: 28,
      },
      {
        MMR: 1055.06,
        user: {
          discordName: "sleepy",
          id: "eafa0db3-7898-4aa9-b28f-74188df1ea05",
        },
        entries: 25,
      },
      {
        MMR: 1054.63,
        user: {
          discordName: "robotomy",
          id: "5b72bb58-b674-41a9-9d23-5f2653a05d49",
        },
        entries: 29,
      },
      {
        MMR: 1054.61,
        user: {
          discordName: "Tαylor",
          id: "56bbb6ae-38c3-48a8-ad8f-503175a9f8d2",
        },
        entries: 14,
      },
      {
        MMR: 1054.47,
        user: {
          discordName: "「Maxy」",
          id: "32e20bd3-8bc1-46ae-bded-72dc1d88ffca",
        },
        entries: 19,
      },
      {
        MMR: 1054.18,
        user: {
          discordName: "Clouds",
          id: "b39fbc2a-8c26-4a51-8b66-fb8ed4687719",
        },
        entries: 27,
      },
      {
        MMR: 1054.04,
        user: {
          discordName: "✨Brii~✨",
          id: "8bf89e37-5ee4-469e-9c29-e2681615a3cd",
        },
        entries: 28,
      },
      {
        MMR: 1053.39,
        user: {
          discordName: ".Ben",
          id: "c66a9c7f-756b-41a1-a288-1719a74fb576",
        },
        entries: 33,
      },
      {
        MMR: 1053.14,
        user: {
          discordName: "Chishiya ♠♥♦♣",
          id: "b6cadfce-a0e3-423d-85c2-cd7190a232d9",
        },
        entries: 28,
      },
      {
        MMR: 1053.04,
        user: {
          discordName: "Carlox",
          id: "7da48f91-8a31-436b-ba3d-d8f56eeb2496",
        },
        entries: 13,
      },
      {
        MMR: 1052.93,
        user: {
          discordName: "Re-Mi",
          id: "056d9992-0e4e-4513-8594-4bacb5d7afa9",
        },
        entries: 11,
      },
      {
        MMR: 1052.37,
        user: {
          discordName: "Polux",
          id: "70f28d82-65e3-4496-8f89-b4163af8b5dd",
        },
        entries: 10,
      },
      {
        MMR: 1052.02,
        user: {
          discordName: "Lilium",
          id: "e376acc7-9267-4124-bbda-7e205eed9122",
        },
        entries: 20,
      },
      {
        MMR: 1051.31,
        user: {
          discordName: "bribri21",
          id: "e2dc0db9-8abb-4cc0-a6c9-15c2f7d4414b",
        },
        entries: 13,
      },
      {
        MMR: 1051.3,
        user: {
          discordName: "Sepht¡s!",
          id: "7942f100-4eb0-4aba-b4a4-6da3f5528b5e",
        },
        entries: 12,
      },
      {
        MMR: 1049.83,
        user: {
          discordName: "ShinyBoi",
          id: "f1506eae-276f-4c7e-a4ef-02d231f062cb",
        },
        entries: 12,
      },
      {
        MMR: 1049.54,
        user: {
          discordName: "immalilegret",
          id: "4a0ad0a4-c9be-4c10-a169-cb4d19ea775d",
        },
        entries: 12,
      },
      {
        MMR: 1049.43,
        user: {
          discordName: "Pika",
          id: "d94f5bf2-3343-475b-a7ef-05cf2efb0e63",
        },
        entries: 23,
      },
      {
        MMR: 1049.27,
        user: {
          discordName: "Glaceonek Hydrowski",
          id: "8bc37bfa-294b-4e1c-ba00-f632bf6759c9",
        },
        entries: 7,
      },
      {
        MMR: 1049.09,
        user: {
          discordName: "p1ncher",
          id: "dda6002b-9f8d-46cf-bea6-86f7cce04a38",
        },
        entries: 12,
      },
      {
        MMR: 1049.05,
        user: {
          discordName: "Nothingv",
          id: "954a94d2-5ea2-413a-a07e-393e800cb17e",
        },
        entries: 37,
      },
      {
        MMR: 1048.49,
        user: {
          discordName: "rino",
          id: "dfee1230-a175-4f33-8c42-3e1f61029772",
        },
        entries: 11,
      },
      {
        MMR: 1047.9,
        user: {
          discordName: "Lily",
          id: "455ebe24-6507-40aa-8c21-d20c24c260ee",
        },
        entries: 22,
      },
      {
        MMR: 1047.5,
        user: {
          discordName: "Kouji",
          id: "720514f0-5a43-4993-aa5a-8fd2f86fab59",
        },
        entries: 8,
      },
      {
        MMR: 1047.43,
        user: {
          discordName: "V4p0r",
          id: "79792a9d-69bd-4d66-954f-36a339d5fb65",
        },
        entries: 43,
      },
      {
        MMR: 1047.01,
        user: {
          discordName: "Jeff",
          id: "be6cf923-9eda-4fe8-ab3a-0e8a11a41369",
        },
        entries: 8,
      },
      {
        MMR: 1047,
        user: {
          discordName: "UwUzi",
          id: "f6033066-c6c8-426e-8397-7c9550685bd7",
        },
        entries: 11,
      },
      {
        MMR: 1046.96,
        user: {
          discordName: "sakura",
          id: "207ddba1-1ee0-4c74-9535-1807cc129751",
        },
        entries: 12,
      },
      {
        MMR: 1046.28,
        user: {
          discordName: "Sunshine",
          id: "1d9e7213-687d-40b8-a739-4664988db833",
        },
        entries: 22,
      },
      {
        MMR: 1045.96,
        user: {
          discordName: "ili",
          id: "948dc31e-c6ba-4472-bec5-b993458bba6f",
        },
        entries: 9,
      },
      {
        MMR: 1045.73,
        user: {
          discordName: "Yorchiψ",
          id: "73d712fb-62ca-4463-9ea0-f9ea405c9742",
        },
        entries: 11,
      },
      {
        MMR: 1045.52,
        user: {
          discordName: "Bandi",
          id: "f9c2bbe6-24df-4406-addf-217f331d66e4",
        },
        entries: 7,
      },
      {
        MMR: 1045.51,
        user: {
          discordName: "TheArtCase",
          id: "ceac5ced-abad-4b54-bc66-8515c9b76c33",
        },
        entries: 17,
      },
      {
        MMR: 1044.99,
        user: {
          discordName: "Brius",
          id: "2567552b-6e3d-455c-b9bd-68fa1f1cf636",
        },
        entries: 10,
      },
      {
        MMR: 1044.78,
        user: {
          discordName: "Ōkami狼",
          id: "d1b0c530-4221-4b70-bfe3-b2c184957f85",
        },
        entries: 21,
      },
      {
        MMR: 1044.76,
        user: {
          discordName: "VaNilla",
          id: "d8af7770-ecc8-4d25-b5aa-500c5f819ebe",
        },
        entries: 9,
      },
      {
        MMR: 1044.63,
        user: {
          discordName: "Chippu?",
          id: "b7d275a6-ce22-451a-b0c4-0bd2c091e955",
        },
        entries: 8,
      },
      {
        MMR: 1044.48,
        user: {
          discordName: "57747",
          id: "29dc3954-351c-4cfd-a89c-be8f6bf5b00b",
        },
        entries: 17,
      },
      {
        MMR: 1044.04,
        user: {
          discordName: "Bronze",
          id: "462b1b6e-8b39-4889-b80a-2dc4d45e2d49",
        },
        entries: 11,
      },
      {
        MMR: 1043.89,
        user: {
          discordName: "Quan",
          id: "f3c5407e-93d0-4318-b05f-6218a871e79c",
        },
        entries: 8,
      },
      {
        MMR: 1043.8,
        user: {
          discordName: "memes",
          id: "8850d296-fddc-4205-a3e7-600c90ef495b",
        },
        entries: 17,
      },
      {
        MMR: 1043.42,
        user: {
          discordName: "Champ",
          id: "7cb97376-f608-48ca-b976-92105f888d53",
        },
        entries: 31,
      },
      {
        MMR: 1042.36,
        user: {
          discordName: "WATI Blαst!",
          id: "97db2a3c-d380-4784-a9a5-5b62bb13e7d7",
        },
        entries: 21,
      },
      {
        MMR: 1042.36,
        user: {
          discordName: "Splating",
          id: "2d314ece-af4c-4968-97e0-1c6d1332a921",
        },
        entries: 10,
      },
      {
        MMR: 1042.2,
        user: {
          discordName: "YuSnipe",
          id: "c97a47d4-37c3-4994-b08a-c9350a747a76",
        },
        entries: 8,
      },
      {
        MMR: 1042.17,
        user: {
          discordName: "Reinsfield",
          id: "82ae4122-4284-4e5c-8db4-6761aedcac8a",
        },
        entries: 11,
      },
      {
        MMR: 1041.67,
        user: {
          discordName: "Popgun",
          id: "f74a8297-9f0f-482a-8bfa-832094827478",
        },
        entries: 26,
      },
      {
        MMR: 1040.9,
        user: {
          discordName: "sloth",
          id: "c8ff8dff-240e-4901-bb78-8d2b4f7c4962",
        },
        entries: 11,
      },
      {
        MMR: 1040.7,
        user: {
          discordName: "⚜Tixi˜",
          id: "aec1aa15-00b4-4712-ad28-9fb6ae4c725b",
        },
        entries: 8,
      },
      {
        MMR: 1040.15,
        user: {
          discordName: "Glacia",
          id: "8fef10b2-b52f-4b68-9828-33523811a25b",
        },
        entries: 17,
      },
      {
        MMR: 1039.84,
        user: {
          discordName: "Tux",
          id: "7b3c6573-372a-4804-bf64-274d4ed3cb18",
        },
        entries: 7,
      },
      {
        MMR: 1039.72,
        user: {
          discordName: "Gorilla",
          id: "73dd88cb-b6d8-482a-83da-06e7cc60e14f",
        },
        entries: 10,
      },
      {
        MMR: 1039.33,
        user: {
          discordName: "Cam",
          id: "7a41843b-2626-421c-af45-f5c413b64b98",
        },
        entries: 9,
      },
      {
        MMR: 1039.04,
        user: {
          discordName: "Maca",
          id: "81e5f61e-c909-4f79-a52b-1fbcfa357ced",
        },
        entries: 26,
      },
      {
        MMR: 1039.02,
        user: {
          discordName: "Latte uwu",
          id: "47e7a5d4-a23c-4d2e-addd-0e36038a5892",
        },
        entries: 25,
      },
      {
        MMR: 1039.02,
        user: {
          discordName: "Mocha",
          id: "86b5c9a0-851a-49fc-9eb9-27230e014516",
        },
        entries: 25,
      },
      {
        MMR: 1038.52,
        user: {
          discordName: "Sapphire",
          id: "df9759a1-a09c-4f65-99eb-277f73d76696",
        },
        entries: 11,
      },
      {
        MMR: 1038.26,
        user: {
          discordName: "RedCannon",
          id: "00c2c6cc-cb66-40fa-9518-a39f600c3a27",
        },
        entries: 8,
      },
      {
        MMR: 1038.17,
        user: {
          discordName: "Modupe",
          id: "f74e2be1-e8c9-4b0c-8451-bca77fdb2697",
        },
        entries: 14,
      },
      {
        MMR: 1038.12,
        user: {
          discordName: "kilokilo",
          id: "29cf9813-60b8-420c-ac13-0582dd2ec829",
        },
        entries: 20,
      },
      {
        MMR: 1038.11,
        user: {
          discordName: "kiri",
          id: "f78d744f-f8bd-4c03-a432-8c6d6a31fd23",
        },
        entries: 12,
      },
      {
        MMR: 1037.62,
        user: {
          discordName: "ilias",
          id: "4e27b69c-42e1-4729-8ca9-df391028aaff",
        },
        entries: 31,
      },
      {
        MMR: 1037.5,
        user: {
          discordName: "Adil",
          id: "30aba37a-d4f4-4336-bb3a-f7ad876ef1a6",
        },
        entries: 19,
      },
      {
        MMR: 1037.42,
        user: {
          discordName: "Kabi",
          id: "39f22269-8e6a-4bfd-9831-be06773ffb35",
        },
        entries: 9,
      },
      {
        MMR: 1037.33,
        user: {
          discordName: "cob",
          id: "3e912b3f-3468-4da8-be7e-ef3455d290a5",
        },
        entries: 8,
      },
      {
        MMR: 1036.96,
        user: {
          discordName: "aly",
          id: "664cf914-e59e-4da5-815c-b253b630b77c",
        },
        entries: 13,
      },
      {
        MMR: 1036.9,
        user: {
          discordName: "「«NeXus»」",
          id: "ea437b89-fc49-4182-b73a-869a7bd38beb",
        },
        entries: 7,
      },
      {
        MMR: 1036.84,
        user: {
          discordName: "shogun⁉",
          id: "3fc2badf-75bd-4853-9db6-5808ffb336a3",
        },
        entries: 7,
      },
      {
        MMR: 1036.4,
        user: {
          discordName: "Aleeeex!",
          id: "9807420b-adc6-4b91-b9a8-a97a735a2b30",
        },
        entries: 15,
      },
      {
        MMR: 1036.22,
        user: {
          discordName: "XRay",
          id: "2a83147c-94a2-48e3-9afc-fc6f073e5ccb",
        },
        entries: 41,
      },
      {
        MMR: 1035.73,
        user: {
          discordName: "LLz",
          id: "c085761e-b655-411e-a928-60e3238cb8d3",
        },
        entries: 9,
      },
      {
        MMR: 1035.69,
        user: {
          discordName: "skyLex",
          id: "4d27426b-5120-4944-b1ad-cc4ca1009ad3",
        },
        entries: 14,
      },
      {
        MMR: 1034.85,
        user: {
          discordName: "alatarielluinwe",
          id: "71af9b39-be85-43a4-96be-63c1c40013c8",
        },
        entries: 12,
      },
      {
        MMR: 1034.82,
        user: {
          discordName: "Nango",
          id: "8523e6a0-0b34-452a-9438-66d25e370e9c",
        },
        entries: 13,
      },
      {
        MMR: 1034.66,
        user: {
          discordName: "HARUUUUU",
          id: "f880f93e-2dd9-4de8-8fbc-6a9288fb8981",
        },
        entries: 33,
      },
      {
        MMR: 1034.46,
        user: {
          discordName: "Neebles",
          id: "80f69d63-6c84-4d8c-bdaf-78a0f0ab2e00",
        },
        entries: 11,
      },
      {
        MMR: 1034.26,
        user: {
          discordName: "mars!",
          id: "f83b7a03-730e-4cf3-9ef4-398c7c44c76f",
        },
        entries: 26,
      },
      {
        MMR: 1034.13,
        user: {
          discordName: "Os69 ツ",
          id: "c955e45f-7d99-47b0-bd9d-97e370d417a3",
        },
        entries: 11,
      },
      {
        MMR: 1033.75,
        user: {
          discordName: "Soren",
          id: "0c51f52f-e371-4e95-905b-96cfed3c5011",
        },
        entries: 18,
      },
      {
        MMR: 1033.48,
        user: {
          discordName: "🐬🧵👋🏽(= _ =)",
          id: "28d60474-97e1-4c5c-9f17-a392a4880804",
        },
        entries: 7,
      },
      {
        MMR: 1033.26,
        user: {
          discordName: "G.",
          id: "734492c9-6ec7-47c9-a5b6-acba733d40a5",
        },
        entries: 44,
      },
      {
        MMR: 1032.18,
        user: {
          discordName: "Beam",
          id: "0e5da707-b3d1-42a2-bc40-825910ea80b2",
        },
        entries: 9,
      },
      {
        MMR: 1032.08,
        user: {
          discordName: "EliteWoomy",
          id: "1a538c90-fc02-4728-a42a-773d13b24f9c",
        },
        entries: 9,
      },
      {
        MMR: 1032.03,
        user: {
          discordName: "naga 🌸",
          id: "7bd9b03f-b95d-4c5d-9b76-e9e107dd1577",
        },
        entries: 14,
      },
      {
        MMR: 1031.8,
        user: {
          discordName: "Volto",
          id: "e42d68a0-fad5-46dc-953b-c79e14a1e667",
        },
        entries: 16,
      },
      {
        MMR: 1031.43,
        user: {
          discordName: "めめ",
          id: "0dce6d9a-586f-4fe5-86d5-93a6a9b823c9",
        },
        entries: 18,
      },
      {
        MMR: 1031.38,
        user: {
          discordName: "Berlinsito",
          id: "e7b7f2ab-6aa5-4fb1-a32f-c34ceb9b3f6b",
        },
        entries: 17,
      },
      {
        MMR: 1031.32,
        user: {
          discordName: "Soko",
          id: "4b303815-3f53-45c0-9509-f8aca9f155ae",
        },
        entries: 8,
      },
      {
        MMR: 1030.09,
        user: {
          discordName: "Sxxxh",
          id: "d5fa3516-b62d-47a9-88ca-f8d3d647f1c9",
        },
        entries: 26,
      },
      {
        MMR: 1029.44,
        user: {
          discordName: "Borty",
          id: "4eb654da-0e7b-41d9-9832-dd6704216d2c",
        },
        entries: 7,
      },
      {
        MMR: 1029.36,
        user: {
          discordName: "Riki",
          id: "d43ec727-890d-41cc-9938-4e94edd0b2fd",
        },
        entries: 7,
      },
      {
        MMR: 1027.91,
        user: {
          discordName: "Kichi",
          id: "6d4fa304-35e5-4eb4-9d39-ff3405fe7f49",
        },
        entries: 29,
      },
      {
        MMR: 1027.23,
        user: {
          discordName: "JulianWantsOJ",
          id: "e8c5fbfe-87d9-4fb1-b4ab-d49def968f9f",
        },
        entries: 11,
      },
      {
        MMR: 1027.23,
        user: {
          discordName: "star",
          id: "5db3f584-c479-492b-8e9a-aaf68b28c5ee",
        },
        entries: 16,
      },
      {
        MMR: 1026.72,
        user: {
          discordName: "Turtle",
          id: "b601aef0-468d-485f-8088-ef839082e88a",
        },
        entries: 19,
      },
      {
        MMR: 1026.32,
        user: {
          discordName: "Pew Pew",
          id: "a1669cc7-c1e0-4efa-8c86-1d90cd8897c0",
        },
        entries: 7,
      },
      {
        MMR: 1025.83,
        user: {
          discordName: "Alguien✿",
          id: "132aa3fe-afeb-4452-9428-01777e49c92e",
        },
        entries: 9,
      },
      {
        MMR: 1025.53,
        user: {
          discordName: "Chisco",
          id: "3f48c5b8-bf1b-41ea-a919-3506f1be68b9",
        },
        entries: 8,
      },
      {
        MMR: 1024.93,
        user: {
          discordName: "Meemoo!!",
          id: "08d2ba2c-b1d2-41ea-9a1b-935236dfc786",
        },
        entries: 9,
      },
      {
        MMR: 1024.71,
        user: {
          discordName: "Cabawa",
          id: "a8a3f5b6-a39c-472e-9d0b-b38a2dd02961",
        },
        entries: 10,
      },
      {
        MMR: 1024.59,
        user: {
          discordName: "Noctis",
          id: "2e0a4ad3-0257-42c5-82b3-fdf58439c7b0",
        },
        entries: 13,
      },
      {
        MMR: 1024.34,
        user: {
          discordName: "A-a ron",
          id: "cb6dd5db-14d5-4c2d-8dfe-8e52770fea0c",
        },
        entries: 13,
      },
      {
        MMR: 1024.18,
        user: {
          discordName: "Kalana",
          id: "b237cb5e-3b8f-4414-9904-eafd3d07c77f",
        },
        entries: 8,
      },
      {
        MMR: 1023.89,
        user: {
          discordName: "Lemon and Lime",
          id: "9646d66e-7b62-4e3b-932b-5d3c41727da7",
        },
        entries: 12,
      },
      {
        MMR: 1023.38,
        user: {
          discordName: "TurtleKame23",
          id: "b0ae3ad0-2cf3-4392-bea0-234f0822ee10",
        },
        entries: 10,
      },
      {
        MMR: 1022.74,
        user: {
          discordName: "Massimo",
          id: "a25e7777-4de0-4e9e-bb51-858c5e91c01f",
        },
        entries: 14,
      },
      {
        MMR: 1022.22,
        user: {
          discordName: "BrushStrokes",
          id: "fa4f5ea8-ee60-4707-aad0-1301651489ec",
        },
        entries: 14,
      },
      {
        MMR: 1022.07,
        user: {
          discordName: "Dally",
          id: "223fa5eb-6f7a-4bd8-9b75-9c2270d588ad",
        },
        entries: 23,
      },
      {
        MMR: 1022.03,
        user: {
          discordName: "fayth",
          id: "6e3ae5c8-c55e-4015-bd73-959e41ba5f7c",
        },
        entries: 13,
      },
      {
        MMR: 1021.94,
        user: {
          discordName: "Narcolepsy",
          id: "70446d2a-6f29-48bd-b9e0-22292c3b7a5b",
        },
        entries: 16,
      },
      {
        MMR: 1021.55,
        user: {
          discordName: "andrewohyeah",
          id: "0c20f9cb-62be-4fb0-9ce2-8a615674c178",
        },
        entries: 8,
      },
      {
        MMR: 1020.9,
        user: {
          discordName: "Icewave",
          id: "268503ba-758a-4a8d-80cf-220302861b7e",
        },
        entries: 8,
      },
      {
        MMR: 1020.83,
        user: {
          discordName: "Salti",
          id: "248a8260-86dd-461e-ab12-a24fec748943",
        },
        entries: 16,
      },
      {
        MMR: 1020.8,
        user: {
          discordName: "Texture",
          id: "e188065f-bda1-480d-87dd-597fe77b312f",
        },
        entries: 8,
      },
      {
        MMR: 1020.74,
        user: {
          discordName: "Priority",
          id: "15ca7558-fa2c-430b-b00b-c55ede4fc8d3",
        },
        entries: 16,
      },
      {
        MMR: 1020.56,
        user: {
          discordName: "Frosh",
          id: "a103097e-67e5-4126-8a74-281391e71bb0",
        },
        entries: 13,
      },
      {
        MMR: 1020.29,
        user: {
          discordName: "Antares",
          id: "9dc7ffd0-fec7-43a1-97b1-62e15ba5570e",
        },
        entries: 28,
      },
      {
        MMR: 1020.25,
        user: {
          discordName: "Majin",
          id: "c9251e2b-d72a-4ace-9956-945f25d6a8e3",
        },
        entries: 11,
      },
      {
        MMR: 1020.13,
        user: {
          discordName: "Nadie",
          id: "5ba7db88-a06f-4e75-b4eb-68fc267f4599",
        },
        entries: 14,
      },
      {
        MMR: 1020.03,
        user: {
          discordName: "Chase247",
          id: "2f167e03-b535-44f8-ab4e-d7e3e630efc4",
        },
        entries: 7,
      },
      {
        MMR: 1019.47,
        user: {
          discordName: "GameBoy4454",
          id: "d1483c89-6a74-4926-b721-3e0fbb86077f",
        },
        entries: 9,
      },
      {
        MMR: 1018.15,
        user: {
          discordName: "_Eco__",
          id: "c59a5471-c1d0-4dad-9796-aba2cb123da1",
        },
        entries: 14,
      },
      {
        MMR: 1017.86,
        user: {
          discordName: "PrazetheSunnyD",
          id: "f3dd63be-605a-439a-b1a6-b8a12d2c9ca6",
        },
        entries: 15,
      },
      {
        MMR: 1017.34,
        user: {
          discordName: "Noob?☆Patツ",
          id: "0927a3ad-aef1-46a9-ab99-0cd0752868e7",
        },
        entries: 15,
      },
      {
        MMR: 1017.15,
        user: {
          discordName: "[B]lack star",
          id: "c19b2dd0-f767-4886-bd9a-c9866795295e",
        },
        entries: 14,
      },
      {
        MMR: 1016.17,
        user: {
          discordName: "X-Naut",
          id: "bec8bcd4-2129-4676-a565-e53059df4ddd",
        },
        entries: 7,
      },
      {
        MMR: 1016.17,
        user: {
          discordName: "JF",
          id: "cd68263e-1c84-4918-a474-981663ab5ee8",
        },
        entries: 7,
      },
      {
        MMR: 1016.17,
        user: {
          discordName: "nymvp",
          id: "84fb99ec-8349-43b4-b3ce-fb627ea79c08",
        },
        entries: 7,
      },
      {
        MMR: 1016.17,
        user: {
          discordName: "Oli-Wan",
          id: "e3791819-9f98-4618-af45-e1a7c8ede8ac",
        },
        entries: 7,
      },
      {
        MMR: 1015.88,
        user: {
          discordName: "rookie",
          id: "74532409-40b4-410b-9fb0-3412d32a1140",
        },
        entries: 10,
      },
      {
        MMR: 1015.25,
        user: {
          discordName: "Mond...",
          id: "1c705482-d9a5-45a1-96e0-48f47164a720",
        },
        entries: 13,
      },
      {
        MMR: 1014.92,
        user: {
          discordName: "Woomy284",
          id: "d414fe01-1c3f-4cb4-9c5b-7adf65c7c6d5",
        },
        entries: 36,
      },
      {
        MMR: 1014.72,
        user: {
          discordName: "Nayeon",
          id: "b04b5903-8d08-4ac5-8257-098547580d21",
        },
        entries: 14,
      },
      {
        MMR: 1014.34,
        user: {
          discordName: "Draco200",
          id: "b83ea915-9e86-4503-92a9-59c0bd50f517",
        },
        entries: 13,
      },
      {
        MMR: 1013.77,
        user: {
          discordName: "Emil",
          id: "987515d0-335d-4cd5-b252-d58cb63a5f0a",
        },
        entries: 14,
      },
      {
        MMR: 1011.87,
        user: {
          discordName: "Dark Flash黒電光石火",
          id: "7ad6b4cb-dfa8-486b-8ff2-51362a9d71ac",
        },
        entries: 11,
      },
      {
        MMR: 1011.15,
        user: {
          discordName: "Skullbutforsendouq",
          id: "fc3451a3-18b7-4a56-91b3-eda96b0556ee",
        },
        entries: 8,
      },
      {
        MMR: 1010.38,
        user: {
          discordName: "Pøke",
          id: "f7c7bd20-9eb8-488d-a43a-64caef529c77",
        },
        entries: 10,
      },
      {
        MMR: 1010.2,
        user: {
          discordName: "Shad",
          id: "1e0438ca-10ae-4b0b-b0ec-30957d0120fd",
        },
        entries: 16,
      },
      {
        MMR: 1010.12,
        user: {
          discordName: "Mr Snekerino",
          id: "8704b017-90ce-48fd-97be-1821034b1628",
        },
        entries: 26,
      },
      {
        MMR: 1009.77,
        user: {
          discordName: "Celly ♪",
          id: "c0a39a13-109d-46d0-b9e3-30cb17383f7d",
        },
        entries: 10,
      },
      {
        MMR: 1009.63,
        user: {
          discordName: "seiko",
          id: "6fcd4b2e-9a04-4a3d-a0e2-1092d00eb58c",
        },
        entries: 10,
      },
      {
        MMR: 1008.84,
        user: {
          discordName: "Asura",
          id: "943ad926-e3d2-4023-8c5e-74fef2b44cd1",
        },
        entries: 7,
      },
      {
        MMR: 1008.78,
        user: {
          discordName: "Fiction",
          id: "2651291a-a63b-4d4e-a09c-fb45e3dba6f3",
        },
        entries: 21,
      },
      {
        MMR: 1007.91,
        user: {
          discordName: "Axiom",
          id: "9553ab02-bd7f-40aa-94d2-0895a834871a",
        },
        entries: 15,
      },
      {
        MMR: 1006.87,
        user: {
          discordName: "Polisno",
          id: "15f42cd2-bb5c-4b87-9020-95250cbb95c4",
        },
        entries: 7,
      },
      {
        MMR: 1006.6,
        user: {
          discordName: "noxraven42",
          id: "357fe55e-ed9e-414c-a84b-a430010554e6",
        },
        entries: 16,
      },
      {
        MMR: 1006.22,
        user: {
          discordName: "epicspy23",
          id: "7ed5ea84-5f8b-4ccb-a344-05e72ef02765",
        },
        entries: 8,
      },
      {
        MMR: 1006.04,
        user: {
          discordName: "Dantheman",
          id: "44e5b0b9-178e-478c-95df-4a7be492446f",
        },
        entries: 11,
      },
      {
        MMR: 1006,
        user: {
          discordName: "Abbγ",
          id: "4ff4f300-e98b-4382-9cf4-770d14561f95",
        },
        entries: 7,
      },
      {
        MMR: 1005.74,
        user: {
          discordName: "KosMos",
          id: "00570a0c-1416-40b4-8288-fca74b742b19",
        },
        entries: 15,
      },
      {
        MMR: 1005.22,
        user: {
          discordName: "Iηkβσσm",
          id: "a82c3c62-c2ff-4bbe-b40f-eb22ba6f80d0",
        },
        entries: 12,
      },
      {
        MMR: 1004.06,
        user: {
          discordName: "LXR",
          id: "8d1cc0a2-3925-45e7-8486-cb373deb5c91",
        },
        entries: 18,
      },
      {
        MMR: 1004.03,
        user: {
          discordName: "Niemand",
          id: "2d26b0a2-98c9-43e6-928a-d54f0a559cb2",
        },
        entries: 12,
      },
      {
        MMR: 1003.88,
        user: {
          discordName: "Captain Happy",
          id: "6cd50ad7-f695-4ff3-8938-4b6f952add91",
        },
        entries: 13,
      },
      {
        MMR: 1003.69,
        user: {
          discordName: "Karbine98к",
          id: "7b71096c-b445-49c3-bf3f-beef882a03a4",
        },
        entries: 16,
      },
      {
        MMR: 1003.51,
        user: {
          discordName: "Mikey",
          id: "1d91a03d-0baa-455d-89b1-bf8722859e4b",
        },
        entries: 24,
      },
      {
        MMR: 1003.49,
        user: {
          discordName: "Admere",
          id: "d60f6b27-d7f2-4a81-955d-79501d3aaa26",
        },
        entries: 9,
      },
      {
        MMR: 1002.71,
        user: {
          discordName: "Chaid",
          id: "fe4d5705-5ce3-4db8-848d-b11ccf34b583",
        },
        entries: 13,
      },
      {
        MMR: 1001.79,
        user: {
          discordName: "--ṨⴙҽẊ--🎍✨🎋",
          id: "9f927ace-0476-4b98-91cd-f47f50fba47f",
        },
        entries: 8,
      },
      {
        MMR: 1001.77,
        user: {
          discordName: "Kaito",
          id: "086fc86d-72e7-47fe-a6cb-72342586027c",
        },
        entries: 21,
      },
      {
        MMR: 1001.55,
        user: {
          discordName: "Iuna",
          id: "0ee1c63a-2b9b-48f2-8ea4-6da35283950d",
        },
        entries: 8,
      },
      {
        MMR: 1001.3,
        user: {
          discordName: "ResistARest",
          id: "66289c68-d9b8-443e-98eb-ec676ead994a",
        },
        entries: 8,
      },
      {
        MMR: 1000.64,
        user: {
          discordName: "Maja",
          id: "557ecdd1-0db3-4af9-8814-efecff53bf39",
        },
        entries: 7,
      },
      {
        MMR: 1000.6,
        user: {
          discordName: "endor",
          id: "5051e8e2-a539-4512-b336-8d9579a04951",
        },
        entries: 25,
      },
      {
        MMR: 1000.56,
        user: {
          discordName: "delta",
          id: "b4174556-6cc8-4e61-88c1-8c29b4494b57",
        },
        entries: 11,
      },
      {
        MMR: 1000.52,
        user: {
          discordName: "Heinzo",
          id: "fdb49c41-d82f-40ad-9aa2-1f416e2ff2f4",
        },
        entries: 8,
      },
      {
        MMR: 1000.24,
        user: {
          discordName: "SigmaS",
          id: "a034fa46-bfb7-49ce-aee3-5696046d9cb6",
        },
        entries: 9,
      },
      {
        MMR: 1000.24,
        user: {
          discordName: "_Fox_",
          id: "65069869-6137-4897-b7ec-8273968cf286",
        },
        entries: 10,
      },
      {
        MMR: 999.42,
        user: {
          discordName: "FuиκyΞv⭆",
          id: "100e6976-3f91-476f-bedd-4c9aaf21a0c4",
        },
        entries: 9,
      },
      {
        MMR: 999.22,
        user: {
          discordName: "4sh",
          id: "a2b76f73-97cf-40d5-8fc9-66c8c1e0eb63",
        },
        entries: 17,
      },
      {
        MMR: 999.05,
        user: {
          discordName: "Barli",
          id: "433f44f9-52a6-4f1e-b9b4-987192471948",
        },
        entries: 8,
      },
      {
        MMR: 998.91,
        user: {
          discordName: "nair",
          id: "cc652ebb-3e34-4546-bea1-28a179db84d2",
        },
        entries: 10,
      },
      {
        MMR: 998.23,
        user: {
          discordName: "Vertigo_95",
          id: "7ea05fd5-15a8-4f4f-956e-1f59b9e99328",
        },
        entries: 7,
      },
      {
        MMR: 997.87,
        user: {
          discordName: "Hungry_Yoshi",
          id: "b30dcab5-b346-4408-b369-56db65a118de",
        },
        entries: 17,
      },
      {
        MMR: 997.84,
        user: {
          discordName: "Elfy 🍉",
          id: "dd4a4c0f-2aa2-48df-9469-f43c3a1c0d0b",
        },
        entries: 15,
      },
      {
        MMR: 997.21,
        user: {
          discordName: "「Fenja」",
          id: "99d76041-1243-448d-8615-5f7cf4522006",
        },
        entries: 11,
      },
      {
        MMR: 996.62,
        user: {
          discordName: "Blockiii",
          id: "54f82f02-cf1b-43d8-9682-a1f5bd4dee89",
        },
        entries: 21,
      },
      {
        MMR: 995.94,
        user: {
          discordName: "Adda",
          id: "30dbd5e7-deca-4b59-9994-ae3c327df295",
        },
        entries: 10,
      },
      {
        MMR: 995.87,
        user: {
          discordName: "Stealth",
          id: "ed87a768-577c-420e-b946-1f67c4a6de5c",
        },
        entries: 19,
      },
      {
        MMR: 995.67,
        user: {
          discordName: "LT",
          id: "3f7a22e3-caf6-4214-a03b-ebe384915947",
        },
        entries: 8,
      },
      {
        MMR: 995.59,
        user: {
          discordName: "Des",
          id: "d9994039-85cc-4520-b2e7-45546221ea0e",
        },
        entries: 11,
      },
      {
        MMR: 995.59,
        user: {
          discordName: "Konradius",
          id: "c853df17-d4aa-45e8-beac-e5d0cb8b7883",
        },
        entries: 11,
      },
      {
        MMR: 994.59,
        user: {
          discordName: "Azpho",
          id: "f071bfb0-1ea8-4291-b1a5-c41396811da6",
        },
        entries: 10,
      },
      {
        MMR: 994.58,
        user: {
          discordName: "jokei ro",
          id: "2202761d-a45a-4605-9a51-97b2f9cb41db",
        },
        entries: 28,
      },
      {
        MMR: 993.7,
        user: {
          discordName: "Ariel",
          id: "0461186b-cba2-48cc-b6f6-7978dd0983a6",
        },
        entries: 29,
      },
      {
        MMR: 992.94,
        user: {
          discordName: "Tracks",
          id: "7cda933d-10ae-438b-a643-bb6f4ae23f0d",
        },
        entries: 15,
      },
      {
        MMR: 991.93,
        user: {
          discordName: "Solenya",
          id: "87802bf7-fc0e-4f6b-bfd7-8e72b99a62a9",
        },
        entries: 11,
      },
      {
        MMR: 991.4,
        user: {
          discordName: "assTin",
          id: "80ac6b12-d544-4244-870c-098ba3525f53",
        },
        entries: 12,
      },
      {
        MMR: 990.88,
        user: {
          discordName: "Neovaii",
          id: "e3c1bf28-49c8-4dea-a6ed-b436b6536f7b",
        },
        entries: 9,
      },
      {
        MMR: 989.8,
        user: {
          discordName: "Zukini",
          id: "97e4f7f7-5a10-441c-802e-168d742e62f6",
        },
        entries: 10,
      },
      {
        MMR: 989.6,
        user: {
          discordName: "Max きかい",
          id: "ca02fc45-7866-4b6a-b30e-542571d2767b",
        },
        entries: 11,
      },
      {
        MMR: 988.97,
        user: {
          discordName: "Kori",
          id: "8324f295-8dde-4235-a30e-828d0494a361",
        },
        entries: 15,
      },
      {
        MMR: 988.96,
        user: {
          discordName: "Kirbay",
          id: "d53ef3c1-3abc-4173-8b2d-35c8c9c21402",
        },
        entries: 12,
      },
      {
        MMR: 988.85,
        user: {
          discordName: "Tug’Ster",
          id: "68477e74-81c1-45bb-b6c5-f759114d492f",
        },
        entries: 25,
      },
      {
        MMR: 988.6,
        user: {
          discordName: "Tobayeru",
          id: "df5f63a7-8c8d-46f5-8b0e-7493d0bc6341",
        },
        entries: 10,
      },
      {
        MMR: 988.57,
        user: {
          discordName: "Zaap",
          id: "97b1cca7-a6e8-488d-adb9-cb4df5cf0c4d",
        },
        entries: 7,
      },
      {
        MMR: 987.02,
        user: {
          discordName: "Prism",
          id: "abd75c85-bf02-414f-9826-3ac7dbf65c7a",
        },
        entries: 9,
      },
      {
        MMR: 986.67,
        user: {
          discordName: "Akira",
          id: "4484d23d-eeb0-49c5-9c5a-599575a93684",
        },
        entries: 16,
      },
      {
        MMR: 986.36,
        user: {
          discordName: "Guigas",
          id: "b2a26840-8966-4412-a96b-f4c76cf6474b",
        },
        entries: 22,
      },
      {
        MMR: 986.24,
        user: {
          discordName: "kugo",
          id: "8ac22d8a-98ea-42a9-9d16-038b6d821476",
        },
        entries: 7,
      },
      {
        MMR: 985.55,
        user: {
          discordName: "Tekineki",
          id: "29ec0361-99d4-40dd-b82c-351e98c8f564",
        },
        entries: 9,
      },
      {
        MMR: 985.24,
        user: {
          discordName: "Yegzu!",
          id: "2f2c4808-8ca2-45e0-b8dd-f707965c7e1c",
        },
        entries: 38,
      },
      {
        MMR: 984.91,
        user: {
          discordName: "Pain",
          id: "74684fb5-e402-4317-8325-2ac9c9283595",
        },
        entries: 7,
      },
      {
        MMR: 984.65,
        user: {
          discordName: "Yuki(mochi)",
          id: "b889c971-ffac-4e6b-a5cd-74e3a115393b",
        },
        entries: 8,
      },
      {
        MMR: 984.57,
        user: {
          discordName: "RandomMaxi",
          id: "e36b419b-b320-449f-acdd-7f03bc64dd7a",
        },
        entries: 12,
      },
      {
        MMR: 984.37,
        user: {
          discordName: "A(💔)Achilles",
          id: "6f5f844a-0fc8-4784-9bd4-1cf41b74550d",
        },
        entries: 11,
      },
      {
        MMR: 982.9,
        user: {
          discordName: ".𝙰𝚔𝚒𝚒𝚋メ🪐",
          id: "cdc642c9-4609-4b02-a324-d978a12c019d",
        },
        entries: 8,
      },
      {
        MMR: 982.25,
        user: {
          discordName: "Ferrarikid",
          id: "fd3cb0ec-34b1-43f6-a9e2-19e225ad56d7",
        },
        entries: 10,
      },
      {
        MMR: 981.72,
        user: {
          discordName: "Kat!",
          id: "0134cb66-d22c-4ceb-ac5d-8133ab577979",
        },
        entries: 8,
      },
      {
        MMR: 981.61,
        user: {
          discordName: "Monaax",
          id: "13d7f1f6-b60d-4680-8f48-c2f88c38e38f",
        },
        entries: 15,
      },
      {
        MMR: 979.52,
        user: {
          discordName: "The Light Jr.",
          id: "73b99a2f-8e5b-4898-aea4-5a2eab4fd996",
        },
        entries: 7,
      },
      {
        MMR: 979.39,
        user: {
          discordName: "[K]",
          id: "9e90f147-7721-4f39-a72c-d68b39ad3d19",
        },
        entries: 38,
      },
      {
        MMR: 978.42,
        user: {
          discordName: "erik361",
          id: "d1b12a4e-ee4d-487d-8095-bb2de18e40f3",
        },
        entries: 13,
      },
      {
        MMR: 978.32,
        user: {
          discordName: "Maskass 05",
          id: "606d9d1b-84f5-4df2-964e-d460cc5dadef",
        },
        entries: 17,
      },
      {
        MMR: 977.33,
        user: {
          discordName: "Kaminator",
          id: "e2c29592-d882-40da-9b50-511325c4862b",
        },
        entries: 8,
      },
      {
        MMR: 976.46,
        user: {
          discordName: "Cat~Lynn",
          id: "3cda1dc4-bcad-4153-ba08-6a5bc048d3e3",
        },
        entries: 10,
      },
      {
        MMR: 976.11,
        user: {
          discordName: "Pololimda",
          id: "8384b35b-4e49-4876-8698-b0d4b2100749",
        },
        entries: 8,
      },
      {
        MMR: 975.62,
        user: {
          discordName: "Lαzloω.",
          id: "5413ee9d-df0c-459d-9881-67b5bae7bc64",
        },
        entries: 33,
      },
      {
        MMR: 975.14,
        user: {
          discordName: "KyuWolf★",
          id: "94628d0c-eb09-4c13-b56f-9ca8de693882",
        },
        entries: 7,
      },
      {
        MMR: 975.14,
        user: {
          discordName: "Klaz",
          id: "00ed43a9-d0af-4e3b-bcdb-061cbdd24d3d",
        },
        entries: 7,
      },
      {
        MMR: 975.14,
        user: {
          discordName: "GueRReiRo_",
          id: "9c4e72f4-07dc-4c86-bcda-5d3d998bbb0a",
        },
        entries: 7,
      },
      {
        MMR: 974.26,
        user: {
          discordName: "Shydow♪",
          id: "5f450030-e570-4bd9-88a5-7c5f597ff90b",
        },
        entries: 8,
      },
      {
        MMR: 973.55,
        user: {
          discordName: "Squidy 7",
          id: "a843ce0a-af94-4d47-a0c8-8affdf94a4d1",
        },
        entries: 14,
      },
      {
        MMR: 972.49,
        user: {
          discordName: "~Kyo~",
          id: "836f45b2-4161-4609-8ec5-fc832fd9b4a6",
        },
        entries: 7,
      },
      {
        MMR: 970.84,
        user: {
          discordName: "Hua",
          id: "3a531e47-8c5b-47f2-a844-efba1eed44c5",
        },
        entries: 8,
      },
      {
        MMR: 970.61,
        user: {
          discordName: "dbone",
          id: "39039041-510c-4d22-b073-ac2d2216ef35",
        },
        entries: 11,
      },
      {
        MMR: 970.47,
        user: {
          discordName: "mask",
          id: "2f595751-5655-4d27-9095-ff9110e7a76d",
        },
        entries: 12,
      },
      {
        MMR: 970.37,
        user: {
          discordName: "StarLuigi",
          id: "f59d1853-88f3-4649-a42b-c632947b9475",
        },
        entries: 15,
      },
      {
        MMR: 970.22,
        user: {
          discordName: "Matthewmega123",
          id: "99f17c2e-6c44-4896-bdf5-d05c024cf2d0",
        },
        entries: 7,
      },
      {
        MMR: 968.92,
        user: {
          discordName: "!AdriPower!",
          id: "75c4817b-efba-4656-8b32-88c6b778d1ef",
        },
        entries: 8,
      },
      {
        MMR: 968.76,
        user: {
          discordName: "Char",
          id: "1aff7098-8580-4191-b008-ae8d935ca164",
        },
        entries: 7,
      },
      {
        MMR: 968.17,
        user: {
          discordName: "Octobaguette",
          id: "76c0c09f-ad5f-49e5-951f-5d85c39f4db9",
        },
        entries: 10,
      },
      {
        MMR: 967.95,
        user: {
          discordName: "JOSEb",
          id: "06d1d635-d774-4118-9cce-b5d9ef96dd84",
        },
        entries: 9,
      },
      {
        MMR: 965.61,
        user: {
          discordName: "Zayuh",
          id: "b05d9bfb-c782-4172-9b23-b48455e86df0",
        },
        entries: 24,
      },
      {
        MMR: 965.56,
        user: {
          discordName: "Nosigma",
          id: "35ad4144-e358-4b05-adea-912dbac9d4ee",
        },
        entries: 9,
      },
      {
        MMR: 965.2,
        user: {
          discordName: "Ninjar04",
          id: "300735b3-4641-412a-b4ed-062e77d4fb41",
        },
        entries: 8,
      },
      {
        MMR: 965.03,
        user: {
          discordName: "Ari",
          id: "9684ad87-3634-42fc-8fb7-53348ad9fe15",
        },
        entries: 9,
      },
      {
        MMR: 964.83,
        user: {
          discordName: "mothman",
          id: "f3fb812e-8ed0-4087-aedf-50c5bde14799",
        },
        entries: 8,
      },
      {
        MMR: 964.83,
        user: {
          discordName: "Mirus",
          id: "c2f6ca45-09ff-4f16-9d72-b4f95174b042",
        },
        entries: 7,
      },
      {
        MMR: 964.39,
        user: {
          discordName: "Hyperstar",
          id: "2777a07c-af77-4b92-be03-8f435c31dd8a",
        },
        entries: 7,
      },
      {
        MMR: 963.59,
        user: {
          discordName: "Loctos",
          id: "bbe74d2e-2337-45f9-97d6-abd57ce78d33",
        },
        entries: 14,
      },
      {
        MMR: 962.62,
        user: {
          discordName: "parias 自殺🥀&❄",
          id: "ba49beaf-da02-4924-8dbb-cbb76c4c6298",
        },
        entries: 8,
      },
      {
        MMR: 962.62,
        user: {
          discordName: "カイト",
          id: "7f7bcc09-24a5-478b-b94b-a9f2263a6336",
        },
        entries: 8,
      },
      {
        MMR: 961.66,
        user: {
          discordName: "LiveMedal",
          id: "dbcce847-6a8e-4aee-a01c-b480a61f3d47",
        },
        entries: 8,
      },
      {
        MMR: 960.9,
        user: {
          discordName: "Eka",
          id: "bcd7106c-eb09-4554-b0a1-269a46c65aa1",
        },
        entries: 7,
      },
      {
        MMR: 960.78,
        user: {
          discordName: "Splat Squid",
          id: "74e3ab0f-b191-435a-979f-e9c8e4f4d03c",
        },
        entries: 12,
      },
      {
        MMR: 959.85,
        user: {
          discordName: "bab",
          id: "6688cd28-a705-4c88-b719-21e9e2c381ec",
        },
        entries: 7,
      },
      {
        MMR: 959.41,
        user: {
          discordName: "KitsuneSen",
          id: "30c3b37f-8acf-4939-9d21-dae50c2a26a5",
        },
        entries: 12,
      },
      {
        MMR: 959.23,
        user: {
          discordName: "horchata",
          id: "5a85d850-34b8-4790-baf6-f4c3c17735d8",
        },
        entries: 9,
      },
      {
        MMR: 958.65,
        user: {
          discordName: "Avrel",
          id: "1d851768-ae84-4332-8e5c-3c544140dda8",
        },
        entries: 9,
      },
      {
        MMR: 957.67,
        user: {
          discordName: "Ang",
          id: "b96be8bf-0dd8-46e2-a7dd-aa153034d1cc",
        },
        entries: 16,
      },
      {
        MMR: 956.89,
        user: {
          discordName: "gibs",
          id: "b8e95f64-d463-4aea-a581-a0a0ee3e628b",
        },
        entries: 10,
      },
      {
        MMR: 956.76,
        user: {
          discordName: "Angel Ais",
          id: "09ae0509-14fc-400a-912b-285b52a9c6cd",
        },
        entries: 11,
      },
      {
        MMR: 956.53,
        user: {
          discordName: "le-Kèv",
          id: "d1f3b738-fd1e-4d33-a5b3-2240f4ee8bdb",
        },
        entries: 8,
      },
      {
        MMR: 952.94,
        user: {
          discordName: "bloody",
          id: "03ab6cb7-1d53-49c5-840d-17913b597af4",
        },
        entries: 13,
      },
      {
        MMR: 952.19,
        user: {
          discordName: "SirSkit",
          id: "bde69039-d604-4d43-9602-47d45f9eb00e",
        },
        entries: 10,
      },
      {
        MMR: 951.61,
        user: {
          discordName: "bgirl_spindagamer",
          id: "62dc7fc6-7652-4201-aedd-10138e811e75",
        },
        entries: 8,
      },
      {
        MMR: 951.29,
        user: {
          discordName: "Shidi.",
          id: "b377c31c-d336-420b-8426-6889133f908c",
        },
        entries: 7,
      },
      {
        MMR: 949.79,
        user: {
          discordName: "Ze Banded",
          id: "b2de6e98-124d-4a58-9e80-4216e5a84ad8",
        },
        entries: 10,
      },
      {
        MMR: 948.61,
        user: {
          discordName: "Tyuster",
          id: "644ec3ae-a111-432e-bd51-e74d92416169",
        },
        entries: 9,
      },
      {
        MMR: 948.18,
        user: {
          discordName: "LeoLion",
          id: "59029149-3672-4125-a425-c5a380b2242f",
        },
        entries: 10,
      },
      {
        MMR: 947.48,
        user: {
          discordName: "Scepidilionz",
          id: "8dce6182-3968-48dc-a88c-11a51210e8db",
        },
        entries: 10,
      },
      {
        MMR: 947.38,
        user: {
          discordName: "SplatDroid",
          id: "c9380acf-bb35-4a7e-a233-b83ce3506697",
        },
        entries: 9,
      },
      {
        MMR: 946.57,
        user: {
          discordName: "Abran",
          id: "ce1bdfad-ded3-40cb-b571-c5914eb69647",
        },
        entries: 10,
      },
      {
        MMR: 945.62,
        user: {
          discordName: "RandomHuman",
          id: "8c3aba06-f878-4700-bd21-06d58259cc7d",
        },
        entries: 9,
      },
      {
        MMR: 944.59,
        user: {
          discordName: "kloud",
          id: "5fa34971-3af1-4339-bddc-bea6076ecc94",
        },
        entries: 8,
      },
      {
        MMR: 942.96,
        user: {
          discordName: "Minawii",
          id: "8b6d2414-ff26-4a75-bdb9-f51a5efd21b1",
        },
        entries: 7,
      },
      {
        MMR: 942,
        user: {
          discordName: "FlingzAmina",
          id: "ebf1ef37-4596-4f98-a8f8-0caab89222f3",
        },
        entries: 8,
      },
      {
        MMR: 940.82,
        user: {
          discordName: "Burgundy (Alex)",
          id: "bc6a5c88-c875-4bbe-b20f-6bab0baf0f02",
        },
        entries: 8,
      },
      {
        MMR: 940.1,
        user: {
          discordName: "Tiger",
          id: "dcb7344b-9427-46ce-902e-f3e34a88469c",
        },
        entries: 10,
      },
      {
        MMR: 938.88,
        user: {
          discordName: "Coffee Reaper",
          id: "35a58e59-65e9-46b7-896f-bdacab820611",
        },
        entries: 7,
      },
      {
        MMR: 937.78,
        user: {
          discordName: "SPECT",
          id: "a1bf648d-ae5e-456b-b5bc-f1b14ac07af8",
        },
        entries: 32,
      },
      {
        MMR: 937.4,
        user: {
          discordName: "𝕂𝕚𝕣𝕖𝕥𝕤𝕦 きれつ S15",
          id: "b61a8dc5-4c53-4789-87bb-48a10656b8a2",
        },
        entries: 7,
      },
      {
        MMR: 935.4,
        user: {
          discordName: "BeastMode",
          id: "023332a0-93de-4510-ba8e-44b55d8273ad",
        },
        entries: 7,
      },
      {
        MMR: 933.04,
        user: {
          discordName: "YariKu",
          id: "0ead2282-85cb-4573-9f15-6a37c7c7781c",
        },
        entries: 12,
      },
      {
        MMR: 931.4,
        user: {
          discordName: "Darfe",
          id: "699fa220-340b-4041-8852-6fb35ffb3243",
        },
        entries: 14,
      },
      {
        MMR: 930.52,
        user: {
          discordName: "Korosen",
          id: "8ea3f0b8-4b18-4d11-8a99-6bfacde007b3",
        },
        entries: 8,
      },
      {
        MMR: 930.05,
        user: {
          discordName: "Kinopio",
          id: "9d2ba859-24eb-4c21-87ff-c899ac009e59",
        },
        entries: 7,
      },
      {
        MMR: 930.04,
        user: {
          discordName: "Timoth|",
          id: "18191c6c-f31b-46b3-98a2-22e0e6e84865",
        },
        entries: 22,
      },
      {
        MMR: 928.23,
        user: {
          discordName: "Shads",
          id: "7c4f9f54-5d6c-460d-9d27-0c90c846d260",
        },
        entries: 7,
      },
      {
        MMR: 927.34,
        user: {
          discordName: "Bradley",
          id: "86405db7-165b-48d0-bb35-ebab87aef114",
        },
        entries: 15,
      },
      {
        MMR: 927.14,
        user: {
          discordName: "AEQUOR",
          id: "388b4f61-3d2d-43c7-acea-e9b646d5ffa6",
        },
        entries: 11,
      },
      {
        MMR: 926.93,
        user: {
          discordName: "Brandon32204",
          id: "85abfbbe-d862-4cb1-9cbd-2ff5176a2a8d",
        },
        entries: 11,
      },
      {
        MMR: 926.73,
        user: {
          discordName: "Astra",
          id: "296b973d-2b3f-45c3-a608-ddcce394af08",
        },
        entries: 10,
      },
      {
        MMR: 924.02,
        user: {
          discordName: "strata_gem",
          id: "644cd895-6e5a-4151-ac5e-37ab5859b627",
        },
        entries: 11,
      },
      {
        MMR: 921.75,
        user: {
          discordName: "Mellow",
          id: "f04e5cbd-1840-4510-a02b-c26d1b1a064c",
        },
        entries: 7,
      },
      {
        MMR: 918.24,
        user: {
          discordName: "Star",
          id: "48463e5b-ad8a-4181-9c16-0e7d5fd009ad",
        },
        entries: 8,
      },
      {
        MMR: 910.2,
        user: {
          discordName: "Shallow",
          id: "3e501e8e-86b8-4ab4-8265-72a02114b46e",
        },
        entries: 8,
      },
      {
        MMR: 909.69,
        user: {
          discordName: "Draco λ",
          id: "2b98cf04-b742-47d2-86af-b59014bbb8d0",
        },
        entries: 11,
      },
      {
        MMR: 907.16,
        user: {
          discordName: "Templar",
          id: "0a92feaf-9ec1-4008-a8d6-995692a5fc70",
        },
        entries: 7,
      },
      {
        MMR: 892.51,
        user: {
          discordName: "KoronaBeer",
          id: "36f1c1f7-feae-4097-a0c0-b3b9ba36c18f",
        },
        entries: 11,
      },
      {
        MMR: 877.47,
        user: {
          discordName: "rally",
          id: "c731d01d-d08e-4e62-b5be-98bece91d2e3",
        },
        entries: 10,
      },
    ],
  };
}
