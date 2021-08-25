import { Button } from "@chakra-ui/button";
import { Box, Flex } from "@chakra-ui/layout";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans } from "@lingui/macro";
import MyLink from "components/common/MyLink";
import SubText from "components/common/SubText";
import UserAvatar from "components/common/UserAvatar";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Suggestions } from "services/plus";
import { getToastOptions } from "utils/objects";
import { getVotingRange } from "utils/plus";
import { getFullUsername } from "utils/strings";
import { trpc } from "utils/trpc";
import { Unpacked } from "utils/types";
import {
  resuggestionSchema,
  SUGGESTION_DESCRIPTION_LIMIT,
} from "utils/validators/suggestion";
import * as z from "zod";

type FormData = z.infer<typeof resuggestionSchema>;

const Suggestion = ({
  suggestion,
  canSuggest,
}: {
  suggestion: Unpacked<Suggestions>;
  canSuggest: boolean;
}) => {
  const toast = useToast();
  const [showTextarea, setShowTextarea] = useState(false);
  const { handleSubmit, errors, register, watch } = useForm<FormData>({
    resolver: zodResolver(resuggestionSchema),
  });
  const utils = trpc.useQueryUtils();

  const { mutate, status } = trpc.useMutation("plus.suggestion", {
    onSuccess() {
      toast(getToastOptions("Comment added", "success"));
      // TODO:
      utils.invalidateQuery(["plus.suggestions"]);
      setShowTextarea(false);
    },
    onError(error) {
      toast(getToastOptions(error.message, "error"));
    },
  });

  const watchDescription = watch("description", "");

  return (
    <Box as="section" my={8}>
      <Flex alignItems="center" fontWeight="bold" fontSize="1.25rem">
        <UserAvatar user={suggestion.suggestedUser} mr={3} />
        <MyLink
          href={`/u/${suggestion.suggestedUser.discordId}`}
          isColored={false}
        >
          {getFullUsername(suggestion.suggestedUser)}
        </MyLink>
      </Flex>
      <Box>
        <SubText mt={4}>+{suggestion.tier}</SubText>
        <Box mt={4} fontSize="sm">
          &quot;{suggestion.description}&quot; -{" "}
          <MyLink href={`/u/${suggestion.suggesterUser.discordId}`}>
            {getFullUsername(suggestion.suggesterUser)}
          </MyLink>
          <Text as="i" fontSize="xs">
            {" "}
            ({new Date(suggestion.createdAt).toLocaleString("en")})
          </Text>
        </Box>
        {suggestion.resuggestions?.map((resuggestion) => {
          return (
            <Box key={resuggestion.suggesterUser.id} mt={4} fontSize="sm">
              &quot;{resuggestion.description}&quot; -{" "}
              <MyLink href={`/u/${resuggestion.suggesterUser.discordId}`}>
                {getFullUsername(resuggestion.suggesterUser)}
              </MyLink>
              <Text as="i" fontSize="xs">
                {" "}
                ({new Date(resuggestion.createdAt).toLocaleString("en")})
              </Text>
            </Box>
          );
        })}
        {canSuggest && !showTextarea && !getVotingRange().isHappening && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTextarea(!showTextarea)}
            mt={4}
            data-cy="comment-button"
          >
            Add comment
          </Button>
        )}
        {showTextarea && (
          <form
            onSubmit={handleSubmit((values) =>
              mutate({
                ...values,
                // region doesn't matter as it is not updated after the first suggestion
                region: "NA",
                tier: suggestion.tier,
                suggestedId: suggestion.suggestedUser.id,
              })
            )}
          >
            <FormControl isInvalid={!!errors.description}>
              <FormLabel htmlFor="description" mt={4}>
                Comment to suggestion
              </FormLabel>
              <Textarea
                name="description"
                ref={register}
                data-cy="comment-textarea"
              />
              <FormHelperText mb={4}>
                {(watchDescription ?? "").length}/{SUGGESTION_DESCRIPTION_LIMIT}
              </FormHelperText>
              <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
            </FormControl>
            <Button
              size="sm"
              mr={3}
              type="submit"
              isLoading={status === "loading"}
              data-cy="submit-button"
            >
              <Trans>Save</Trans>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowTextarea(false)}
              variant="outline"
            >
              <Trans>Cancel</Trans>
            </Button>
          </form>
        )}
      </Box>
    </Box>
  );
};

export default Suggestion;
