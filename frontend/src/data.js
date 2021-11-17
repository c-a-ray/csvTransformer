export function prepData(data) {
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

export function createColumnLookup(defaultVal, data) {
  let deleteColDict = {};
  for (let col of data.columns) {
    deleteColDict[col] = defaultVal;
  }
  return deleteColDict;
}

export function compileColsToDelete(columnsToDelete, data) {
  let colsToDelete = [];
  for (const [col, del] of Object.entries(columnsToDelete)) {
    if (del) {
      colsToDelete.push(col);
    }
  }

  if (colsToDelete.length === data.columns.length) {
    alert("Cannot create table with no columns");
    return null;
  }

  return colsToDelete;
}

export function downloadCSV(blob, name) {
  let url = window.URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = name + "-transformed.csv";
  a.click();
}