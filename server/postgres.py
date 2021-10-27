from sqlalchemy import create_engine, text, INTEGER
from numpy import int64
from pandas import DataFrame, read_csv

numpyDataTypeLkp = {
    int64: INTEGER
}


def getColumnsAndTypes(df: DataFrame) -> dict:
    colTypeLkp = {}
    firstRow = df.iloc[0]
    for i, col_name in enumerate(df):
        colTypeLkp[col_name] = numpyDataTypeLkp.get(type(firstRow[i]))
    return colTypeLkp


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
    colTypeLkp = getColumnsAndTypes(df)
    with pgEngine().connect() as conn:
        df.to_sql('temp', conn, if_exists='replace', dtype=colTypeLkp)
