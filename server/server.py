# Able to: Load CSV, send to backend, parse data, display data in frontend, send display data back to backend, and recompile into dataframe
# Next steps: Create database, create table from df when /insertsql is hit, get query from frontent, get query results, create csv with results, send csv to frontend

from flask import Flask, request, jsonify
from flask.helpers import make_response
from flask_cors import CORS
from pandas import DataFrame, read_csv
import os
import postgres as pg

from pandas.core.frame import DataFrame

app = Flask(__name__)
CORS(app)


@app.route("/loadcsv", methods=['POST'])
def loadcsv():
    res_data = []
    try:
        file = request.files['File']
        filepath = os.path.join(".", "data", file.filename)
        file.save(filepath)
        with open(filepath) as f:
            df = read_csv(f)
            col_names = df.columns.tolist()
            columns = []
            for name in col_names:
                columns.append({
                    'name': name
                })

            row_data = []
            for index, row in df.iterrows():
                r = {}
                r['id'] = int(index)
                for name in col_names:
                    r[name] = int(row[name])
                row_data.append(r)

        json_result = {'columns': columns, 'rowData': row_data}
        res_data.append(json_result)
    except:
        res_data.append({'message': 'Failed to load CSV'})

    res = make_response(jsonify(res_data), 200)
    return res


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


if __name__ == "__main__":
    app.run(port=8080, debug=True)
