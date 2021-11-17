"""server.py: Endpoints for CSV Transformer"""

from os.path import join, exists
from os import getcwd
from flask import Flask, request, jsonify
from flask.helpers import make_response, send_file
from flask.wrappers import Response
from flask_cors import CORS
from pandas.core.frame import DataFrame
from werkzeug.datastructures import FileStorage
from validate import validate_csv

from data import validate_query, reconstruct_dataframe, format_csv_data_for_ui, get_query_data, create_download_csv, initialize_table
from response_data import ResponseData

app = Flask(__name__)
CORS(app)


@app.route('/loadcsv', methods=['POST'])
def loadcsv() -> Response:
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
    file.save(filepath)

    if validate_csv(filepath):
        format_csv_data_for_ui(filepath, has_header, res_data)
    else:
        res_data.fail(422, 'Invalid CSV. Please upload a valid CSV file.')

    res: dict = res_data.get_response_dict()
    return make_response(jsonify(res), res['status'])


@app.route('/initializeTable', methods=['POST'])
def initializeTable() -> Response:
    """
    Convert UI formatted data back into a DataFrame
    and create a new database table containing the data.

    Returns:
        Response: HTTP response
    """

    res_data = ResponseData()
    req: dict = request.get_json()

    data: DataFrame = reconstruct_dataframe(req['data'], req['columnsToDelete'], req['columnDataTypes'], res_data)

    print(data.dtypes)
    
    if not data.empty:
        initialize_table(data, req['tableName'], res_data)

    res: dict = res_data.get_response_dict()
    return make_response(jsonify(res), res['status'])


@app.route('/executeQuery', methods=['POST'])
def executeQuery() -> Response:
    """
    Executes the query specified in the request on the database.

    Returns:
        Response: HTTP response containing query results
                  formatted for UI or error if execution failed.
    """
    res_data = ResponseData()

    data: dict = request.get_json()
    query: str = f"{data.get('query')}".lower()

    err: str = validate_query(query)
    if len(err) > 0:
        print(f'Error executing query: {err}')
        res_data.fail(500, f'Failed to execute query: {err}')
    else:
        print(f'Executing: {query}')
        get_query_data(query, res_data)

    res: dict = res_data.get_response_dict()
    return make_response(jsonify(res), res['status'])


@app.route('/downloadcsv', methods=['POST'])
def download_csv() -> Response:
    """
    Creates a CSV to download containing the
    data currently displayed in the UI.

    Returns:
        Response: HTTP response containing the download file
    """
    res_data = ResponseData()

    data = request.get_json()
    path_to_download_file = join(getcwd(), 'data', 'transformed.csv')
    create_download_csv(data.get('query'), data.get(
        'tableName'), path_to_download_file, res_data)

    if exists(path_to_download_file):
        return send_file(path_to_download_file, as_attachment=True)
    else:
        res_data.fail(500, 'Failed to download CSV')

    res = res_data.get_response_dict()
    return make_response(jsonify(res), res['status'])


if __name__ == "__main__":
    app.run(port=8080, debug=True)
