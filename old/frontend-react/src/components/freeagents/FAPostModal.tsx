import { useMutation } from "@apollo/client";
import {
    Box,
    Button,
    Checkbox,
    CheckboxGroup,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Radio,
    RadioGroup,
    Stack,
    useToast
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    AddFreeAgentPostVars,
    ADD_FREE_AGENT_POST
} from "../../graphql/mutations/addFreeAgentPost";
import { HIDE_FREE_AGENT_POST } from "../../graphql/mutations/hideFreeAgentPost";
import { UPDATE_FREE_AGENT_POST } from "../../graphql/mutations/updateFreeAgentPost";
import { FREE_AGENT_MATCHES } from "../../graphql/queries/freeAgentMatches";
import { FREE_AGENT_POSTS } from "../../graphql/queries/freeAgentPosts";
import MyThemeContext from "../../themeContext";
import { FreeAgentPost } from "../../types";
import Alert from "../elements/Alert";
import Modal from "../elements/Modal";
import TextArea from "../elements/TextArea";

interface FAPostModalProps {
  closeModal: () => void;
  post?: FreeAgentPost;
}

const FAPostModal: React.FC<FAPostModalProps> = ({ closeModal, post }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<Partial<AddFreeAgentPostVars>>(
    post ? post : {}
  );
  const [showErrors, setShowErrors] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const { themeColor, grayWithShade } = useContext(MyThemeContext);

  const [addFreeAgentPost, { loading }] = useMutation<
    boolean,
    AddFreeAgentPostVars
  >(ADD_FREE_AGENT_POST, {
    variables: { ...(form as AddFreeAgentPostVars) },
    onCompleted: (data) => {
      closeModal();
      toast({
        description: t("freeagents;Free agent post added"),
        position: "top-right",
        status: "success",
        duration: 10000,
      });
    },
    onError: (error) => {
      toast({
        title: t("users;An error occurred"),
        description: error.message,
        position: "top-right",
        status: "error",
        duration: 10000,
      });
    },
    refetchQueries: [{ query: FREE_AGENT_POSTS }],
  });

  const [editFreeAgentPost, { loading: editLoading }] = useMutation<
    boolean,
    AddFreeAgentPostVars
  >(UPDATE_FREE_AGENT_POST, {
    variables: { ...(form as AddFreeAgentPostVars) },
    onCompleted: (data) => {
      closeModal();
      toast({
        description: t("freeagents;Free agent post edited"),
        position: "top-right",
        status: "success",
        duration: 10000,
      });
    },
    onError: (error) => {
      toast({
        title: t("users;An error occurred"),
        description: error.message,
        position: "top-right",
        status: "error",
        duration: 10000,
      });
    },
    refetchQueries: [{ query: FREE_AGENT_POSTS }],
  });

  const [hideFreeAgentPost, { loading: hideLoading }] = useMutation<
    boolean,
    AddFreeAgentPostVars
  >(HIDE_FREE_AGENT_POST, {
    variables: { ...(form as AddFreeAgentPostVars) },
    onCompleted: (data) => {
      closeModal();
      toast({
        description: t("freeagents;Free agent post deleted"),
        position: "top-right",
        status: "success",
        duration: 10000,
      });
    },
    onError: (error) => {
      toast({
        title: t("users;An error occurred"),
        description: error.message,
        position: "top-right",
        status: "error",
        duration: 10000,
      });
    },
    refetchQueries: [
      { query: FREE_AGENT_POSTS },
      { query: FREE_AGENT_MATCHES },
    ],
  });

  const handleChange = (newValueObject: Partial<AddFreeAgentPostVars>) => {
    setForm({ ...form, ...newValueObject });
  };

  const actionType = post ? "EDIT" : "NEW";

  const handleSubmit = () => {
    if (
      form.playstyles?.length === 0 ||
      !form.can_vc ||
      (form.past_experience ?? "").length > 100 ||
      (form.activity ?? "").length > 100 ||
      (form.looking_for ?? "").length > 100 ||
      (form.description ?? "").length > 1000
    ) {
      setShowErrors(true);
      return;
    }

    if (actionType === "NEW") addFreeAgentPost();
    else if (actionType === "EDIT") editFreeAgentPost();
  };

  return (
    <Modal
      title={
        actionType === "NEW"
          ? t("freeagents;Adding a new free agent post")
          : t("freeagents;Editing a free agent post")
      }
      closeModal={closeModal}
    >
      {actionType === "EDIT" && (
        <Box
          color="red.500"
          mb="1em"
          textDecoration="underline"
          cursor="pointer"
          onClick={() => setDeleting(true)}
        >
          {t("freeagents;Delete free agent post")}
        </Box>
      )}
      {deleting && (
        <>
          <Box color={grayWithShade}>{t("freeagents;deleteNotif")}</Box>
          <Flex flexWrap="wrap" mt="1em">
            <Box mr="1em">
              <Button
                onClick={() => hideFreeAgentPost()}
                isLoading={hideLoading}
              >
                {t("freeagents;Confirm deletion")}
              </Button>
            </Box>
            <Button variant="outline" onClick={() => setDeleting(false)}>
              {t("users;Cancel")}
            </Button>
          </Flex>
        </>
      )}
      {actionType === "NEW" && (
        <Alert status="info">{t("freeagents;theyAreSynced")}</Alert>
      )}
      <FormControl
        isRequired
        isInvalid={showErrors && form.playstyles?.length === 0}
        mt="1em"
      >
        <FormLabel htmlFor="playstyles">{t("freeagents;Playstyles")}</FormLabel>
        <CheckboxGroup
          colorScheme={themeColor}
          value={form.playstyles ?? []}
          onChange={(value) =>
            handleChange({
              playstyles: value as ("FRONTLINE" | "MIDLINE" | "BACKLINE")[],
            })
          }
        >
          <Stack spacing="20px" isInline>
            <Checkbox value="FRONTLINE">
              {t("freeagents;Frontline/Slayer")}
            </Checkbox>
            <Checkbox value="MIDLINE">
              {t("freeagents;Midline/Support")}
            </Checkbox>
            <Checkbox value="BACKLINE">
              {t("freeagents;Backline/Anchor")}
            </Checkbox>
          </Stack>
        </CheckboxGroup>
        <FormErrorMessage>{t("freeagents;Required field")}</FormErrorMessage>
      </FormControl>

      <FormControl isRequired isInvalid={showErrors && !form.can_vc} mt="1em">
        <FormLabel htmlFor="canVc">
          {t("freeagents;Can you voice chat?")}
        </FormLabel>
        <RadioGroup
          id="canVc"
          colorScheme={themeColor}
          value={form.can_vc}
          onChange={(value) =>
            handleChange({
              can_vc: value as "YES" | "USUALLY" | "SOMETIMES" | "NO",
            })
          }
        >
          <Stack spacing="20px" isInline>
            <Radio value="YES">{t("freeagents;Yes")}</Radio>
            <Radio value="USUALLY">{t("freeagents;Usually")}</Radio>
            <Radio value="SOMETIMES">{t("freeagents;Sometimes")}</Radio>
            <Radio value="NO">{t("freeagents;No")}</Radio>
          </Stack>
        </RadioGroup>
        <FormErrorMessage>{t("freeagents;Required field")}</FormErrorMessage>
      </FormControl>

      <FormControl
        isInvalid={
          showErrors &&
          !!form.past_experience &&
          form.past_experience.length > 100
        }
        mt="1em"
      >
        <FormLabel htmlFor="pastExperience">
          {t("freeagents;Past competitive experience")}
        </FormLabel>
        <TextArea
          id="pastExperience"
          setValue={(value: string) =>
            handleChange({ past_experience: value as string })
          }
          value={form.past_experience ?? ""}
          limit={100}
        />
        <FormErrorMessage>{t("freeagents;Value too long")}</FormErrorMessage>
      </FormControl>

      <FormControl
        isInvalid={showErrors && !!form.activity && form.activity.length > 100}
        mt="1em"
      >
        <FormLabel htmlFor="activity">
          {t("freeagents;What is your activity like on a typical week?")}
        </FormLabel>
        <TextArea
          id="activity"
          setValue={(value: string) =>
            handleChange({ activity: value as string })
          }
          value={form.activity ?? ""}
          limit={100}
        />
        <FormErrorMessage>{t("freeagents;Value too long")}</FormErrorMessage>
      </FormControl>

      <FormControl
        isInvalid={
          showErrors && !!form.looking_for && form.looking_for.length > 100
        }
        mt="1em"
      >
        <FormLabel htmlFor="lookingFor">
          {t("freeagents;What are you looking from a team?")}
        </FormLabel>
        <TextArea
          id="lookingFor"
          setValue={(value: string) =>
            handleChange({ looking_for: value as string })
          }
          value={form.looking_for ?? ""}
          limit={100}
        />
        <FormErrorMessage>{t("freeagents;Value too long")}</FormErrorMessage>
      </FormControl>

      <FormControl
        isInvalid={
          showErrors && !!form.description && form.description.length > 1000
        }
        mt="1em"
      >
        <FormLabel htmlFor="lookingFor">{t("freeagents;Free word")}</FormLabel>
        <TextArea
          id="lookingFor"
          setValue={(value: string) =>
            handleChange({ description: value as string })
          }
          value={form.description ?? ""}
          height="150px"
          limit={1000}
        />
        <FormErrorMessage>{t("freeagents;Value too long")}</FormErrorMessage>
      </FormControl>

      <Flex flexWrap="wrap" mt="1em">
        <Box mr="1em">
          <Button
            onClick={() => handleSubmit()}
            isLoading={loading || editLoading}
          >
            {t("users;Submit")}
          </Button>
        </Box>
        <Button variant="outline" onClick={() => closeModal()}>
          {t("users;Cancel")}
        </Button>
      </Flex>
    </Modal>
  );
};

export default FAPostModal;
