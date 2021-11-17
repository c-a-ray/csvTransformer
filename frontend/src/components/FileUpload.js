import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import ContinueButton from "./ContinueButton";
import { prepData } from "../data"
import "../styles/App.css";

function FileUpload(props) {
  const selectFile = (event) => {
    props.setSelectedFile(event.target.files[0]);
    props.setIsFileSelected(true);
  };

  const handleHasHeaderChange = () => {
    props.setHasHeader(!props.hasHeader);
  };

  async function uploadFile() {
    if (!props.isFileSelected || !props.selectedFile) {
      alert("Please select a CSV file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("File", props.selectedFile);
    formData.append("HasHeader", props.hasHeader);

    const response = await fetch("http://127.0.0.1:8080/loadcsv", {
      method: "POST",
      body: formData,
      mode: "cors",
    });

    var body = await response.json();
    if (body["status"] === 200) {
      props.setData(prepData(body["data"]));
      props.setCurrentStep(2);
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
            <input type="file" name="file" onChange={selectFile} />
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
                onChange={handleHasHeaderChange}
              />
              CSV has header row
            </label>
          </CardBody>
          <CardBody>
            <ContinueButton
              handleSubmission={() => uploadFile()}
            />
          </CardBody>
        </Card>
      </span>
    </div>
  );
}

export default FileUpload;
