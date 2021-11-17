"""data.py: Data manipulation functions"""

from csv import reader
from pandas import DataFrame, read_csv
from postgres import execute_query, init_table, write_query_to_csv
from response_data import ResponseData
from numpy import int64, float64

# UI type text -> Python type
text_to_type_lookup: dict = {
    'int': int,
    'float': float,
    'text': str
}

# Numpy type -> Python type
numpy_to_type_lookup: dict = {
    int64: int,
    float64: float
}


def format_data_for_ui(df: DataFrame, has_header: bool) -> dict:
    """
    Takes a DataFrame and transforms it into a format that can be used by the UI.

    Args:
        csv_data (DataFrame): DataFrame containing data read from CSV
        has_header (bool): True if the CSV data has a header row, else False

    Returns:
        dict: data formatted for UI table
    """

    # Ensure that column names are not duplicated, are lower case, 
    # and don't have any surrounding whitespace
    col_names: list[str] = determine_column_names(df, has_header)

    # Replace the DataFrame column names with the validated column names
    df.columns = col_names

    # Create a list of UI formatted row data
    ui_rows: list[dict] = create_ui_rows(df, col_names)

    # Return column names and row data in the form expected by UI
    return {'columns': col_names, 'rowData': ui_rows}


def create_ui_rows(df: DataFrame, column_names: list) -> list[dict]:
    """
    Create a list of rows formatted for the CSV Transformer UI.
    Each row is represented by a dictionary of Column Name -> Cell Value.
    Each row is also given a unique row ID. Each value is cast to
    its determined data type.

    Args:
        df (DataFrame): DataFrame to convert to UI formatted data
        column_names (list): list of column names

    Returns:
        list[dict]: list of rows formatted for UI
    """

    column_types: list = determine_column_types(df)
    ui_rows: list = []

    # Walk through every row in the DataFrame
    for row_idx, df_row in df.iterrows():
        ui_row: dict = {'id': int(row_idx)}

        # Walk through every column
        for col_idx, col_name in enumerate(column_names):
            # Cast the cell value to the determined data type and save it to the UI row
            ui_row[col_name] = column_types[col_idx](df_row[col_name])

        # Add the new UI row to ui_rows
        ui_rows.append(ui_row)
    
    return ui_rows


def determine_column_types(df: DataFrame) -> list:
    """
    Creates a list of data types for the columns in the DataFrame.
    Walks through the values in the first row of the DataFrame, 
    inferring each value's type and adding it to the list. If the
    inferred type is a Numpy type, it is converted to a corresponding
    basic Python data type because Numpy types are not JSON serializable.

    Args:
        df (DataFrame): DataFrame to determine types for

    Returns:
        list: list of column data types
    """    

    column_types: list = []

    # Walk through the values in the first row of the DataFrame
    for val in df.iloc[0]:
        # Infer the type. If the inferred type is a Numpy type, convert it to a basic type
        t = type(val) \
            if type(val) not in numpy_to_type_lookup \
            else numpy_to_type_lookup[type(val)]
        
        # Add the type to the list
        column_types.append(t)
    
    return column_types


def determine_column_names(raw_data: DataFrame, has_header: bool) -> list:
    """
    Ensure that column names are unique. 
    
    When a table is returned from PostgreSQL without column names, 
    the columns are "?column?". Column names cannot be duplicated 
    due to the way the table data is being formatted for the UI. 
    This function replaces all duplicated columns and those labelled 
    "?column?" with "column{column_index}". If column name is unique,
    it is cast to lower case and stripped of any whitespace before
    it is added to the list to be returned.
    
    E.g. if the second column is labelled "?column?", it is replaced 
    with "column1" (0 index used).

    Args:
        raw_data (DataFrame): [description]
        has_header (bool): [description]

    Returns:
        list: [description]
    """    
    
    col_names: list = []

    for i, column in enumerate(raw_data.columns):
        if column == '?column?' or column in col_names or not has_header:
            # The column name is duplicated or missing
            col_names.append(f'column{i}')
        else:
            # Column name OK; just make it lowercase and strip any whitespace from it
            col_names.append(column.lower().strip())

    return col_names


def reconstruct_dataframe(ui_data: dict, do_not_include: list, column_data_types: dict, res_data: ResponseData) -> DataFrame:
    """
    Converts UI formatted data into a DataFrame.

    Args:
        ui_data (dict): UI formatted data
        do_not_include (list): list of columns marked for removal in UI
        column_data_types (dict): column data types specified in UI
        res_data (ResponseData): object managing response data; only used here in case an error needs to be added

    Returns:
        DataFrame: DataFrame containing same data as ui_data
    """

    # Create dictionary of Index -> Column Name to determine column name based on row index
    column_lookup: dict = {index: column for index, column in enumerate(ui_data['columns'])}

    # Create a dictionary of Row ID -> Column Name -> Cell Value so it can be used to create a DataFrame
    df_rows: dict = {}
    for ui_data_row in ui_data['rows']:
        df_rows[ui_data_row['id']] = {column_lookup[index]: item for index,
                                      item in enumerate(ui_data_row['items'])}

    # Create a DataFrame from the rows dictionary
    df: DataFrame = DataFrame.from_dict(data=df_rows).T

    # Set the column data types to the types specified in the UI
    # If the data type is not valid for the column, mark response as failed
    for column in df:
        try:
            df[column] = df[column].astype(text_to_type_lookup[column_data_types[column]])
        except ValueError:
            res_data.fail(
                422, f'"{column_data_types[column]}" is not a valid data type for column "{column}"')
            return DataFrame()

    # Make all column names lower case
    df.columns = [col.lower() for col in df.columns]

    # Delete columns marked for removal in UI
    for col in do_not_include:
        del df[col]

    return df


def validate_query(query: str) -> str:
    """
    Performs some error checking on user-provided query.
    Ensures that query is in the form 'SELECT ... FROM ...',
    and that there are no duplicate columns selected in query.

    This function is pretty hacky. This is a good place
    for improvement. This is mainly intended to restrict
    the kind of queries that the user can run for security
    reasons and to reduce the amount of error checking that 
    needs to take place because of that.

    Args:
        query (str): user-provided query to validate

    Returns:
        str: an error message if query is invalid, else empty str
    """

    # Find the start of the SELECT clause
    try:
        start_idx = query.index('select') + len('select')
    except ValueError:
        return 'Missing a SELECT clause'

    # Check that the query is a SELECT statement (starts with SELECT)
    if start_idx != len('select'):
        return 'Invalid SELECT clause'

    # Find the FROM clause
    try:
        end_idx = query.index('from')
    except ValueError:
        return 'Missing FROM clause'

    # Between SELECT and FROM are the columns
    select_str = query[start_idx:end_idx]

    # Split them apart and strip them of whitespace
    select_list = select_str.split(',')
    select_list = [item.strip() for item in select_list]

    # Check that there are no duplicate columns selected
    if len(select_list) != len(set(select_list)):
        return 'The same column cannot be selected twice'

    return ''


def format_csv_data_for_ui(filepath: str, has_header: bool, res_data: ResponseData):
    """
    Opens a CSV file, reads it into a DataFrame, formats the data for the UI,
    and adds the formatted data to the response.

    Args:
        filepath (str): path to CSV file to read
        has_header (bool): whether the CSV file has a head row or not
        res_data (ResponseData): object to hold data for the response
    """

    try:
        # Try opening the file and reading it into a CSV
        with open(filepath, 'r', encoding='utf-8') as csv_file:
            csv_data = read_csv(csv_file) if has_header else read_csv(
                csv_file, header=None)
    except OSError as os_err:
        # If there was an error opening the file, add error to response
        print(f'Error in format_csv_data_for_ui: {os_err}')
        res_data.fail(500, 'Failed to parse CSV')
    else:
        # No error opening/reading the file; format the data for the UI and add it to response
        res_data.data = format_data_for_ui(csv_data, has_header)


def get_query_data(query: str, res_data: ResponseData):
    """
    Executes a query, formats it for UI consumption, and puts it in the response.

    Args:
        query (str): query to execute
        res_data (ResponseData): object to hold data for the response
    """

    # Execute the query and read results into a DataFrame
    raw_data: DataFrame = execute_query(query, res_data)

    if not raw_data.empty:
        # Format the query results for the UI and put it in the response
        res_data.set_data(format_data_for_ui(raw_data, True))


def initialize_table(data: DataFrame, table_name: str, res_data: ResponseData):
    """
    Creates a new table with contents of data, then selects all data 
    from the table and puts it in the response.

    Args:
        data (DataFrame): data to insert into table
        table_name (str): name for new table
        res_data (ResponseData): object to hold data for the response
    """

    # Don't allow PostgreSQL reserved words as table name
    if table_name.lower() in ['table', 'select', 'from']:
        res_data.fail(422, f'"{table_name}" is not a valid table name')
        return

    # Create a new table in the DB with the data in the DataFrame
    if init_table(data, table_name, res_data):
        # If that succeeded, select all data from the table and add it to the response
        select_all_data_query: str = f'SELECT * FROM {table_name}'
        get_query_data(select_all_data_query, res_data)


def create_download_csv(query: str, table_name: str, path_to_file: str, res_data: ResponseData):
    """
    A wrapper function for the postgres module's write_query_to_csv function, 
    which creates a downloadable CSV with data from the currently displayed 
    query data. If no query has been provided, selects all data from table.

    Args:
        query (str): Current UI query (will be empty if no query has been provided)
        table_name (str): Name of table displayed in UI
        path_to_file (str): Location to save CSV file to
        res_data (ResponseData): Object to hold data for the response
    """

    # If no query has been run yet, select all data
    if not query or len(query) == 0:
        query = f'SELECT * FROM {table_name}'
    
    # Execute the query and create the CSV
    write_query_to_csv(query, path_to_file, res_data)
