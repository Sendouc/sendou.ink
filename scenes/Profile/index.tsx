import { GetUserByIdentifierQuery } from "generated/graphql";

interface ProfileProps {}

interface Props {
  user: NonNullable<GetUserByIdentifierQuery["getUserByIdentifier"]>;
}

const Profile: React.FC<Props> = ({ user }) => {
  console.log({ user });
  return <>hello from profile</>;
};

export default Profile;
