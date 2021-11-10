import React, { useState } from "react";
import { Button, Tooltip } from "reactstrap";

function Header(props) {
  const [toolTipOpen, setToolTipOpen] = useState(false);

  return (
    <header className="App-header">
      <Button id="header-btn" onClick={props.handleHeaderBtnClick} size="lg">
        CSV Transformer
      </Button>
      <Tooltip
        target="header-btn"
        placement="right"
        isOpen={toolTipOpen}
        toggle={() => {
          setToolTipOpen(!toolTipOpen);
        }}
      >
        Click to start over with another file
      </Tooltip>
    </header>
  );
}

export default Header;
