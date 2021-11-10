import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import ContinueButton from "./ContinueButton";
import RenderData from "./RenderData";

function ConfigureData(props) {
  return (
    <div>
      <span>
        <Card>
          <CardHeader>Uploaded Data:</CardHeader>
          <CardBody>
            <RenderData data={props.data} />
          </CardBody>
        </Card>
      </span>
      <ContinueButton handleSubmission={props.onContinue} />
    </div>
  );
}

export default ConfigureData;
