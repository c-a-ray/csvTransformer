// data.js
// Helper functions for manipulating data

// Format data to form expected by the <RenderData /> component
export function prepData(data) {
  // Create an array of row objects containing a unique ID
  // and a list of row values in the same order as the column names list
  let prepared_rows = [];
  for (let row_idx = 0; row_idx < data.rowData.length; row_idx++) {
    let raw_row = data.rowData[row_idx];
    let prepared_row = [];

    for (let col_name of data.columns) {
      prepared_row.push(raw_row[col_name]);
    }
    prepared_rows.push({ id: raw_row.id, items: prepared_row });
  }

  // Return data in the form expected by the <RenderData /> component
  return { columns: data.columns, rows: prepared_rows };
}

// Create a dictionary of Column Name -> Default Value
export function createColumnLookup(defaultVal, data) {
  let deleteColDict = {};
  for (let col of data.columns) {
    deleteColDict[col] = defaultVal;
  }
  return deleteColDict;
}

// Creates a list of columns to delete
// The columnsToDelete parameter is a dictionary of Column Name -> bool
// where bool is True if the column was marked for deletion, else False
export function compileColsToDelete(columnsToDelete, data) {
  let colsToDelete = [];
  for (const [col, del] of Object.entries(columnsToDelete)) {
    if (del) {
      // Add all columns where delete is true
      colsToDelete.push(col);
    }
  }

  // Make sure not all columns were deleted
  if (colsToDelete.length === data.columns.length) {
    alert("Cannot create table with no columns");
    return null;
  }

  return colsToDelete;
}

// Takes a blob, creates a download link element,
// that will download the blob as a file named
// {tableName}-transformed.csv, and clicks the
// link
export function downloadCSV(blob, name) {
  let url = window.URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = name + "-transformed.csv";
  a.click();
}