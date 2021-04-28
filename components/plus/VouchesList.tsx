import { Button } from "@chakra-ui/button";
import { Box, Grid } from "@chakra-ui/layout";
import MyLink from "components/common/MyLink";
import { Fragment, useState } from "react";
import { PlusStatuses } from "services/plus";
import { getFullUsername } from "utils/strings";

const VouchesList = ({ vouches }: { vouches: PlusStatuses }) => {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button onClick={() => setShow(!show)} size="sm" variant="outline">
        {show ? "Hide vouches" : <>Show {vouches.length} vouches</>}
      </Button>
      <Grid
        mt={4}
        fontSize="sm"
        maxW="24rem"
        templateColumns="1fr 1fr 1fr"
        gridRowGap="0.25rem"
        placeItems="center"
      >
        {show &&
          vouches.map((vouch) => {
            return (
              <Fragment key={vouch.user.id}>
                <MyLink href={`/u/${vouch.user.discordId}`}>
                  {getFullUsername(vouch.user)}
                </MyLink>
                <Box>to +{vouch.vouchTier} by</Box>
                <MyLink href={`/u/${vouch.voucher!.discordId}`}>
                  {getFullUsername(vouch.voucher!)}
                </MyLink>
              </Fragment>
            );
          })}
      </Grid>
    </>
  );
};

export default VouchesList;
