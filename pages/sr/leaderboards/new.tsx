import {
  Button,
  Container,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Textarea,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { SalmonRunRecordCategory } from "@prisma/client";
import Breadcrumbs from "components/common/Breadcrumbs";
import RotationSelector from "components/sr/RotationSelector";
import Image from "next/image";
import { useState } from "react";

interface RecordFormData {
  rotationId: number;
  userIds: number[];
  category: SalmonRunRecordCategory;
  goldenEggCount: number;
  links: string;
}

const salmonRunCategoryToNatural = {
  TOTAL: t`All waves`,
  TOTAL_NO_NIGHT: t`All waves (no night)`,
  PRINCESS: t`Princess`,
  NT_NORMAL: t`Normal (normal tide)`,
  HT_NORMAL: t`Normal (high tide)`,
  LT_NORMAL: t`Normal (low tide)`,
  NT_RUSH: t`Rush (normal tide)`,
  HT_RUSH: t`Rush (high tide)`,
  NT_FOG: t`Fog (normal tide)`,
  HT_FOG: t`Fog (high tide)`,
  LT_FOG: t`Fog (low tide)`,
  NT_GOLDIE: t`Goldie Seeking (normal tide)`,
  HT_GOLDIE: t`Goldie Seeking (high tide)`,
  NT_GRILLERS: t`Grillers (normal tide)`,
  HT_GRILLERS: t`Grillers (high tide)`,
  NT_MOTHERSHIP: t`Mothership (normal tide)`,
  HT_MOTHERSHIP: t`Mothership (high tide)`,
  LT_MOTHERSHIP: t`Mothership (low tide)`,
  LT_COHOCK: t`Cohock Charge`,
} as const;

const AddRecordModal = () => {
  const { i18n } = useLingui();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState<Partial<RecordFormData>>({});

  return (
    <Container maxWidth="75ch">
      <Breadcrumbs
        pages={[
          { name: t`Salmon Run` },
          { name: t`Leaderboards`, link: "/sr/leaderboards" },
          { name: t`New record` },
        ]}
      />
      <form /*onSubmit={handleSubmit(onSubmit)}*/>
        <RotationSelector
          rotationId={form.rotationId}
          setRotationId={(rotationId) => {
            if (!rotationId) {
              const newForm = { ...form };
              delete newForm.rotationId;
              setForm(newForm);
              return;
            }

            setForm({ ...form, rotationId });
          }}
        />

        {form.rotationId && (
          <>
            <FormLabel htmlFor="category" mt={4}>
              <Trans>Category</Trans>
            </FormLabel>
            <Select
              name="category"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as SalmonRunRecordCategory,
                })
              }
            >
              {Object.entries(salmonRunCategoryToNatural).map(
                ([key, value]) => (
                  <option key={key} value={key}>
                    {i18n._(value)}
                  </option>
                )
              )}
            </Select>

            <FormLabel htmlFor="goldenEggCount" mt={4}>
              <Flex alignItems="center">
                <Flex align="center" mr={1}>
                  <Image
                    src="/images/salmonRunIcons/Golden%20Egg.png"
                    width={32}
                    height={32}
                  />
                </Flex>
                <Trans>Golden Egg Count</Trans>
              </Flex>
            </FormLabel>
            <NumberInput name="goldenEggCount" maxW={48}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>

            <FormControl>
              <FormLabel mt={4}>
                <Trans>Links</Trans>
              </FormLabel>
              <FormHelperText mb={4} mt="-10px">
                <Trans>
                  Add one to four links to provide context behind the record
                  (e.g. VoDs on YouTube, screenshots on Twitter). One link per
                  line.
                </Trans>
              </FormHelperText>
              <Textarea
                value={form.links}
                onChange={(e) => setForm({ ...form, links: e.target.value })}
                rows={4}
                resize="none"
              />
            </FormControl>

            <Button mt={6} /*type="submit"*/ isLoading={sending}>
              <Trans>Submit</Trans>
            </Button>
          </>
        )}
      </form>
    </Container>
  );
};

export default AddRecordModal;
