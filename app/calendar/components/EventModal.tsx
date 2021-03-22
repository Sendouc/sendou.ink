import { Button } from "@chakra-ui/button";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Flex } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { t, Trans } from "@lingui/macro";
import { useForm } from "react-hook-form";
import { FiTrash } from "react-icons/fi";
import { eventSchema } from "utils/validators/event";
import * as z from "zod";

type FormData = z.infer<typeof eventSchema>;

export function EventModal({
  onClose,
  event,
}: {
  onClose: () => void;
  event: boolean;
}) {
  const { handleSubmit, errors, register, watch, control } = useForm<FormData>({
    resolver: zodResolver(eventSchema),
    // defaultValues: {
    //   headAbilities: ([
    //     "UNKNOWN",
    //     "UNKNOWN",
    //     "UNKNOWN",
    //     "UNKNOWN",
    //   ] as unknown) as Ability[],
    //   clothingAbilities: ([
    //     "UNKNOWN",
    //     "UNKNOWN",
    //     "UNKNOWN",
    //     "UNKNOWN",
    //   ] as unknown) as Ability[],
    //   shoesAbilities: ([
    //     "UNKNOWN",
    //     "UNKNOWN",
    //     "UNKNOWN",
    //     "UNKNOWN",
    //   ] as unknown) as Ability[],
    //   weapon: weapons.includes(weaponFromQuery as any)
    //     ? weaponFromQuery
    //     : undefined,
    //   ...build,
    // },
  });

  const onSubmit = (values: any) => {
    console.log(values);
  };

  const onDelete = async () => {
    console.log("delete");
  };

  return (
    <Modal isOpen onClose={onClose} size="xl" closeOnOverlayClick={false}>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            {event ? (
              <Trans>Editing event</Trans>
            ) : (
              <Trans>Adding a new event</Trans>
            )}
          </ModalHeader>
          <ModalCloseButton borderRadius="50%" />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody pb={6}>
              {event && (
                <Button
                  leftIcon={<FiTrash />}
                  variant="outline"
                  color="red.500"
                  mb={6}
                  //isLoading={deleting}
                  onClick={async () => {
                    if (window.confirm(t`Delete the event?`)) await onDelete();
                  }}
                >
                  <Trans>Delete build</Trans>
                </Button>
              )}
              <FormLabel htmlFor="name">
                <Trans>Name</Trans>
              </FormLabel>

              <FormControl isInvalid={!!errors.name}>
                <Input name="name" ref={register} />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormLabel htmlFor="date" mt={4}>
                <Trans>Date</Trans>
              </FormLabel>

              <FormControl isInvalid={!!errors.date}>
                <Flex>
                  <Input ref={register} type="date" mr={2} />
                  <Input ref={register} type="time" ml={2} />
                </Flex>
                <FormHelperText>
                  <Trans>Input the time in your local time zone:</Trans>{" "}
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </FormHelperText>
                <FormErrorMessage>{errors.date}</FormErrorMessage>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} type="submit" /*isLoading={sending}*/>
                <Trans>Save</Trans>
              </Button>
              <Button onClick={onClose} variant="outline">
                <Trans>Cancel</Trans>
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
}
