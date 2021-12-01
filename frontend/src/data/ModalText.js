import BrowseButtonImage from "../images/browse_button.png";
import HeaderCheckboxImage from "../images/header_checkbox.png";
import ContinueButtonImage from "../images/continue_button.png";
import EnterTableNameImage from "../images/enter_table_name.png";
import DeleteCheckboxImage from "../images/delete_checkbox.png";
import DataTypeDropdownImage from "../images/data_type_dropdown.png";

import "../styles/HelpModal.css";

export const WelcomeText = () => {
  return (
    <div>
      <h3 className="modal-section-header">Welcome!</h3>
      <p>
        CSV Transformer is a tool you can use to easily perform quick and dirty
        transformations on CSV data.
      </p>
      <p>
        The tool allows you to load a CSV file, perform some point-and-click
        configuration, run PostgreSQL SELECT queries on the data, and download
        the results as a new CSV file.
      </p>
      <p>
        The tool is designed to make it simple and easy to leverage the power of
        PostgreSQL to perform transformations and gain insights on CSV data.
      </p>
      <p>
        If you are comfortable writing SQL queries and you have CSV data to
        transform, this tool is for you!
      </p>
      <i>
        Hint: clicking on the "CSV Transformer" button in the header at any
        point will reset everything and return you to the first step
      </i>
    </div>
  );
};

export const PageOneHelpText = () => {
  return (
    <div>
      <h4 className="modal-section-header">Getting started</h4>
      <p>
        To get started, use the file browser to select a CSV file to transform.
        The file must be a valid CSV file in which all rows have the same number
        of columns and every column has only one data type.
      </p>
      <div className="modal-image">
        <img src={BrowseButtonImage} />
      </div>
      <p>
        If the chosen file has a header row, check the header checkbox. If this
        is checked, the first row in the CSV will be used as a header. If it is
        not checked, the columns will be labelled "column1", "column2", etc. and
        the first row will be included as the first table row.
      </p>
      <div className="modal-image">
        <img src={HeaderCheckboxImage} />
      </div>
      <p>
        After a file is selected, just click on the "Continue" button to move to
        the configuration page
      </p>
      <div className="modal-image">
        <img src={ContinueButtonImage} />
      </div>
    </div>
  );
};

export const PageTwoHelpText = () => {
  return (
    <div>
      <h4 className="modal-section-header">Configuring your temporary table</h4>
      <p>
        In this view, you will make some configuration decisions that will
        affect how your CSV data is stored in the temporary database. First, you
        must choose a table name. When this step is complete, a new temporary
        table will be created in a PostgreSQL database with this name. For
        example, if you name the table "myTable" in this step, you will access
        the data in the next step by running queries that end with "FROM
        myTable"
      </p>
      <div className="modal-image">
        <img src={EnterTableNameImage} />
      </div>
      <p>
        At the bottom right of this page, there is a table to perform
        configuration on columns. The table has one row for every column in the
        loaded CSV data. If the "Delete" checkbox is checked for a column, that
        column is not included when the PostgreSQL table is created.
      </p>
      <div className="modal-image">
        <img src={DeleteCheckboxImage} />
      </div>
      <p>
        Additionaly, each column row has a "Select Data Type" dropdown for
        determining each column's data type. The default type is "text" because
        this will work with any kind of value. If a column contains only
        integers, for example, you would want to set that column to "int". If an
        invalid data type is given (e.g. specifying a column with text as "int")
        will result in an error when attempting to continue.
      </p>
      <div className="modal-image">
        <img src={DataTypeDropdownImage} />
      </div>
      <p>
        When configuration is finished, click on the "Continue" button to create
        the SQL table and open up the query editor.
      </p>
      <div className="modal-image">
        <img src={ContinueButtonImage} />
      </div>
    </div>
  );
};

export const PageThreeHelpText = () => {
  return (
    <div>
      <h3>Transforming your data</h3>
      <p>
        Your data is now stored in a temporary table in a PostgreSQL database.
        The name of this table is displayed above the displayed data. To run a
        query, just type it into the PostgreSQL Query Editor and click on the
        "Execute Query" button.
      </p>
      <p>
        Note that not all PostgreSQL queries are allowed. There are a few rules:
      </p>
      <ul>
        <li>Queries must begin with "SELECT"</li>
        <li>Queries must contain "FROM"</li>
        <li>Every column name between "SELECT" and "FROM" must be unique</li>
      </ul>
      <p>
        When you execute a query, the displayed data is replaced by the query
        results. Once your data is in the state you want it in, click on the
        "Download" button to download a new CSV file containing the currently
        displayed data.
      </p>
      <p>
        <i>
          Hint: if you have run a query and want to go back and view the
          original data, you can run "SELECT * FROM table" where table is the
          name of your temporary table.
        </i>
      </p>
    </div>
  );
};
