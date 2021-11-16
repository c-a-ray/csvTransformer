import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Label,
  Button,
  Table
} from "reactstrap";
import RenderData from "./RenderData";
import "../styles/ConfigureData.css";

function ConfigureData(props) {
  const [columnsToDelete, setColumnsToDelete] = useState(createDeleteColDict(false));
  const [columnDataTypes, setColumnDataTypes] = useState(createDeleteColDict("text"));

  function createDeleteColDict(defaultVal) {
    let deleteColDict = {};
    for (let col of props.data.columns) {
      deleteColDict[col] = defaultVal;
    }
    return deleteColDict;
  }

  const handleCheckboxChange = (e) => {
    setColumnsToDelete((prevCols) => ({
      ...prevCols,
      [e.target.id]: e.target.checked,
    }));
  };

  const handleDropdownChange = (e) => {
    setColumnDataTypes((prevCols) => ({
      ...prevCols,
      [e.target.id]: e.target.value,
    }))
  }

  const ColumnConfigTable = () => {
    return (
      <div className="column-config-table">
        <Table>
          <thead>
            <tr>
              <td className="column-head-text">Column Name</td>
              <td className="column-head-text">Delete</td>
              <td className="column-head-text">Select Data Type</td>
            </tr>
          </thead>
          <tbody>
            {props.data.columns.map((col, index) => {
              return <ConfigRow column={col} key={index} />
            })}
          </tbody>
        </Table>
      </div>
    )
  };

  const ConfigRow = ({ column, key }) => {
    return (
      <tr key={key}>
        <td key={column + "1"} >{column}</td>
        <td>
          <DeleteColumnCheckbox column={column} key={column + "2"} />
        </td>
        <td key={column + "3"}>
          <ColumnDataTypeDropdown column={column} key={column + "3"} />
        </td>
      </tr>
    )
  };

  const DeleteColumnCheckbox = ({ column, key }) => {
    return (
        <div className="col-checkbox">
          <Input
            type="checkbox"
            id={column}
            key={key}
            onChange={handleCheckboxChange}
            checked={columnsToDelete[column]}
          />
        </div>
    );
  };

  const ColumnDataTypeDropdown = ({column, key}) => {
    return (
      <div className="col-dropdown">
        <Input
          type="select"
          name="select-dtype"
          onChange={handleDropdownChange}
          title="Select Data Type"
          value={columnDataTypes[column]}
          id={column}
          key={key}
        >
          <option id="text">text</option>
          <option id="int">int</option>
          <option id="float">float</option>
          <option id="bool">bool</option>
        </Input>
      </div>
    );
  }

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
                <ColumnConfigTable />
              </div>
            </div>
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
