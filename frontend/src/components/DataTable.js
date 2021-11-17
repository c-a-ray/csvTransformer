// DataTable.js

// Table of data; used in the second and third views

import React, { memo } from "react";
import { Table } from "reactstrap";
import "../styles/RenderData.css";

function DataTable(props) {
  const TableHeadItem = ({ item, key }) => {
    return (
      <td title={item} key={key} className="column-head-text">
        {item}
      </td>
    );
  };

  const TableRow = ({ items, key }) => {
    return (
      <tr key={key}>
        {items.map((item, index) => {
          return <td key={index}>{item}</td>;
        })}
      </tr>
    );
  };

  return (
      <div className="data-table">
        <Table>
          <thead>
            <tr>
              {props.data.columns.map((col, index) => {
                return <TableHeadItem item={col} key={index} />;
              })}
            </tr>
          </thead>
          <tbody>
            {props.data.rows.map((row) => {
              return <TableRow items={row.items} key={row.id} />;
            })}
          </tbody>
        </Table>
      </div>
  );
}

// Memoize for efficiency
export default memo(DataTable);
