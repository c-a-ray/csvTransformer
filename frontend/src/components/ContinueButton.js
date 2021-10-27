import React from "react";
import { Button } from "reactstrap";

function ContinueButton(props) {
  return (
    <Button className="continue-btn" onClick={props.handleSubmission}>
      CONTINUE
    </Button>
  );
}

export default ContinueButton;
