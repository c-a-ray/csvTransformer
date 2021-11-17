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
from response_data import ResponseData
from data import (
    validate_query,
    reconstruct_dataframe,
    format_csv_data_for_ui,
    get_query_data,
    create_download_csv,
    initialize_table
)

app = Flask(__name__)
CORS(app)


@app.route('/loadcsv', methods=['POST'])
def loadcsv() -> Response:
    """
    Endpoint for initial CSV load 
    (called after clicking first CONTINUE button in UI).

    Gets file from request, tests that it is valid by calling 
    the CSVChecker microservice, and if valid formats data for 
    UI display and sends it to front end, otherwise sends a 
    failed response with an error message.

    Returns:
        Response: HTTP response containing data or error
    """

    # Initialize object to hold all response data
    res_data = ResponseData()

    # Get request data
    has_header: bool = request.values['HasHeader'].lower() == 'true' # Whether CSV has header row
    file: FileStorage = request.files['File']                        # Uploaded file

    # Save the uploaded file locally
    filepath: str = join(getcwd(), "data", file.filename)
    file.save(filepath)

    # Validate the CSV with the CSV Checker microservice
    if validate_csv(filepath):
        # The CSV is valid; put it in a UI digestible format and add it to the response
        format_csv_data_for_ui(filepath, has_header, res_data)
    else:
        # The CSV is not valid; add an error code and message to the response
        res_data.fail(422, 'Invalid CSV. Please upload a valid CSV file.')

    res: dict = res_data.get_response_dict()            # Convert ResponseData object to dictionary 
    return make_response(jsonify(res), res['status'])   # Create and return the response


@app.route('/initializeTable', methods=['POST'])
def initializeTable() -> Response:
    """
    Endpoint for inserting data into SQL DB 
    (after clicking second CONTINUE button in UI).

    Convert UI formatted data back into a DataFrame 
    and create a new database table containing the data.

    Returns:
        Response: HTTP response containing data or error
    """

    res_data = ResponseData()

    # Get request data
    req: dict = request.get_json()

    # Create a DataFrame from the UI formatted data
    data: DataFrame = reconstruct_dataframe(
        req['data'], req['columnsToDelete'], req['columnDataTypes'], res_data)
    
    # If the DataFrame is empty, an error occurred
    if not data.empty:
        # If no error, create a new DB table with the data in the DataFrame,
        # selects all data from that table, formats it for the UI, and puts
        # it in the response
        initialize_table(data, req['tableName'], res_data)

    # Send the response
    res: dict = res_data.get_response_dict()
    return make_response(jsonify(res), res['status'])


@app.route('/executeQuery', methods=['POST'])
def executeQuery() -> Response:
    """
    Endpoint for executing a query (available in the last UI view).

    Executes the query specified in the request on the database and
    returns the results.

    Returns:
        Response: HTTP response containing query results
                  formatted for UI or error if execution failed.
    """

    res_data = ResponseData()

    # Get the query from the request and make it all lower case
    query: str = f"{request.get_json().get('query')}".lower()

    # Run some validation on the query to make sure it won't break anything
    err: str = validate_query(query)
    if len(err) > 0:
        # Error occurred; send back the error
        print(f'Error executing query: {err}')
        res_data.fail(500, f'Failed to execute query: {err}')
    else:
        # Query is OK; execute it and put the data in the response
        print(f'Executing: {query}')
        get_query_data(query, res_data)

    res: dict = res_data.get_response_dict()
    return make_response(jsonify(res), res['status'])


@app.route('/downloadcsv', methods=['POST'])
def download_csv() -> Response:
    """
    Endpoint for downloading a CSV with the data currently
    displayed in the UI.

    Runs the last executed query (or selects all data if no
    query has been executed), writes the results to a file,
    and sends the file to the front end.

    Returns:
        Response: HTTP response containing the download file or an error
    """

    res_data = ResponseData()

    # Request data should contain 'query' and 'tableName'
    data = request.get_json()

    # Get the data and write it to a CSV file
    path_to_download_file = join(getcwd(), 'data', 'transformed.csv')
    create_download_csv(data.get('query'), data.get(
        'tableName'), path_to_download_file, res_data)

    # Check that the CSV was created
    if exists(path_to_download_file):
        # Send the file to the front end
        return send_file(path_to_download_file, as_attachment=True)
    else:
        # There was an error creating the file; send an error
        res_data.fail(500, 'Failed to download CSV')

    res = res_data.get_response_dict()
    return make_response(jsonify(res), res['status'])


if __name__ == "__main__":
    app.run(port=8080, debug=True)
