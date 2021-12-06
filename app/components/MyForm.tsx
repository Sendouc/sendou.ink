import { Form, FormProps, useFetcher, useTransition } from "remix";

interface MyFormProps extends FormProps {
  hiddenFields?: Record<string, string>;
}

/**
 * Wrapper around Remix's Form that has default method of "post",
 * creates <input type="hidden"> elements for each key/value pair in hiddenFields,
 * automatically uses fetcher.Form when action is provided
 * and disables the form when it's submitting.
 */
export function MyForm(props: MyFormProps) {
  const { hiddenFields, children, ...rest } = props;
  const fetcher = useFetcher();

  const FormComponent = rest.action ? fetcher.Form : Form;

  const transition = useTransition();
  return (
    <FormComponent method="post" {...rest}>
      <fieldset disabled={transition.state !== "idle"}>
        {hiddenFields &&
          Object.entries(hiddenFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        {children}
      </fieldset>
    </FormComponent>
  );
}
