import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { t, Trans } from "@lingui/macro";
import { Ability } from "@prisma/client";
import ViewSlots from "components/builds/ViewSlots";
import MySelect from "components/common/MySelect";
import WeaponSelector from "components/common/WeaponSelector";
import { getToastOptions } from "lib/getToastOptions";
import { gear } from "lib/lists/gear";
import { sendData } from "lib/postData";
import { Unpacked } from "lib/types";
import useUser from "lib/useUser";
import {
  buildSchema,
  DESCRIPTION_CHARACTER_LIMIT,
  TITLE_CHARACTER_LIMIT,
} from "lib/validators/build";
import { GetBuildsByUserData } from "prisma/queries/getBuildsByUser";
import { Fragment, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { mutate } from "swr";
import * as z from "zod";
import AbilitiesSelector from "./AbilitiesSelector";

interface Props {
  onClose: () => void;
  build?: Unpacked<NonNullable<GetBuildsByUserData>>;
}

type FormData = z.infer<typeof buildSchema>;

const BuildModal: React.FC<Props> = ({ onClose, build }) => {
  const [sending, setSending] = useState(false);
  const [loggedInUser] = useUser();

  const { handleSubmit, errors, register, watch, control } = useForm<FormData>({
    resolver: zodResolver(buildSchema),
    defaultValues: {
      headAbilities: ([
        "UNKNOWN",
        "UNKNOWN",
        "UNKNOWN",
        "UNKNOWN",
      ] as unknown) as Ability[],
      clothingAbilities: ([
        "UNKNOWN",
        "UNKNOWN",
        "UNKNOWN",
        "UNKNOWN",
      ] as unknown) as Ability[],
      shoesAbilities: ([
        "UNKNOWN",
        "UNKNOWN",
        "UNKNOWN",
        "UNKNOWN",
      ] as unknown) as Ability[],
      ...build,
    },
  });

  const watchTitle = watch("title", build?.title ?? "");
  const watchDescription = watch("description", build?.description ?? "");

  const toast = useToast();

  const onSubmit = async (formData: FormData) => {
    setSending(true);
    const mutationData = { ...formData };

    for (const [key, value] of Object.entries(mutationData)) {
      if (value === "" || value === undefined) {
        // @ts-ignore
        mutationData[key] = null;
      }
    }

    const success = await sendData(
      build ? "PUT" : "POST",
      "/api/builds",
      build ? { ...mutationData, id: build.id } : mutationData
    );
    setSending(false);
    if (!success) return;

    if (!loggedInUser) throw Error("unexpected no logged in user");
    mutate(`/api/users/${loggedInUser.id}/builds`);

    toast(
      getToastOptions(build ? t`Build updated` : t`New build added`, "success")
    );
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} size="xl" closeOnOverlayClick={false}>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            {build ? (
              <Trans>Editing build</Trans>
            ) : (
              <Trans>Adding a new build</Trans>
            )}
          </ModalHeader>
          <ModalCloseButton borderRadius="50%" />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody pb={6}>
              <FormLabel htmlFor="weapon">
                <Trans>Weapon</Trans>
              </FormLabel>

              <FormControl isInvalid={!!errors.weapon}>
                <Controller
                  name="weapon"
                  control={control}
                  defaultValue={null}
                  render={({ onChange, value }) => (
                    <WeaponSelector
                      name="weapon"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                <FormErrorMessage>
                  {t`Choose a weapon for your build`}
                </FormErrorMessage>
              </FormControl>

              {/* yeah....... didn't find an easier way to do this with the library so here we are */}
              <FormControl
                isInvalid={
                  !!errors.headAbilities ||
                  !!errors.clothingAbilities ||
                  !!errors.shoesAbilities
                }
              >
                <Controller
                  name="headAbilities"
                  control={control}
                  render={({
                    onChange: onHeadChange,
                    value: headAbilities,
                  }) => (
                    <Controller
                      name="clothingAbilities"
                      control={control}
                      render={({
                        onChange: onClothingChange,
                        value: clothingAbilities,
                      }) => (
                        <Controller
                          name="shoesAbilities"
                          control={control}
                          render={({
                            onChange: onShoesChange,
                            value: shoesAbilities,
                          }) => (
                            <Box mt={4}>
                              <ViewSlots
                                abilities={{
                                  headAbilities,
                                  clothingAbilities,
                                  shoesAbilities,
                                }}
                                onAbilityClick={(gear, index) => {
                                  const abilityArrays = {
                                    headAbilities,
                                    clothingAbilities,
                                    shoesAbilities,
                                  };

                                  const onChange = {
                                    headAbilities: onHeadChange,
                                    clothingAbilities: onClothingChange,
                                    shoesAbilities: onShoesChange,
                                  };

                                  const newAbilityArray = {
                                    ...abilityArrays[gear],
                                  };

                                  newAbilityArray[index] = "UNKNOWN";
                                  onChange[gear](newAbilityArray);
                                }}
                              />
                              <AbilitiesSelector
                                abilities={{
                                  headAbilities,
                                  clothingAbilities,
                                  shoesAbilities,
                                }}
                                setAbilities={(newAbilities) => {
                                  onHeadChange(newAbilities.headAbilities);
                                  onClothingChange(
                                    newAbilities.clothingAbilities
                                  );
                                  onShoesChange(newAbilities.shoesAbilities);
                                }}
                              />
                            </Box>
                          )}
                        />
                      )}
                    />
                  )}
                />
                <FormErrorMessage mx="auto">{t`Your build is missing some abilities`}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.title}>
                <FormLabel htmlFor="title" mt={4}>
                  <Trans>Title</Trans>
                </FormLabel>
                <Input name="title" ref={register} />
                <FormHelperText>
                  {watchTitle!.length}/{TITLE_CHARACTER_LIMIT}
                </FormHelperText>
                <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel htmlFor="description" mt={4}>
                  <Trans>Description</Trans>
                </FormLabel>
                <Textarea name="description" ref={register} />
                <FormHelperText>
                  {watchDescription!.length}/{DESCRIPTION_CHARACTER_LIMIT}
                </FormHelperText>
                <FormErrorMessage>
                  {errors.description?.message}
                </FormErrorMessage>
              </FormControl>

              <FormLabel htmlFor="headGear" mt={4}>
                <Trans>Head</Trans>
              </FormLabel>
              <Controller
                name="headGear"
                control={control}
                defaultValue=""
                render={({ onChange, value, name }) => (
                  <MySelect
                    placeholder={t`Select gear (head)`}
                    name={name}
                    value={value}
                    setValue={onChange}
                  >
                    {gear.map(({ brand, head }) => (
                      <Fragment key={brand}>
                        <optgroup>{brand}</optgroup>
                        {head.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </Fragment>
                    ))}
                  </MySelect>
                )}
              />

              <FormLabel htmlFor="clothingGear" mt={4}>
                <Trans>Clothing</Trans>
              </FormLabel>
              <Controller
                name="clothingGear"
                control={control}
                defaultValue=""
                render={({ onChange, value, name }) => (
                  <MySelect
                    placeholder={t`Select gear (clothing)`}
                    name={name}
                    value={value}
                    setValue={onChange}
                  >
                    {gear.map(({ brand, clothing }) => (
                      <Fragment key={brand}>
                        <optgroup>{brand}</optgroup>
                        {clothing.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </Fragment>
                    ))}
                  </MySelect>
                )}
              />

              <FormLabel htmlFor="shoesGear" mt={4}>
                <Trans>Shoes</Trans>
              </FormLabel>
              <Controller
                name="shoesGear"
                control={control}
                defaultValue=""
                render={({ onChange, value, name }) => (
                  <MySelect
                    placeholder={t`Select gear (shoes)`}
                    name={name}
                    value={value}
                    setValue={onChange}
                  >
                    {gear
                      .filter((brand) => brand.shoes.length > 0)
                      .map(({ brand, shoes }) => (
                        <Fragment key={brand}>
                          <optgroup>{brand}</optgroup>
                          {shoes.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </Fragment>
                      ))}
                  </MySelect>
                )}
              />

              <FormControl isInvalid={!!errors.modes}>
                <FormLabel htmlFor="modes" mt={4}>
                  <Trans>Modes</Trans>
                </FormLabel>
                <Controller
                  name="modes"
                  control={control}
                  defaultValue={[]}
                  render={({ onChange, value }) => (
                    <CheckboxGroup value={value} onChange={onChange}>
                      <Stack spacing={4} direction="row">
                        <Checkbox value="TW">
                          <Trans>TW</Trans>
                        </Checkbox>
                        <Checkbox value="SZ">
                          <Trans>SZ</Trans>
                        </Checkbox>
                        <Checkbox value="TC">
                          <Trans>TC</Trans>
                        </Checkbox>
                        <Checkbox value="RM">
                          <Trans>RM</Trans>
                        </Checkbox>
                        <Checkbox value="CB">
                          <Trans>CB</Trans>
                        </Checkbox>
                      </Stack>
                    </CheckboxGroup>
                  )}
                />
                <FormHelperText>
                  <Trans>
                    Choose at least one mode where you use this build
                  </Trans>
                </FormHelperText>
                <FormErrorMessage>
                  {/* @ts-ignore */}
                  {t`Select at least one mode`}
                </FormErrorMessage>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} type="submit" isLoading={sending}>
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
};

export default BuildModal;
