import React, { useState } from "react";
import "./App.css";
import FileUpload from "./components/FileUpload";
import ConfigureData from "./components/ConfigureData";
import Transform from "./components/Transform";

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState();
  const [isSelected, setIsSelected] = useState(false);
  const [hasHeader, setHasHeader] = useState(true);
  const [data, setData] = useState();
  const [query, setQuery] = useState();

  const selectFile = (event) => {
    setSelectedFile(event.target.files[0]);
    setIsSelected(true);
  };

  async function uploadFile() {
    if (!isSelected || !selectedFile) {
      alert("Please select a CSV file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("File", selectedFile);

    const response = await fetch("http://127.0.0.1:8080/loadcsv", {
      method: "POST",
      body: formData,
      mode: "cors",
    });

    var body = await response.json();
    if (body["status"] == 200) {
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
    let columns = data.columns;
    let rows = data.rowData;
    let col_names = [];
    for (let i = 0; i < columns.length; i++) {
      col_names.push(columns[i].name);
    }
    col_names.sort();

    let prepared_rows = [];
    for (let i = 0; i < rows.length; i++) {
      let r = [];
      for (let k = 0; k < col_names.length; k++) {
        r.push(rows[i][col_names[k]]);
      }
      prepared_rows.push({ id: rows[i].id, items: r });
    }

    return { columns: col_names, rows: prepared_rows };
  }

  async function handleContinue() {
    const response = await fetch("http://127.0.0.1:8080/insertsql", {
      method: "POST",
      body: JSON.stringify(data),
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    });

    let body = await response.json();
    if (body["status"] == 200) {
      setCurrentStep(3);
    } else {
      alert(body["error"]);
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
    if (body["status"] == 200) {
      setData(prepData(body["data"]));
    } else {
      alert(body["error"]);
    }
  }

  async function handleDownloadClick(query) {
    const response = await fetch("http://127.0.0.1:8080/downloadcsv", {
      method: "POST",
      body: JSON.stringify({ query: query }),
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
            isSelected={isSelected}
            hasHeader={hasHeader}
            handleCheckboxChange={handleHasHeaderChange}
          />
        );
      case 2:
        return <ConfigureData data={data} onContinue={handleContinue} />;
      case 3:
        return (
          <Transform
            data={data}
            handleExecuteQuery={handleExecuteQuery}
            setQuery={setQuery}
            query={query}
            handleDownloadClick={handleDownloadClick}
          />
        );
    }
  }

  return (
    <div className="App">
      <header className="App-header">CSV Transformer</header>

      {getCurrentStep(currentStep)}
    </div>
  );
}

export default App;
