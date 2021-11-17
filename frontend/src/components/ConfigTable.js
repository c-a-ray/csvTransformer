// ConfigTable.js

// Table containing a row for every column in the data object
// Each row contains a checkbox to delete the column
// and a dropdown to choose the column's data type

import React, { memo } from "react";
import { Input, Table } from "reactstrap";

function ConfigTable(props) {
  // Handle a checkbox click
  // Update the value of columnsToDelete in state
  const handleCheckboxChange = (e) => {
    props.setColumnsToDelete((prevCols) => ({
      ...prevCols,
      [e.target.id]: e.target.checked,
    }));
  };

  // Handle a dropdown selection
  // Update the value of columnDataTypes in state
  const handleDropdownChange = (e) => {
    props.setColumnDataTypes((prevCols) => ({
      ...prevCols,
      [e.target.id]: e.target.value,
    }));
  };

  const ConfigRow = ({ column, key }) => {
    return (
      <tr key={key}>
        <td key={column + "1"}>{column}</td>
        <td>
          <DeleteColumnCheckbox column={column} key={column + "2"} />
        </td>
        <td key={column + "3"}>
          <ColumnDataTypeDropdown column={column} key={column + "3"} />
        </td>
      </tr>
    );
  };

  const DeleteColumnCheckbox = ({ column, key }) => {
    return (
      <div className="col-checkbox">
        <Input
          type="checkbox"
          id={column}
          key={key}
          onChange={handleCheckboxChange}
          checked={props.columnsToDelete[column]}
        />
      </div>
    );
  };

  const ColumnDataTypeDropdown = ({ column, key }) => {
    return (
      <div className="col-dropdown">
        <Input
          type="select"
          name="select-dtype"
          onChange={handleDropdownChange}
          title="Select Data Type"
          value={props.columnDataTypes[column]}
          id={column}
          key={key}
        >
          <option id="text">text</option>
          <option id="int">int</option>
          <option id="float">float</option>
        </Input>
      </div>
    );
  };

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
            return <ConfigRow column={col} key={index} />;
          })}
        </tbody>
      </Table>
    </div>
  );
}

// Memoize for efficiency
export default memo(ConfigTable);
