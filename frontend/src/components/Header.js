// Header.js

// Header component. Displayed in every UI view. Header contains button that returns
// to step 1 if a file is selected. Button does nothing if no file is selected.

import React, { useState } from "react";
import { Card, CardBody, Button, Tooltip, Modal, ModalBody } from "reactstrap";
import "../styles/Header.css"

function Header(props) {
  const [toolTipOpen, setToolTipOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  const toggleModal = () => {
    setVerifyModalOpen(!verifyModalOpen);
    setToolTipOpen(false);
  };
  const toggleTooltip = () => setToolTipOpen(!toolTipOpen);
  
  const handleStartOverClick = () => {
    props.handleRestart();
    setToolTipOpen(false);
    setVerifyModalOpen(false);
  }

  const handleCancelClick = () => {
    setToolTipOpen(false);
    setVerifyModalOpen(false);
  }

  if (props.isFileSelected) {
    return (
      <header className="App-header">
        <Button id="header-btn" onClick={() => toggleModal()} size="lg">
          CSV Transformer
        </Button>
        <Modal isOpen={verifyModalOpen} toggle={toggleModal}>
          <Card>
            <CardBody>
              <p>
                Clicking on this button will reset the app and return you to the
                first step. If you have created a temporary table, you will no
                longer have access to it.
              </p>
              <p className="modal-center-text">
                Are you sure you want to start over?
              </p>
              <div className="modal-buttons">
                <Button onClick={() => handleStartOverClick()}>Start Over</Button>
                <Button onClick={() => handleCancelClick()}>Cancel</Button>
              </div>
            </CardBody>
          </Card>
        </Modal>
        <Tooltip
          target="header-btn"
          placement="right"
          isOpen={toolTipOpen}
          toggle={() => toggleTooltip()}
        >
          Click to start over with another file
        </Tooltip>
      </header>
    );
  } else {
    return (
      <header className="App-header">
        <Button id="header-btn" size="lg">
          CSV Transformer
        </Button>
      </header>
    );
  }
}

export default Header;
