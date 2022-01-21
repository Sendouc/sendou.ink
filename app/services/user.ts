import * as TrustRelationship from "~/models/TrustRelationship.server";

export const getTrustingUsers = TrustRelationship.findManyByTrustReceiverId;
