import { z } from "zod";
import { ModeSchema } from "~/validators/mode";

export function mapPoolForTest() {
  const mapPool: unknown = JSON.parse(
    `[{"id":923,"mode":"TC","name":"The Reef"},{"id":925,"mode":"CB","name":"The Reef"},{"id":927,"mode":"SZ","name":"Musselforge Fitness"},{"id":929,"mode":"RM","name":"Musselforge Fitness"},{"id":934,"mode":"RM","name":"Starfish Mainstage"},{"id":942,"mode":"SZ","name":"Inkblot Art Academy"},{"id":943,"mode":"TC","name":"Inkblot Art Academy"},{"id":947,"mode":"SZ","name":"Sturgeon Shipyard"},{"id":948,"mode":"TC","name":"Sturgeon Shipyard"},{"id":953,"mode":"TC","name":"Moray Towers"},{"id":959,"mode":"RM","name":"Port Mackerel"},{"id":960,"mode":"CB","name":"Port Mackerel"},{"id":972,"mode":"SZ","name":"Snapper Canal"},{"id":978,"mode":"TC","name":"Blackbelly Skatepark"},{"id":980,"mode":"CB","name":"Blackbelly Skatepark"},{"id":985,"mode":"CB","name":"MakoMart"},{"id":987,"mode":"SZ","name":"Walleye Warehouse"},{"id":988,"mode":"TC","name":"Walleye Warehouse"},{"id":994,"mode":"RM","name":"Shellendorf Institute"},{"id":995,"mode":"CB","name":"Shellendorf Institute"},{"id":1007,"mode":"SZ","name":"Piranha Pit"},{"id":1012,"mode":"SZ","name":"Camp Triggerfish"},{"id":1019,"mode":"RM","name":"Wahoo World"},{"id":1020,"mode":"CB","name":"Wahoo World"},{"id":1027,"mode":"SZ","name":"Ancho-V Games"},{"id":1034,"mode":"RM","name":"Skipper Pavilion"}]`
  );

  const mapPoolParsed = z
    .array(z.object({ id: z.number(), mode: ModeSchema, name: z.string() }))
    .parse(mapPool);
  return mapPoolParsed;
}
