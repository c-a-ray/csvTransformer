import React from "react";
import ContinueButton from "./ContinueButton";
import "../App.css"
import {
  Card,
  CardBody,
  CardHeader
} from "reactstrap";

function FileUpload(props) {
  async function uploadFile(isFileSelected, selectedFile, hasHeader, setData, prepData, setCurrentStep) {
    if (!isFileSelected || !selectedFile) {
      alert("Please select a CSV file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("File", selectedFile);
    formData.append("HasHeader", hasHeader);

    const response = await fetch("http://127.0.0.1:8080/loadcsv", {
      method: "POST",
      body: formData,
      mode: "cors",
    });

    var body = await response.json();
    if (body["status"] === 200) {
      setData(prepData(body["data"]));
      setCurrentStep(2);
    } else {
      alert(body["error"]);
    }
  }

  return (
    <div>
      <span>
        <Card>
          <CardHeader className="label-text">Select a file to load</CardHeader>
          <CardBody>
            <input type="file" name="file" onChange={props.selectFile} />
          </CardBody>
          <CardBody>
            {props.isFileSelected ? (
              <div>
                <p>Filetype: {props.selectedFile.type}</p>
                <p>Size in bytes: {props.selectedFile.size}</p>
              </div>
            ) : null}
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
            <ContinueButton
              handleSubmission={() => uploadFile(
                props.isFileSelected,
                props.selectedFile,
                props.hasHeader,
                props.setData,
                props.prepData,
                props.setCurrentStep
              )}
            />
          </CardBody>
        </Card>
      </span>
    </div>
  );
}

export default FileUpload;
