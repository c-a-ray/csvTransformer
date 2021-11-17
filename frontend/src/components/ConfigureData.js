import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Label,
  Button
} from "reactstrap";
import RenderData from "./RenderData";
import ConfigTable from "./ConfigTable"
import { prepData, createColumnLookup, compileColsToDelete } from "../data";
import "../styles/ConfigureData.css";
import "../App.css";

function ConfigureData(props) {
  const [columnsToDelete, setColumnsToDelete] = useState(
    createColumnLookup(false, props.data)
  );
  const [columnDataTypes, setColumnDataTypes] = useState(
    createColumnLookup("text", props.data)
  );

  const handleTableNameUpdate = (e) => {
    props.setTableName(e.target.value);
  };

  async function handleConfigureComplete() {
    if (props.tableName.length === 0) {
      alert("Please enter a table name");
      return;
    }
    if (!props.tableName.match(/^[A-Za-z]+$/)) {
      alert("Table name can only contain letters");
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
            <RenderData data={props.data} />
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
        className="continue-btn"
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
