import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  InputGroup,
  Input,
  Button,
} from "reactstrap";
import RenderData from "./RenderData";
import "../App.css"

function Transform(props) {
  const handleQueryUpdate = (e) => {
    props.setQuery(e.target.value);
  };

  function handleExecuteClick() {
    props.handleExecuteQuery(props.query);
  }

  function handleDownloadClick() {
    props.handleDownloadClick(props.query);
  }

  return (
    <div>
      <span>
        <Card>
          <CardHeader className="label-text">Query Data</CardHeader>
          <CardBody>
            <label>Table name: {props.tableName}</label>
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
            <Button onClick={handleExecuteClick}>Execute Query</Button>
            <Button onClick={handleDownloadClick}>Download CSV</Button>
          </CardBody>
        </Card>
      </span>
    </div>
  );
}

export default Transform;
