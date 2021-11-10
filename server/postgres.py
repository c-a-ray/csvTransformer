from sqlalchemy import create_engine, text
from pandas import DataFrame, read_sql


def pg_engine():
    return create_engine('postgresql+psycopg2://postgres:password@localhost/csvtransform')


def create_table(conn, col_type_lkp: dict):
    f_cols = format_columns(col_type_lkp)
    create_table_query = text(f'CREATE TABLE IF NOT EXISTS temp{f_cols}')
    conn.execute(create_table_query)


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


def init_table(df: DataFrame, table_name: str):
    with pg_engine().connect() as conn:
        df.to_sql(table_name.lower(), conn, if_exists='replace', index=False)


def execute_query(query: str):
    with pg_engine().connect() as conn:
        return read_sql(query, conn)


def create_download_csv(query: str, path_to_file: str):
    with pg_engine().connect() as conn:
        df = read_sql(query, conn)
        df.to_csv(path_to_file, header=True)
