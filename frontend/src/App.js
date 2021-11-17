import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import ConfigureData from "./components/ConfigureData";
import Transform from "./components/Transform";
import Header from "./components/Header";
import "./styles/App.css";

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState();
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [hasHeader, setHasHeader] = useState(true);
  const [data, setData] = useState();
  const [query, setQuery] = useState("");
  const [tableName, setTableName] = useState("");

  function handleHeaderBtnClick() {
    setCurrentStep(1);
    setSelectedFile();
    setIsFileSelected(false);
    setSelectedFile();
    setHasHeader(true);
    setData();
    setQuery();
    setTableName("");
  }

  function getCurrentStep(currentStep) {
    switch (currentStep) {
      default:
      case 1:
        return (
          <FileUpload
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            isFileSelected={isFileSelected}
            setIsFileSelected={setIsFileSelected}
            hasHeader={hasHeader}
            setHasHeader={setHasHeader}
            setData={setData}
            setCurrentStep={setCurrentStep}
          />
        );
      case 2:
        return (
          <ConfigureData
            data={data}
            setData={setData}
            filename={selectedFile.name}
            tableName={tableName}
            setTableName={setTableName}
            setCurrentStep={setCurrentStep}
          />
        );
      case 3:
        return (
          <Transform
            data={data}
            setData={setData}
            query={query}
            setQuery={setQuery}
            tableName={tableName}
          />
        );
    }
  }

  return (
    <div className="App">
      <Header
        handleHeaderBtnClick={handleHeaderBtnClick}
        isFileSelected={isFileSelected}
      />

      {getCurrentStep(currentStep)}
    </div>
  );
}

export default App;
