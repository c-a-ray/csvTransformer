import React, { useState } from "react";
import "./App.css";
import FileUpload from "./components/FileUpload";
import ConfigureData from "./components/ConfigureData";
import Transform from "./components/Transform";
import Header from "./components/Header";

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

  const selectFile = (event) => {
    setSelectedFile(event.target.files[0]);
    setIsFileSelected(true);
  };

  async function uploadFile() {
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

  const handleHasHeaderChange = () => {
    setHasHeader(!hasHeader);
  };

  function prepData(data) {
    let col_names = [];
    for (let col_idx = 0; col_idx < data.columns.length; col_idx++) {
      col_names.push(data.columns[col_idx].name);
    }

    let prepared_rows = [];
    let raw_row;
    let prepared_row;

    for (let row_idx = 0; row_idx < data.rowData.length; row_idx++) {
      raw_row = data.rowData[row_idx];
      prepared_row = [];
      for (let col_name of col_names) {
        prepared_row.push(raw_row[col_name]);
      }
      prepared_rows.push({ id: raw_row.id, items: prepared_row });
    }

    return { columns: col_names, rows: prepared_rows };
  }

  async function handleConfigureComplete(columnsToDelete, columnDataTypes) {
    if (tableName.length === 0) {
      alert("Please enter a table name");
      return;
    }
    if (!tableName.match(/^[A-Za-z]+$/)) {
      alert("Table name can only contain letters");
      return;
    }

    let colsToDelete = [];
    for (const [col, del] of Object.entries(columnsToDelete)) {
      if (del) {
        colsToDelete.push(col);
      }
    }

    if (colsToDelete.length === data.columns.length) {
      alert("Cannot create table with no columns");
      return;
    }

    let reqBody = {
      data: data,
      tableName: tableName,
      columnsToDelete: colsToDelete,
      columnDataTypes: columnDataTypes
    };

    const response = await fetch("http://127.0.0.1:8080/insertsql", {
      method: "POST",
      body: JSON.stringify(reqBody),
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    });

    let resBody = await response.json();
    if (resBody["status"] === 200) {
      setData(prepData(resBody["data"]));
      setCurrentStep(3);
    } else {
      alert(resBody["error"]);
    }
  }

  async function handleExecuteQuery(query) {
    const response = await fetch("http://127.0.0.1:8080/executequery", {
      method: "POST",
      body: JSON.stringify({ query: query }),
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    });

    let body = await response.json();
    if (body["status"] === 200) {
      setData(prepData(body["data"]));
    } else {
      alert(body["error"]);
    }
  }

  async function handleDownloadClick() {
    const response = await fetch("http://127.0.0.1:8080/downloadcsv", {
      method: "POST",
      body: JSON.stringify({ query: query, tableName: tableName }),
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    });

    let blob = await response.blob();
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "transformed.csv";
    a.click();
  }

  function getCurrentStep(currentStep) {
    switch (currentStep) {
      default:
      case 1:
        return (
          <FileUpload
            selectFile={selectFile}
            selectedFile={selectedFile}
            uploadFile={uploadFile}
            isSelected={isFileSelected}
            hasHeader={hasHeader}
            handleCheckboxChange={handleHasHeaderChange}
          />
        );
      case 2:
        return (
          <ConfigureData
            data={data}
            onContinue={handleConfigureComplete}
            filename={selectedFile.name}
            tableName={tableName}
            setTableName={setTableName}
          />
        );
      case 3:
        return (
          <Transform
            data={data}
            handleExecuteQuery={handleExecuteQuery}
            setQuery={setQuery}
            query={query}
            handleDownloadClick={handleDownloadClick}
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
