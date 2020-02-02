import React, { useState } from "react"
import Modal from "../elements/Modal"
import WeaponSelector from "../common/WeaponSelector"
import { Weapon } from "../../types"

interface BuildFormModalProps {}

const BuildFormModal: React.FC<BuildFormModalProps> = ({}) => {
  const [weapon, setValue] = useState<string | null>(null)
  return (
    <Modal title="Adding a new build">
      <WeaponSelector label="Weapon" setValue={setValue} />
    </Modal>
  )
}

export default BuildFormModal
