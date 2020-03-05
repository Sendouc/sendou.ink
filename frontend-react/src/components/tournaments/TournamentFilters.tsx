import React, { useState } from "react"
import Button from "../elements/Button"
import { Collapse } from "@chakra-ui/core"

interface TournamentFiltersProps {}

const TournamentFilters: React.FC<TournamentFiltersProps> = ({}) => {
  const [show, setShow] = useState(true)
  return (
    <>
      <Button onClick={() => setShow(!show)}>
        {show ? "Hide filters" : "Show filters"}
      </Button>
      <Collapse mt={4} isOpen={show}>
        Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus
        terry richardson ad squid. Nihil anim keffiyeh helvetica, craft beer
        labore wes anderson cred nesciunt sapiente ea proident.
      </Collapse>
    </>
  )
}

export default TournamentFilters
