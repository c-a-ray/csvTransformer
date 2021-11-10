import React from "react";
import { Table } from "reactstrap";
import "../styles/RenderData.css";

function RenderData(props) {
  const TableHeadItem = ({ item }) => {
    return <td title={item}>{item}</td>;
  };

  const TableRow = ({ items, key }) => {
    return (
      <tr>
        {items.map((item) => {
          return <td key={key}>{item}</td>;
        })}
      </tr>
    );
  };

  const DataTable = (data) => {
    return (
      <div className="data-table">
        <Table>
          <thead>
            <tr>
              {data.data.columns.map((c) => {
                return <TableHeadItem item={c} />;
              })}
            </tr>
          </thead>
          <tbody>
            {data.data.rows.map((item) => {
              return <TableRow key={item.id} items={item.items} />;
            })}
          </tbody>
        </Table>
      </div>
    );
  };

  return <DataTable data={props.data} />;
}

export default RenderData;
