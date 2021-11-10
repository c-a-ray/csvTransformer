def validate_query_columns(query: str) -> str:
    try:
        start_idx = query.index('select') + len('select')
    except ValueError:
        return 'Missing a SELECT clause'

    if start_idx != len('select'):
        return 'Invalid SELECT clause'

    try:
        end_idx = query.index('from')
    except ValueError:
        return 'Missing FROM clause'

    select_str = query[start_idx:end_idx]
    select_list = select_str.split(',')

    select_list = [item.strip() for item in select_list]
    if len(select_list) != len(set(select_list)):
        return 'The same column cannot be selected twice'

    return ''


query = 'select one * two, one from temp'
print(validate_query_columns(query))
