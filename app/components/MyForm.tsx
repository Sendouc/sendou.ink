import { Form, FormProps, useTransition } from "remix";

interface MyFormProps extends FormProps {
  hiddenFields?: Record<string, string>;
}

/**
 * Wrapper around Remix's Form that has default method of "post",
 * creates <input type="hidden"> elements for each key/value pair in hiddenFields
 * and disables the form when it's submitting.
 */
export function MyForm(props: MyFormProps) {
  const { hiddenFields, children, ...rest } = props;

  const transition = useTransition();
  return (
    <Form method="post" {...rest}>
      <fieldset disabled={transition.state !== "idle"}>
        {hiddenFields &&
          Object.entries(hiddenFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        {children}
      </fieldset>
    </Form>
  );
}
