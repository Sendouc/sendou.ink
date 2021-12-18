import * as TrustRelationship from "~/models/TrustRelationship";

export const getTrustingUsers = TrustRelationship.findManyByTrustReceiverId;
