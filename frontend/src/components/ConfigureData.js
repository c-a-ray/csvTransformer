import React from "react";
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
  const ColumnCheckbox = ({ column }) => {
    return (
      <div>
        <Label check className="col-checkbox-label">
          {column}
        </Label>
        <Input type="checkbox" />
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
      <Button className="continue-btn" onClick={() => props.onContinue()}>
        CONTINUE
      </Button>
    </div>
  );
}

export default ConfigureData;
