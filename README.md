### CSV Transformer

CSV Transformer is a browser application that allows users to load a CSV file, do some UI-based configuration, and insert the CSV data into a PostgreSQL database. The user can write and execute queries with a provided query editor. Query results can then be viewed as a table in the browser and/or downloaded as a CSV.

A list of currently existing functionality:
    - Load a CSV file
    - View the CSV file as a table in the browser
    - Indicate whether the CSV file has a header
    - Choose which columns should not be included
    - Select a data type for each column
    - Choose a table name
    - Create a table in a PostgreSQL database
    - Execute queries on the table
    - View the query results in the browser
    - Download the query results


#### Running
To run, you'll need Python 3 and the NPM package manager.

You will need to run both the frontend and server. The server must have access to a PostgreSQL database (I am running version 13.3). The database connection credentials can be updated in `csvTransformer/server/postgres.py` on line 18.

##### To start the server:
1. `cd` to `csvTransformer/server`
2. Set up a virtual environment and install the required dependencies by running:
    - `python3 -m venv ./venv`
    - `source ./venv/bin/activate`
    - `python3 -m pip install -r requirements.txt`
3. Run `python3 -m server`

##### To start the frontend:
1. `cd` to `csvTransform/frontend`
2. Run `npm install`
3. Run `npm start`