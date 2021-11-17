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
import { prepData } from "../data"

function Transform(props) {
  const handleQueryUpdate = (e) => {
    props.setQuery(e.target.value);
  };

  async function handleExecuteQuery(query) {
    const response = await fetch("http://127.0.0.1:8080/executequery", {
      method: "POST",
      body: JSON.stringify({ query: query }),
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    });

    let body = await response.json();
    if (body["status"] === 200) {
      props.setData(prepData(body["data"]));
    } else {
      alert(body["error"]);
    }
  }

  async function handleDownloadClick() {
    const response = await fetch("http://127.0.0.1:8080/downloadcsv", {
      method: "POST",
      body: JSON.stringify({ query: props.query, tableName: props.tableName }),
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    });

    let blob = await response.blob();
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = props.tableName + "-transformed.csv";
    a.click();
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
            <Button onClick={() => handleExecuteQuery(props.query)}>Execute Query</Button>
            <Button onClick={handleDownloadClick}>Download CSV</Button>
          </CardBody>
        </Card>
      </span>
    </div>
  );
}

export default Transform;
