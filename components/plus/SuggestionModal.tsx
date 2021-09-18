import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import UserSelector from "components/common/UserSelector";
import { useMutation } from "hooks/common";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { mutate } from "swr";
import {
  suggestionFullSchema,
  SUGGESTION_DESCRIPTION_LIMIT,
} from "utils/validators/suggestion";
import * as z from "zod";

interface Props {
  userPlusMembershipTier: number;
}

type SuggestionsData = z.infer<typeof suggestionFullSchema>;

const SuggestionModal: React.FC<Props> = ({ userPlusMembershipTier }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { handleSubmit, errors, register, watch, control } =
    useForm<SuggestionsData>({
      resolver: zodResolver(suggestionFullSchema),
    });

  const suggestionMutation = useMutation<SuggestionsData>({
    url: "/api/plus/suggestions",
    method: "POST",
    successToastMsg: "New suggestion submitted",
    afterSuccess: () => {
      mutate("/api/plus/suggestions");
      setIsOpen(false);
    },
  });

  const watchDescription = watch("description", "");

  return (
    <>
      <Button
        size="sm"
        mb={4}
        onClick={() => setIsOpen(true)}
        data-cy="suggestion-button"
      >
        Add new suggestion
      </Button>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          size="xl"
          closeOnOverlayClick={false}
        >
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>Adding a new suggestion</ModalHeader>
              <ModalCloseButton borderRadius="50%" />
              <form
                onSubmit={handleSubmit((data) =>
                  suggestionMutation.mutate(data)
                )}
              >
                <ModalBody pb={2}>
                  <FormLabel>Tier</FormLabel>
                  <Controller
                    name="tier"
                    control={control}
                    defaultValue={userPlusMembershipTier}
                    render={({ value, onChange }) => (
                      <Select
                        value={value}
                        onChange={(e) => onChange(Number(e.target.value))}
                      >
                        {userPlusMembershipTier === 1 && (
                          <option value="1">+1</option>
                        )}
                        {userPlusMembershipTier <= 2 && (
                          <option value="2">+2</option>
                        )}
                        <option value="3">+3</option>
                      </Select>
                    )}
                  />

                  <FormControl isInvalid={!!errors.suggestedId}>
                    <FormLabel mt={4}>User</FormLabel>
                    <Controller
                      name="suggestedId"
                      control={control}
                      render={({ value, onChange }) => (
                        <UserSelector
                          value={value}
                          setValue={onChange}
                          isMulti={false}
                          maxMultiCount={undefined}
                        />
                      )}
                    />
                    <FormErrorMessage>
                      {errors.suggestedId?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel mt={4}>Region</FormLabel>
                    <Select
                      name="region"
                      ref={register}
                      data-cy="region-select"
                    >
                      <option value="NA">NA</option>
                      <option value="EU">EU</option>
                    </Select>
                    <FormHelperText>
                      If the player isn&apos;t from either region then choose
                      the one they play most commonly with.
                    </FormHelperText>
                  </FormControl>

                  <FormControl isInvalid={!!errors.description}>
                    <FormLabel htmlFor="description" mt={4}>
                      Description
                    </FormLabel>
                    <Textarea
                      name="description"
                      ref={register}
                      data-cy="description-textarea"
                    />
                    <FormHelperText>
                      {(watchDescription ?? "").length}/
                      {SUGGESTION_DESCRIPTION_LIMIT}
                    </FormHelperText>
                    <FormErrorMessage>
                      {errors.description?.message}
                    </FormErrorMessage>
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Button
                    mr={3}
                    type="submit"
                    isLoading={suggestionMutation.isMutating}
                    data-cy="submit-button"
                  >
                    Save
                  </Button>
                  <Button onClick={() => setIsOpen(false)} variant="outline">
                    Cancel
                  </Button>
                </ModalFooter>
              </form>
            </ModalContent>
          </ModalOverlay>
        </Modal>
      )}
    </>
  );
};

export default SuggestionModal;
