export type InputValue<T = string> = { value: T };

export default function useInput<T = string>(
  defaultValue: T = "" as T
): [InputValue<T>, (event: any) => void, (v: T) => void] {
  let val: T = defaultValue;
  const value: InputValue<T> = {
    get value() {
      return val;
    },
    set value(v: T) {
      val = v;
    },
  };

  function handleValueChange(event: any): void {
    value.value = event?.target?.value !== undefined ? event.target.value : event;
  }

  return [
    value,
    handleValueChange,
    (v: T) => {
      value.value = v;
    },
  ];
}