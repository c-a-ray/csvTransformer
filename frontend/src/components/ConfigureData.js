// ConfigureData.js

// Second view. Contains a table showing the uploaded CSV data,
// an input for the table name, and a config table. The config
// table contains a row for every column. Each row also has
// a checkbox to delete the column and a dropdown to choose
// the column's data type.

import React, { useState } from "react";
import { Card, CardBody, CardHeader, Input, Label, Button } from "reactstrap";
import DataTable from "./DataTable";
import ConfigTable from "./ConfigTable";
import {
  prepData,
  createColumnLookup,
  compileColsToDelete,
  validateTableName,
} from "../data";
import "../styles/ConfigureData.css";
import "../styles/App.css";

function ConfigureData(props) {
  // For storing the columns to delete
  const [columnsToDelete, setColumnsToDelete] = useState(
    createColumnLookup(false, props.data)
  );

  // For storing the column data types
  const [columnDataTypes, setColumnDataTypes] = useState(
    createColumnLookup("text", props.data)
  );

  // Handle updating the table name input
  const handleTableNameUpdate = (e) => {
    props.setTableName(e.target.value);
  };

  // Handle clicking the continue button
  // Make sure a valid table name has been given,
  // then send a request to create the table in the DB
  async function handleConfigureComplete() {
    if (!validateTableName(props.tableName)) {
      return;
    }

    let reqBody = {
      data: props.data,
      tableName: props.tableName,
      columnsToDelete: compileColsToDelete(columnsToDelete, props.data),
      columnDataTypes: columnDataTypes,
    };

    const response = await fetch("http://127.0.0.1:8080/initializeTable", {
      method: "POST",
      body: JSON.stringify(reqBody),
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    });

    let resBody = await response.json();
    if (resBody["status"] === 200) {
      props.setData(prepData(resBody["data"]));
      props.setCurrentStep(3);
    } else {
      alert(resBody["error"]);
    }
  }

  return (
    <div>
      <span>
        <Card>
          <CardHeader className="label-text">Configure Data</CardHeader>
          <CardBody>
            <div>Data from {props.filename}</div>
            <DataTable data={props.data} />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="cfg-input-wrapper">
              <div>
                <div>
                  <Label className="table-name-label">Enter table name</Label>
                  <Input
                    type="text"
                    bsSize="sm"
                    onChange={handleTableNameUpdate}
                  />
                </div>
              </div>
              <div>
                <ConfigTable
                  data={props.data}
                  columnDataTypes={columnDataTypes}
                  setColumnDataTypes={setColumnDataTypes}
                  columnsToDelete={columnsToDelete}
                  setColumnsToDelete={setColumnsToDelete}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </span>
      <Button
        onClick={() =>
          handleConfigureComplete(columnsToDelete, columnDataTypes)
        }
      >
        CONTINUE
      </Button>
    </div>
  );
}

export default ConfigureData;
