import {
  Button,
  Modal,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Textarea,
  FormHelperText,
  FormErrorMessage,
  Select,
} from "@chakra-ui/react";
import { Trans, t } from "@lingui/macro";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  suggestionSchema,
  SUGGESTION_DESCRIPTION_LIMIT,
} from "lib/validators/suggestion";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import UserSelector from "components/common/UserSelector";

interface Props {
  canVouch: boolean;
  canSuggest: boolean;
  userPlusTier: number;
}

type FormData = z.infer<typeof suggestionSchema>;

const SuggestionVouchModal: React.FC<Props> = ({
  canVouch,
  canSuggest,
  userPlusTier,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const sending = false; //usemutation hook
  const { handleSubmit, errors, register, watch, control } = useForm<FormData>({
    resolver: zodResolver(suggestionSchema),
  });

  const watchDescription = watch("description", "");

  if (!canVouch && !canSuggest) return null;

  const getButtonText = () => {
    if (canSuggest && canVouch) return t`Add new suggestion or vouch`;
    if (canVouch) return t`Vouch`;

    return t`Add new suggestion`;
  };

  return (
    <>
      <Button size="sm" mb={4} onClick={() => setIsOpen(true)}>
        {getButtonText()}
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
              <ModalHeader>
                <Trans>Adding a new suggestion or vouch</Trans>
              </ModalHeader>
              <ModalCloseButton borderRadius="50%" />
              <form>
                <ModalBody pb={2}>
                  <FormLabel>
                    <Trans>Tier</Trans>
                  </FormLabel>
                  <Controller
                    name="tier"
                    control={control}
                    defaultValue={1}
                    render={({ value, onChange }) => (
                      <Select
                        value={value}
                        onChange={(e) => onChange(Number(e.target.value))}
                      >
                        {userPlusTier === 1 && <option value="1">+1</option>}
                        {userPlusTier <= 2 && <option value="2">+2</option>}
                        {false && <option value="3">+3</option>}
                      </Select>
                    )}
                  />
                  <FormLabel mt={4}>
                    <Trans>User</Trans>
                  </FormLabel>
                  <Controller
                    name="suggestedUserId"
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
                  <FormControl isInvalid={!!errors.description}>
                    <FormLabel htmlFor="description" mt={4}>
                      <Trans>Description</Trans>
                    </FormLabel>
                    <Textarea name="description" ref={register} />
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
                  <Button mr={3} type="submit" isLoading={sending}>
                    <Trans>Save</Trans>
                  </Button>
                  <Button onClick={() => setIsOpen(false)} variant="outline">
                    <Trans>Cancel</Trans>
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

export default SuggestionVouchModal;
