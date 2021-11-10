"""server.py: Endpoints for CSV Transformer"""

from io import TextIOWrapper
from os.path import join, exists
from os import getcwd
from flask import Flask, request, jsonify
from flask.helpers import make_response, send_file
from flask.wrappers import Response
from flask_cors import CORS
from pandas import DataFrame, read_csv
from csv import reader
from werkzeug.datastructures import FileStorage
from validate import validate_csv
from sqlalchemy import exc
from postgres import init_table, execute_query, create_download_csv

app = Flask(__name__)
CORS(app)


class ResponseData:
    def __init__(self) -> None:
        self.success: bool = True
        self.status: int = 200
        self.error: str = ''
        self.data: dict = {}

    def fail(self, status: int, error: str) -> None:
        self.success = False
        self.status = status
        self.error = error

    def set_data(self, data: dict) -> None:
        self.data = data

    def get_response_dict(self) -> dict:
        return {
            'success': self.success,
            'status': self.status,
            'error': self.error,
            'data': self.data
        }


@app.route("/loadcsv", methods=['POST'])
def loadcsv():
    """
    Gets file from request, tests that it is valid by
    calling the CSVChecker microservice, and if valid
    formats data for UI display and sends it to frontend.

    Returns:
        Response: HTTP response containing data or error
    """

    res_data = ResponseData()

    has_header: bool = request.values['HasHeader'].lower() == 'true'
    file: FileStorage = request.files['File']
    filepath: str = join(getcwd(), "data", file.filename)

    try:
        file.save(filepath)
        if validate_csv(filepath):
            with open(filepath, 'r', encoding='utf-8') as csv_file:
                col_types = get_col_types(csv_file, has_header)

            with open(filepath, 'r', encoding='utf-8') as csv_file:
                csv_data = read_csv(csv_file) if has_header else read_csv(
                    csv_file, header=None)
                res_data.data = format_data_for_ui(
                    csv_data, has_header, col_types)
        else:
            res_data.fail(422, 'Invalid CSV. Please upload a valid CSV file.')
    except OSError as os_err:
        res_data.fail(500, 'Server Error: Failed to load CSV')
        print(f'Failed to load CSV: {os_err.strerror}')

    res = res_data.get_response_dict()
    return make_response(jsonify(res), res['status'])


def get_col_types(csv_file: TextIOWrapper, has_header: bool) -> list:
    r = reader(csv_file)
    first_row: list = []
    for i, line in enumerate(r):
        if i == 0 and has_header:
            continue
        elif (i > 1 and has_header) or (i > 0 and not has_header):
            break
        first_row = line

    return [type(item) for item in first_row]


native_data_types = [bool, int, float, str, list]


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
    col_names: list = []
    for i, column in enumerate(data.columns):
        if column == '?column?':
            col_names.append(f'column{i}')
        else:
            col_names.append(column.lower().strip())
    data.columns = col_names
    return col_names


@app.route("/insertsql", methods=['POST'])
def insertsql() -> Response:
    """
    Convert UI formatted data back into a DataFrame
    and create a new database table containing the data.

    Returns:
        Response: HTTP response
    """

    res_data = ResponseData()
    req = request.get_json()

    try:
        init_table(reconstruct_dataframe(req['data']), req['tableName'])
    except exc.SQLAlchemyError as sql_err:
        print(f'Failed to create table: {sql_err}')
        res_data.fail(500, 'Failed to create SQL table')

    res = res_data.get_response_dict()
    return make_response(jsonify(res), res['status'])


def reconstruct_dataframe(ui_data: dict) -> DataFrame:
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


@app.route("/executequery", methods=['POST'])
def executequery() -> Response:
    """
    Executes the query specified in the request on the database.

    Returns:
        Response: HTTP response containing query results
                  formatted for UI or error if execution failed.
    """
    res_data = ResponseData()

    data: dict = request.get_json()
    query: str = f"{data.get('query')}".lower()

    err: str = validate_query_columns(query)
    if len(err) > 0:
        res_data.fail(500, f'Failed to execute query: {err}')
        res = res_data.get_response_dict()
        return make_response(jsonify(res), res['status'])
    else:
        print(f'Executing: {query}')

    try:
        raw_data = execute_query(query)
        col_types = [type(item) for item in raw_data.iloc[0]]
        ui_formatted_data = format_data_for_ui(raw_data, True, col_types)
    except exc.SQLAlchemyError as sql_err:
        print(f'Faled to execute query: {sql_err}')
        res_data.fail(
            500, f'Failed to execute query:\n\n{extract_sql_err(sql_err)}')
    else:
        if len(ui_formatted_data) == 0:
            print('Invalid query')
            res_data.fail(
                500, 'Invalid query. Selected columns must have names.')
        else:
            res_data.set_data(ui_formatted_data)

    res = res_data.get_response_dict()
    return make_response(jsonify(res), res['status'])


def validate_query_columns(query: str) -> str:
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


def extract_sql_err(sql_err) -> str:
    err_str: str = str(sql_err)
    start_index = 0
    end_index = 0
    for i, c in enumerate(err_str):
        if c == ')':
            start_index = i + 2
            break

    for i, c in enumerate(err_str):
        if c == '(':
            end_index = i - 2

    print(start_index)
    print(end_index)
    return err_str[start_index:end_index]


@ app.route("/downloadcsv", methods=['POST'])
def download_csv() -> Response:
    data = request.get_json()
    query = data.get('query')
    path_to_download_file = join(getcwd(), 'data', 'transformed.csv')
    create_download_csv(query, path_to_download_file)

    res_data = ResponseData()
    if exists(path_to_download_file):
        return send_file(path_to_download_file, as_attachment=True)
    else:
        res_data.fail(500, 'Unable to download file')

    res = res_data.get_response_dict()
    return make_response(jsonify(res), res['status'])


if __name__ == "__main__":
    app.run(port=8080, debug=True)
