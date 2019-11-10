import React from "react"
import { Modal, Header, Button, Image } from "semantic-ui-react"

const BuildDeleteModal = ({ trigger, buildTitle, onConfirm, wpnImage }) => {
  const onYesClick = () => {
    onConfirm()
  }
  return (
    <Modal trigger={trigger} basic size="small" closeIcon>
      <Header icon="trash alternate" content={`Delete ${buildTitle}`} />
      <Modal.Content>
        <Image src={wpnImage} />
        <p>
          Are you sure you want to delete "{buildTitle}
          "?
        </p>
      </Modal.Content>
      <Modal.Actions>
        <Button inverted color="red" onClick={() => onYesClick()}>
          Yes
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default BuildDeleteModal
