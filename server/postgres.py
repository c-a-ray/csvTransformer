from sqlalchemy import create_engine, text
from numpy import int64
from pandas import DataFrame, read_sql


def pgEngine():
    return create_engine('postgresql+psycopg2://postgres:password@localhost/csvtransform')


def createTable(conn, colTypeLkp: dict):
    fCols = create_formattedPGCols(colTypeLkp)
    pgQuery_createTable = text(f'CREATE TABLE IF NOT EXISTS temp{fCols}')
    conn.execute(pgQuery_createTable)


def create_formattedPGCols(colTypeLkp: dict) -> str:
    pg_cols = '('
    i = 0
    for col in colTypeLkp:
        type = colTypeLkp[col]
        pg_cols = pg_cols + f'{col} {type}'
        if i < len(colTypeLkp) - 1:
            pg_cols = pg_cols + ', '
        i = i + 1
    pg_cols = pg_cols + ')'
    return pg_cols


def init_table(df: DataFrame):
    with pgEngine().connect() as conn:
        df.to_sql('temp', conn, if_exists='replace')


def execute_query(query: str):
    with pgEngine().connect() as conn:
        return read_sql(query, conn)


def create_downloadCSV(query: str, path_to_file: str):
    with pgEngine().connect() as conn:
        df = read_sql(query, conn)
        df.to_csv(path_to_file, header=True)
