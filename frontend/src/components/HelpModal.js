import React, { useState } from "react";
import { Modal, ModalBody, Button } from "reactstrap";
import "../styles/HelpModal.css";

import {
  WelcomeText,
  PageOneHelpText,
  PageTwoHelpText,
  PageThreeHelpText,
} from "../data/ModalText";

function HelpModal(props) {
  const [modalOpen, setModalOpen] = useState(false);
  const toggleModal = () => setModalOpen(!modalOpen);

  const getModalBodyText = (step) => {
    switch (step) {
      case 1:
      default:
        return (
          <div>
            <WelcomeText />
            <hr />
            <PageOneHelpText />
          </div>
        );
      case 2:
        return (
          <div>
            <PageTwoHelpText />
          </div>
        );
      case 3:
        return (
          <div>
            <PageThreeHelpText />
          </div>
        );
    }
  };

  return (
    <div className="help-modal-group">
      <Button onClick={() => toggleModal()}>Help</Button>
      <Modal isOpen={modalOpen} toggle={() => toggleModal()}>
        <ModalBody>{getModalBodyText(props.step)}</ModalBody>
      </Modal>
    </div>
  );
}

export default HelpModal;
