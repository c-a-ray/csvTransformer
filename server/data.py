"""data.py: Data manipulation functions"""

from csv import reader
from pandas import DataFrame, read_csv
from postgres import execute_query, init_table, write_query_to_csv
from response_data import ResponseData


def get_col_types(filepath: str, has_header: bool) -> list:
    """
    Reads the first non-header row of a CSV and
    determines each column's data type.

    Args:
        filepath (str): Path to CSV file to find column types for
        has_header (bool): Whether CSV file has header row

    Returns:
        list: List of column data types
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as csv_file:
            r = reader(csv_file)
            first_row: list = []
            for i, line in enumerate(r):
                if i == 0 and has_header:
                    continue
                elif (i > 1 and has_header) or (i > 0 and not has_header):
                    break
                first_row = line
    except OSError as os_err:
        print(f'Error in get_col_types: {os_err}')

    return [type(item) for item in first_row]


def format_data_for_ui(csv_data: DataFrame, has_header: bool, col_types: list) -> dict:
    """
    Takes a DataFrame and transforms it into a
    format that can be used by the UI.

    Args:
        csv_data (DataFrame): DataFrame containing data read from CSV
        has_header (bool): True if the CSV data has a header row, else False

    Returns:
        dict: Data formatted for UI.
    """

    col_names: list = []

    if has_header:
        col_names = replace_bad_col_names(csv_data)
    else:
        for col_idx in range(len(csv_data.columns)):
            col_names.append(f'column{col_idx}')

    csv_data.columns = col_names
    columns: list = [{'name': name} for name in col_names]

    row_data: list = []
    for index, csv_row in csv_data.iterrows():
        row: dict = {col_name: col_types[col_idx](
            csv_row[col_name]) for col_idx, col_name in enumerate(col_names)}
        row['id'] = int(index)
        row_data.append(row)

    return {'columns': columns, 'rowData': row_data}


def replace_bad_col_names(data: DataFrame) -> list:
    """
    In PostgreSQL, when a column is returned
    without a column name, it reads '?column?'.
    This function replaces all missing column
    names with 'column<column index>'.

    Args:
        data (DataFrame): Data set with columns to examine

    Returns:
        list: List of good column names 
    """
    col_names: list = []
    for i, column in enumerate(data.columns):
        if column == '?column?':
            col_names.append(f'column{i}')
        else:
            col_names.append(column.lower().strip())
    data.columns = col_names
    return col_names


def reconstruct_dataframe(ui_data: dict, do_not_include: list) -> DataFrame:
    """
    Converts UI formatted data into a DataFrame.

    Args:
        ui_data (dict): UI formatted data

    Returns:
        DataFrame: DataFrame containing same data as ui_data
    """

    column_lookup: dict = create_column_lookup(ui_data['columns'])

    df_rows: dict = {}
    for ui_data_row in ui_data['rows']:
        df_rows[ui_data_row['id']] = {column_lookup[index]: item for index,
                                      item in enumerate(ui_data_row['items'])}

    df: DataFrame = DataFrame.from_dict(data=df_rows).T
    df.columns = [col.lower() for col in df.columns]

    for col in do_not_include:
        del df[col]

    return df


def create_column_lookup(ui_data_columns: list) -> dict:
    """
    Create a dictionary lookup of column index to column name.

    Args:
        ui_data_columns (list): List of column names.

    Returns:
        dict: Lookup of column index to column name for all names in ui_data_columns
    """
    return {index: column for index, column in enumerate(ui_data_columns)}


def validate_query(query: str) -> str:
    """
    Performs some error checking on user-provided query.
    Ensures that query is in the form 'SELECT ... FROM ...',
    and that there are no duplicate column names in query.

    Args:
        query (str): User-provided query to validate

    Returns:
        str: An error message if query is invalid, else empty str
    """
    try:
        start_idx = query.index('select') + len('select')
    except ValueError:
        return 'Missing a SELECT clause'

    if start_idx != len('select'):
        return 'Invalid SELECT clause'

    try:
        end_idx = query.index('from')
    except ValueError:
        return 'Missing FROM clause'

    select_str = query[start_idx:end_idx]
    select_list = select_str.split(',')

    select_list = [item.strip() for item in select_list]
    if len(select_list) != len(set(select_list)):
        return 'The same column cannot be selected twice'

    return ''


def format_csv_data_for_ui(filepath: str, has_header: bool, res_data: ResponseData):
    """
    Determine column types, read CSV file,
    and format data for consumption by UI.

    Args:
        filepath (str): Path to CSV file to read
        has_header (bool): Whether the CSV file has a head row or not
        res_data (ResponseData): Object to hold data for the response
    """
    col_types = get_col_types(filepath, has_header)
    if len(col_types) == 0:
        res_data.fail(500, 'Failed to determine column types')

    try:
        with open(filepath, 'r', encoding='utf-8') as csv_file:
            csv_data = read_csv(csv_file) if has_header else read_csv(
                csv_file, header=None)
    except OSError as os_err:
        print(f'Error in format_csv_data_for_ui: {os_err}')
        res_data.fail(500, 'Failed to parse CSV')
    else:
        res_data.data = format_data_for_ui(
            csv_data, has_header, col_types)


def get_query_data(query: str, res_data: ResponseData):
    """
    Executes a query, formats it for UI consumption,
    and puts it in the response.

    Args:
        query (str): Query to execute
        res_data (ResponseData): Object to hold data for the response
    """
    raw_data: DataFrame = execute_query(query, res_data)
    if raw_data:
        col_types: list = [type(item) for item in raw_data.iloc[0]]
        res_data.set_data(format_data_for_ui(raw_data, True, col_types))


def initialize_table(data: DataFrame, table_name: str, res_data: ResponseData):
    """
    Creates a new table with contents of data,
    then selects all data from the table
    and puts it in the response.

    Args:
        data (DataFrame): Data to insert into table
        table_name (str): Name for new table
        res_data (ResponseData): Object to hold data for the response
    """
    if init_table(data, table_name, res_data):
        select_all_data_query: str = f'SELECT * FROM {table_name}'
        get_query_data(select_all_data_query, res_data)


def create_download_csv(query: str, table_name: str, path_to_file: str, res_data: ResponseData):
    """
    A wrapper function for the postgres module's
    write_query_to_csv function, which creates
    a downloadable CSV with data from the currently
    displayed query data. If no query has been 
    provided, selects all data from table.

    Args:
        query (str): Current UI query (will be empty if no query has been provided)
        table_name (str): Name of table displayed in UI
        path_to_file (str): Location to save CSV file to
        res_data (ResponseData): Object to hold data for the response
    """
    if not query or len(query) == 0:
        query = f'SELECT * FROM {table_name}'
    write_query_to_csv(query, path_to_file, res_data)
