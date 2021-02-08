import { Container, ContainerProps } from "@chakra-ui/react";

interface Props {
  children: React.ReactNode;
  wide?: boolean;
}

const MyContainer: React.FC<Props & ContainerProps> = ({
  children,
  wide = false,
  ...props
}) => (
  <Container maxW={wide ? "100ch" : "75ch"} {...props}>
    {children}
  </Container>
);
export default MyContainer;
