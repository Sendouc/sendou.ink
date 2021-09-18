import { Button } from "@chakra-ui/button";
import { Box, Flex } from "@chakra-ui/layout";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans } from "@lingui/macro";
import MyLink from "components/common/MyLink";
import SubText from "components/common/SubText";
import UserAvatar from "components/common/UserAvatar";
import { useMutation } from "hooks/common";
import type { SuggestionsGet } from "pages/api/plus/suggestions";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";
import { getVotingRange } from "utils/plus";
import { getFullUsername } from "utils/strings";
import { Unpacked } from "utils/types";
import {
  resuggestionSchema,
  SUGGESTION_DESCRIPTION_LIMIT,
} from "utils/validators/suggestion";
import * as z from "zod";

type SuggestionsData = z.infer<typeof resuggestionSchema>;

const Suggestion = ({
  suggestion,
  canSuggest,
}: {
  suggestion: Unpacked<SuggestionsGet>;
  canSuggest: boolean;
}) => {
  const [showTextarea, setShowTextarea] = useState(false);
  const { handleSubmit, errors, register, watch } = useForm<SuggestionsData>({
    resolver: zodResolver(resuggestionSchema),
  });
  const { mutate } = useSWRConfig();

  const suggestionMutation = useMutation<SuggestionsData>({
    url: "/api/plus/suggestions",
    method: "POST",
    successToastMsg: "Comment added",
    afterSuccess: () => {
      mutate("/api/plus/suggestions");
      setShowTextarea(false);
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
              suggestionMutation.mutate({
                ...values,
                // @ts-expect-error region doesn't matter as it is not updated after the first suggestion
                region: "NA" as const,
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
              isLoading={suggestionMutation.isMutating}
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
