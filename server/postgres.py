from sqlalchemy import create_engine
from pandas import DataFrame, read_sql
from sqlalchemy.exc import SQLAlchemyError

from response_data import ResponseData


def pg_engine():
    """
    Creates a new engine to connect to CSVTransform DB

    Returns:
        [Engine]: Engine to connect to CSVTransform DB
    """
    return create_engine('postgresql+psycopg2://postgres:password@localhost/csvtransform')


def format_columns(col_type_lkp: dict) -> str:
    pg_cols = '('
    i = 0
    for col in col_type_lkp:
        type = col_type_lkp[col]
        pg_cols = pg_cols + f'{col} {type}'
        if i < len(col_type_lkp) - 1:
            pg_cols = pg_cols + ', '
        i = i + 1
    pg_cols = pg_cols + ')'
    return pg_cols


def init_table(df: DataFrame, table_name: str, res_data: ResponseData) -> bool:
    """
    Creates a new table in the CSVTransform DB

    Args:
        df (DataFrame): Data to insert into table
        table_name (str): Name of table
        res_data (ResponseData): Object to hold data for response

    Returns:
        bool: Whether the table initialization was successful or not
    """
    try:
        with pg_engine().connect() as conn:
            # Re-create schema so no tables are left over
            conn.execute('DROP SCHEMA public CASCADE')
            conn.execute('CREATE SCHEMA public')
            conn.execute('GRANT ALL ON SCHEMA public TO postgres')
            conn.execute('GRANT ALL ON SCHEMA public TO public')

            # Create table with data in df
            df.to_sql(table_name.lower(), conn,
                      if_exists='replace', index=False)
    except SQLAlchemyError as sql_err:
        print(f'Error in init_table: {sql_err}')
        res_data.fail(500, 'Failed to initialize table')
        return False
    return True


def execute_query(query: str, res_data: ResponseData) -> DataFrame:
    """
    Executes a query and returns the data if successful,
    otherwise sets error status/message on response.

    Args:
        query (str): Query to execute
        res_data (ResponseData): Object to hold data for response

    Returns:
        DataFrame: The query results
    """
    try:
        with pg_engine().connect() as conn:
            return read_sql(query, conn)
    except SQLAlchemyError as sql_err:
        print(f'Error in execute_query: {sql_err}')
        res_data.fail(
            500, f'Failed to execute query:\n\n{extract_sql_err(sql_err)}')
        return DataFrame()


def write_query_to_csv(query: str, path_to_file: str, res_data: ResponseData):
    """
    Executes query on DB, then stores results as CSV file

    Args:
        query (str): Query to execute
        path_to_file (str): Location to write CSV
        res_data (ResponseData): Object to hold response data
    """
    try:
        with pg_engine().connect() as conn:
            df = read_sql(query, conn)
            df.to_csv(path_to_file, header=True)
    except SQLAlchemyError as sql_err:
        print(f'Error in create_download_csv: {sql_err}')
        res_data.fail(500, 'Failed to download CSV')


def extract_sql_err(sql_err) -> str:
    """
    Extracts a useful error message from a
    SQLAlchemy error.

    Args:
        sql_err: Raw SQLAlchemy error 

    Returns:
        str: Extracted error message
    """
    err_str: str = str(sql_err)
    start_index = 0
    end_index = 0
    for i, c in enumerate(err_str):
        if c == ')':
            start_index = i + 2
            break

    for i, c in enumerate(err_str):
        if c == '[':
            end_index = i - 2

    print(f"RAW ERROR: {sql_err}")
    print(f"EXTRACTED: {err_str[start_index:end_index]}")

    return err_str[start_index:end_index]
