import React from "react"
import { Modal, Header, Button } from "semantic-ui-react"

const BuildDeleteModal = ({ trigger, buildTitle, onConfirm }) => {
  //const [open, setOpen] = useState(false)
  const onYesClick = () => {
    onConfirm()
    //setOpen(false)
  }
  return (
    <Modal trigger={trigger} basic size="small" closeIcon>
      <Header icon="trash alternate" content={`Delete ${buildTitle}`} />
      <Modal.Content>
        <p>Are you sure you want to delete the build "{buildTitle}"?</p>
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
