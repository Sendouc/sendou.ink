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
import { useLingui } from "@lingui/react";
import MySelect from "components/common/MySelect";
import WeaponSelector from "components/common/WeaponSelector";
import { gear } from "lib/lists/gear";
import { Unpacked } from "lib/types";
import {
  buildSchema,
  DESCRIPTION_CHARACTER_LIMIT,
  TITLE_CHARACTER_LIMIT,
} from "lib/validators/build";
import { GetBuildsByUserData } from "prisma/queries/getBuildsByUser";
import { Fragment } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import AbilitiesSelector from "./AbilitiesSelector";

interface Props {
  onClose: () => void;
  build?: Unpacked<NonNullable<GetBuildsByUserData>>;
}

type FormData = z.infer<typeof buildSchema>;

const BuildModal: React.FC<Props> = ({ onClose, build }) => {
  const { i18n } = useLingui();

  const { handleSubmit, errors, register, watch, control } = useForm<FormData>({
    resolver: zodResolver(buildSchema),
    defaultValues: {
      headAbilities: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
      clothingAbilities: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
      shoesAbilities: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
      ...build,
    },
  });

  const watchTitle = watch("title", build?.title ?? "");
  const watchDescription = watch("description", build?.description ?? "");

  const toast = useToast();

  // const onSubmit = async (formData: FormData) => {

  //   for (const [key, value] of Object.entries(mutationData)) {
  //     if (value === "" || value === undefined) {
  //       const typedKey = key as keyof Omit<typeof mutationData, "weaponPool">;
  //       mutationData[typedKey] = null;
  //     }
  //   }

  //   const success = await sendData("PUT", "/api/me/profile", mutationData);
  //   if (!success) return;

  //   mutate(`/api/users/${user.id}`);

  //   toast(getToastOptions(build ? t`Profile updated` : t`Profile updated`, "success"));
  //   onClose();
  // };
  const onSubmit = async (formData: FormData) => console.log({ formData });

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

              {/* yeah....... didn't find an easier way to do this with the library so here we are */}
              <Controller
                name="headAbilities"
                control={control}
                render={({ onChange: onHeadChange, value: headAbilities }) => (
                  <Controller
                    name="clothingAbilities"
                    control={control}
                    render={({
                      onChange: onClothingChange,
                      value: clothingAbilities,
                    }) => (
                      <Controller
                        name="headAbilities"
                        control={control}
                        render={({
                          onChange: onShoesChange,
                          value: shoesAbilities,
                        }) => (
                          <Box mt={4}>
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
                name="headGear"
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

              <FormControl>
                <FormLabel htmlFor="modes" mt={4}>
                  <Trans>Modes</Trans>
                </FormLabel>
                <Controller
                  name="headGear"
                  control={control}
                  defaultValue=""
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
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                mr={3}
                type="submit"
                // FIXME:
                //isLoading={loading}
              >
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
