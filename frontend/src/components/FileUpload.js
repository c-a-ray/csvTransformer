import React from "react";
import ContinueButton from "./ContinueButton";
import {
  Card,
  CardBody,
  CardHeader
} from "reactstrap";

function FileUpload(props) {
  return (
    <div>
      <span>
        <Card>
          <CardHeader>Select a file to load</CardHeader>
          <CardBody>
            <input type="file" name="file" onChange={props.selectFile} />
          </CardBody>
          <CardBody>
            {props.isSelected ? (
              <div>
                <p>Filetype: {props.selectedFile.type}</p>
                <p>Size in bytes: {props.selectedFile.size}</p>
              </div>
            ) : (
              null
            )}
          </CardBody>
          <CardBody>
            <label>
              <input
                type="checkbox"
                name="hasHeader"
                checked={props.hasHeader}
                onChange={props.handleCheckboxChange}
              />
              CSV has header row
            </label>
          </CardBody>
          <CardBody>
              <ContinueButton handleSubmission={props.uploadFile} />
          </CardBody>
        </Card>
      </span>
    </div>
  );
}

export default FileUpload;
