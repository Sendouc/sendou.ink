import { Box, Button, Grid } from "@chakra-ui/react";
import MyLink from "components/common/MyLink";
import BeautifulDrawingOfBorzoic from "components/layout/BeautifulDrawingByBorzoic";
import NavButtons from "components/layout/NavButtons";

const HomePage = () => {
  return (
    <>
      <Grid templateColumns="1fr 1fr">
        <BeautifulDrawingOfBorzoic type="boy" />
        <BeautifulDrawingOfBorzoic type="girl" />
      </Grid>
      <Box textAlign="center" mt={10} mb={8}>
        The goal of sendou.ink is to provide useful tools and resources for
        Splatoon players. It&apos;s an{" "}
        <MyLink isExternal href="https://github.com/Sendouc/sendou.ink">
          open source project
        </MyLink>{" "}
        by{" "}
        <MyLink isExternal href="https://sendou.cc/">
          Sendou
        </MyLink>{" "}
        and <MyLink href="/about">contributors</MyLink>. To explore what you can
        do on the site you can check out a{" "}
        <MyLink isExternal href="https://www.youtube.com/watch?v=kQbvez9QnHc">
          tour video made by Chara
        </MyLink>
        .
      </Box>
      <NavButtons />
    </>
  );
};

export default HomePage;
