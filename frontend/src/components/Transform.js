// Transform.js

// The third and final view. Contains a data table, a PostgreSQL query editor,
// an "Execute Query" button, and a "Download CSV" button

import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  InputGroup,
  Input,
  Button,
} from "reactstrap";
import DataTable from "./DataTable";
import { prepData, downloadCSV } from "../data";
import "../styles/App.css";

function Transform(props) {
  // Handle updates to the query editor
  const handleQueryUpdate = (e) => {
    e.preventDefault();
    props.setQuery(e.target.value);
  };

  // Handle tab in the query editor
  const handleQueryKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      var val = props.query,
          start = e.target.selectionStart,
          end = e.target.selectionEnd;
      props.setQuery(val.substring(0, start) + "\t" + val.substring(end));
    }
  };

  // Handle click to "Execute Query" button
  // Send a request with the query to the server, wait for
  // the results, and update state
  async function handleExecuteQuery(query) {
    const response = await fetch("http://127.0.0.1:8080/executeQuery", {
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

  // Handle click to "Download" button
  async function handleDownloadClick() {
    const response = await fetch("http://127.0.0.1:8080/downloadcsv", {
      method: "POST",
      body: JSON.stringify({ query: props.query, tableName: props.tableName }),
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    });

    downloadCSV(await response.blob(), props.tableName);
  }

  return (
    <div>
      <span>
        <Card>
          <CardHeader className="label-text">Query Data</CardHeader>
          <CardBody>
            <label>Table name: {props.tableName}</label>
            <DataTable data={props.data} />
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
                onKeyDown={handleQueryKeyDown}
                value={props.query}
              />
            </InputGroup>
            <Button onClick={() => handleExecuteQuery(props.query)}>
              Execute Query
            </Button>
            <Button onClick={handleDownloadClick}>Download CSV</Button>
          </CardBody>
        </Card>
      </span>
    </div>
  );
}

export default Transform;
