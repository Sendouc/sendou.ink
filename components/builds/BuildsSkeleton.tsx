import { Flex, Skeleton } from "@chakra-ui/react";

const BuildsSkeleton = () => (
  <Flex flexWrap="wrap" justifyContent="center" mt={4}>
    <Skeleton
      w="300px"
      height="500px"
      rounded="lg"
      boxShadow="md"
      p="20px"
      m={2}
    />
    <Skeleton
      w="300px"
      height="500px"
      rounded="lg"
      boxShadow="md"
      p="20px"
      m={2}
    />
    <Skeleton
      w="300px"
      height="500px"
      rounded="lg"
      boxShadow="md"
      p="20px"
      m={2}
    />
    <Skeleton
      w="300px"
      height="500px"
      rounded="lg"
      boxShadow="md"
      p="20px"
      m={2}
    />
  </Flex>
);

export default BuildsSkeleton;
