import React from "react";

function ContinueButton(props) {
  return <button className="continue-btn" onClick={props.handleSubmission}>
    CONTINUE
    </button>;
}

export default ContinueButton;