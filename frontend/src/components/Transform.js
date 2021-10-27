import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  InputGroup,
  Input,
  Button,
} from "reactstrap";
import RenderData from "./RenderData";

function Transform(props) {
  const handleQueryUpdate = (e) => {
    props.setQuery(e.target.value);
  };

  function handleClick() {
    props.handleExecuteQuery(props.query);
  }

  return (
    <div>
      <span>
        <Card>
          <CardHeader>Table: temp</CardHeader>
          <CardBody>
            <RenderData data={props.data} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>PostgreSQL Query Editor:</CardHeader>
          <CardBody>
            <InputGroup>
              <Input
                type="textarea"
                placeholder="Write query here"
                id="querytext"
                rows="6"
                onChange={handleQueryUpdate}
              />
            </InputGroup>
            <Button onClick={handleClick}>Execute Query</Button>
          </CardBody>
        </Card>
      </span>
    </div>
  );
}

export default Transform;
