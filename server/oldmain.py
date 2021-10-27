from flask import Flask, request, jsonify
from flask.helpers import make_response
from pandas.io.parsers import read_csv
from flask_cors import CORS, cross_origin
import pandas as pd
import os

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
            df = pd.read_csv(f)
            col_names = df.columns.tolist()
            columns = []
            for name in col_names:
                columns.append({
                    'key': name.lower(),
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


if __name__ == "__main__":
    app.run(port=8080, debug=True)
