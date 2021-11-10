import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  InputGroup,
  Label,
  Button,
} from "reactstrap";
import RenderData from "./RenderData";
import "../styles/ConfigureData.css";

function ConfigureData(props) {
  const [columnsToDelete, setColumnsToDelete] = useState(createDeleteColDict());

  function createDeleteColDict() {
    let deleteColDict = {};
    for (let col of props.data.columns) {
      deleteColDict[col] = false;
    }
    return deleteColDict;
  }

  const handleCheckboxChange = (e) => {
    setColumnsToDelete((prevCols) => ({
      ...prevCols,
      [e.target.id]: e.target.checked,
    }));
  };

  const ColumnCheckbox = ({ column }) => {
    return (
      <div>
        <Label check className="col-checkbox-label">
          {column}
        </Label>
        <Input
          type="checkbox"
          id={column}
          onChange={handleCheckboxChange}
          checked={columnsToDelete[column]}
        />
      </div>
    );
  };

  const handleTableNameUpdate = (e) => {
    props.setTableName(e.target.value);
  };

  return (
    <div>
      <span>
        <Card>
          <CardHeader>Configure Data</CardHeader>
          <CardBody>
            <div>Data from {props.filename}</div>
            <RenderData data={props.data} />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <InputGroup className="cfg-input-wrapper">
              <div className="cfg-txt-input">
                <Label>Enter table name</Label>
                <Input type="text" size="sm" onChange={handleTableNameUpdate} />
              </div>
              <div className="cfg-del-cols">
                <Label>Select columns to delete</Label>
                {props.data.columns.map((col) => {
                  return <ColumnCheckbox column={col} />;
                })}
              </div>
            </InputGroup>
          </CardBody>
        </Card>
      </span>
      <Button
        className="continue-btn"
        onClick={() => props.onContinue(columnsToDelete)}
      >
        CONTINUE
      </Button>
    </div>
  );
}

export default ConfigureData;
