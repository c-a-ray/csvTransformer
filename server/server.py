from flask import Flask, request, jsonify
from flask.helpers import make_response, send_file
from flask_cors import CORS
from pandas import DataFrame, read_csv
from validate import validate_csv
import os
import postgres as pg

app = Flask(__name__)
CORS(app)


@app.route("/loadcsv", methods=['POST'])
def loadcsv():
    res_data = []
    res_code = 200
    try:
        file = request.files['File']
        filepath = os.path.join(os.getcwd(), "data", file.filename)
        file.save(filepath)
        is_valid = validate_csv(filepath)
        if is_valid:
            with open(filepath) as f:
                res_data.append(prepDataForFrontend(read_csv(f)))
                res_data.append({'message': 'success'})
        else:
            res_data.append({'message': 'Invalid CSV'})
            res_code = 422
    except:
        res_data.append({'message': 'Failed to load CSV'})
        res_code = 500

    return make_response(jsonify(res_data), res_code)


def prepDataForFrontend(df: DataFrame):
    col_names = df.columns.tolist()
    columns = []
    for name in col_names:
        columns.append({'name': name})

    row_data = []
    for index, row in df.iterrows():
        r = {}
        r['id'] = int(index)
        for name in col_names:
            r[name] = row[name]
        row_data.append(r)

    return {'columns': columns, 'rowData': row_data}


@app.route("/insertsql", methods=['POST'])
def insertsql():
    pg.init_table(compileDF(request.get_json()))
    return make_response(jsonify({"success": 1}), 200)


def compileDF(data) -> DataFrame:
    cols = data['columns']
    col_lkp = {}
    for i, col in enumerate(cols):
        col_lkp[i] = col

    rows = {}
    for row in data['rows']:
        r = {}
        for i, item in enumerate(row['items']):
            r[col_lkp[i]] = item
        rows[row['id']] = r

    return DataFrame.from_dict(data=rows).T


@app.route("/executequery", methods=['POST'])
def executequery():
    data = request.get_json()
    query = f"""{ data.get('query')}"""
    print(f'Executing: {query}')
    resData = []
    resData.append(prepDataForFrontend(pg.execute_query(query)))
    return make_response(jsonify(resData), 200)


@app.route("/downloadcsv", methods=['POST'])
def download_csv():
    data = request.get_json()
    query = data.get('query')
    pathToFile = os.path.join(os.getcwd(), 'data', 'transformed.csv')
    pg.create_downloadCSV(query, pathToFile)
    return send_file(pathToFile, as_attachment=True)


if __name__ == "__main__":
    app.run(port=8080, debug=True)
