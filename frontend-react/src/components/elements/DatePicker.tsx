import React from "react"
import HackerOneDatePicker from "react-datepicker"
import Button from "./Button"
import "react-datepicker/src/stylesheets/datepicker.scss"

interface DatePickerProps {
  date: Date
  setDate: (date: Date | null) => void
}

interface CustomInputProps {
  value?: string
  onClick?: () => void
}

const CustomInput: React.FC<CustomInputProps> = ({ value, onClick }) => (
  <Button onClick={onClick as () => void}>{value as string}</Button>
)

const DatePicker: React.FC<DatePickerProps> = ({ date, setDate }) => {
  return (
    <HackerOneDatePicker
      selected={date}
      onChange={date => setDate(date)}
      customInput={<CustomInput />}
    />
  )
}

export default DatePicker
