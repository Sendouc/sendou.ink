import React, { forwardRef } from "react"
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

const DatePicker: React.FC<DatePickerProps> = ({ date, setDate }) => {
  const CustomInput: React.FC<CustomInputProps> = forwardRef(
    ({ onClick, value }, ref) => (
      <Button onClick={onClick as () => void}>{value as string}</Button>
    )
  )

  return (
    <HackerOneDatePicker
      selected={date}
      onChange={date => {
        date?.setUTCHours(0, 0, 0, 0)
        setDate(date)
      }}
      customInput={<CustomInput />}
    />
  )
}

export default DatePicker
