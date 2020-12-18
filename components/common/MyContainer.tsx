import { Container } from "@chakra-ui/react";

interface Props {
  children: React.ReactNode;
  wide?: boolean;
}

const MyContainer: React.FC<Props> = ({ children, wide = false }) => (
  <Container maxW={wide ? "100ch" : "75ch"}>{children}</Container>
);
export default MyContainer;
