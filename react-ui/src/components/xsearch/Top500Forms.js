import React from "react"
import { Form, Radio, Button } from "semantic-ui-react"
import WeaponDropdown from "../common/WeaponDropdown"
import MonthDropdown from "../common/MonthDropdown"
import YearDropdown from "../common/YearDropdown"

const Top500Forms = ({ forms, setForms, onSubmit, onClear }) => {
  return (
    <Form style={{ width: "270px" }}>
      <Form.Group>
        <Form.Input
          fluid
          label="Name"
          style={{ width: "270px" }}
          value={forms.name}
          onChange={(e, { value }) => setForms({ ...forms, name: value })}
        />
        <Form.Input
          fluid
          label="ID"
          style={{ width: "270px" }}
          value={forms.unique_id}
          onChange={(e, { value }) => setForms({ ...forms, unique_id: value })}
        />
      </Form.Group>
      <Form.Field>
        <label>Weapon</label>
        <WeaponDropdown
          value={forms.weapon}
          onChange={(e, { value }) => setForms({ ...forms, weapon: value })}
          nonMultiplePlaceholder={null}
        />
      </Form.Field>
      <Form.Field style={{ width: "500px" }}>
        <Radio
          label="All Modes"
          name="radioGroup"
          value={0}
          checked={forms.mode === 0}
          onChange={() => setForms({ ...forms, mode: 0 })}
        />
        <Radio
          style={{ marginLeft: "1.5em" }}
          label="SZ"
          name="radioGroup"
          value={1}
          checked={forms.mode === 1}
          onChange={() => setForms({ ...forms, mode: 1 })}
        />
        <Radio
          style={{ marginLeft: "1.5em" }}
          label="TC"
          name="radioGroup"
          value={2}
          checked={forms.mode === 2}
          onChange={() => setForms({ ...forms, mode: 2 })}
        />
        <Radio
          style={{ marginLeft: "1.5em" }}
          label="RM"
          name="radioGroup"
          value={3}
          checked={forms.mode === 3}
          onChange={() => setForms({ ...forms, mode: 3 })}
        />
        <Radio
          style={{ marginLeft: "1.5em" }}
          label="CB"
          name="radioGroup"
          value={4}
          checked={forms.mode === 4}
          onChange={() => setForms({ ...forms, mode: 4 })}
        />
      </Form.Field>
      <Form.Group>
        <Form.Field>
          <label>Month</label>
          <MonthDropdown
            value={forms.month}
            onChange={(e, { value }) => setForms({ ...forms, month: value })}
          />
        </Form.Field>
        <Form.Field>
          <label>Year</label>
          <YearDropdown
            value={forms.year}
            onChange={(e, { value }) => setForms({ ...forms, year: value })}
          />
        </Form.Field>
      </Form.Group>
      <Button primary onClick={onSubmit}>
        Apply
      </Button>
      <Button onClick={onClear}>Reset all</Button>
    </Form>
  )
}

export default Top500Forms
