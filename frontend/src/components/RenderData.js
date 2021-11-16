import React, { memo } from "react";
import { Table } from "reactstrap";
import "../styles/RenderData.css";

function RenderData(props) {
  const data = props.data;

  const TableHeadItem = ({ item, key }) => {
    return <td title={item} key={key}>{item}</td>;
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

  const DataTable = () => {
    return (
      <div className="data-table">
        <Table>
          <thead>
            <tr>
              {data.columns.map((col, index) => {
                return <TableHeadItem item={col} key={index} />;
              })}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => {
              return <TableRow items={row.items} key={row.id} />;
            })}
          </tbody>
        </Table>
      </div>
    );
  };

  return <DataTable data={props.data} />;
}

export default memo(RenderData);
