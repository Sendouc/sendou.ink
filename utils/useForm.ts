// https://www.solidjs.com/examples/forms
import { createStore, SetStoreFunction } from "solid-js/store";

type FormFieldElement = HTMLInputElement;
type Validator = (el: FormFieldElement) => string | undefined;
type FormFieldAccessor = () => Validator | undefined;
type FormAccessor = () => (el: HTMLFormElement) => void;
type ElementAndValidators = {
  element: FormFieldElement;
  validators: Validator[];
};

const INPUT_ERROR_CLASSNAME = "error";

function checkValid(
  {
    element,
    validators = [],
  }: { element: FormFieldElement; validators: Array<Validator> },
  setErrors: SetStoreFunction<{}>
) {
  return async () => {
    element.setCustomValidity("");
    element.checkValidity();
    let message = element.validationMessage;
    if (!message) {
      for (const validator of validators) {
        const text = validator(element);
        if (text) {
          element.setCustomValidity(text);
          break;
        }
      }
      message = element.validationMessage;
    }
    if (message) {
      element.classList.toggle(INPUT_ERROR_CLASSNAME, true);
      setErrors({ [element.name]: message });
    }
  };
}

export function useForm() {
  const [errors, setErrors] = createStore<Record<string, string>>({});
  const fields: Record<
    string,
    { element: FormFieldElement; validators: Validator[] }
  > = {};

  const validate = (ref: FormFieldElement, accessor: FormFieldAccessor) => {
    const validators = (accessor() || []) as Validator[];
    let config: ElementAndValidators;
    fields[ref.name] = config = { element: ref, validators };
    ref.onblur = checkValid(config, setErrors);
    ref.oninput = () => {
      if (!errors[ref.name]) return;
      setErrors({ [ref.name]: undefined });
      ref.classList.toggle(INPUT_ERROR_CLASSNAME, false);
    };
  };

  const formSubmit = (ref: HTMLFormElement, accessor: FormAccessor) => {
    const callback = accessor() || (() => {});
    ref.setAttribute("novalidate", "");
    ref.onsubmit = async (e) => {
      e.preventDefault();
      let errored = false;

      for (const k in fields) {
        const field = fields[k];
        await checkValid(field, setErrors)();
        if (!errored && field.element.validationMessage) {
          field.element.focus();
          errored = true;
        }
      }
      !errored && callback(ref);
    };
  };

  return { validate, formSubmit, errors };
}
