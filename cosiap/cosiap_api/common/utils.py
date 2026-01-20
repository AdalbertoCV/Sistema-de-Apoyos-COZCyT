import sqlparse
import json

def print_dict(diccionario):
    print(json.dumps(diccionario, indent=2, separators=(",", ": "), ensure_ascii=False))
    pass

def print_captured_queries(captured_queries):
    for i, query in enumerate(captured_queries, start=1):
        print(f'QUERY {i}:')
        formatted_sql = sqlparse.format(query["sql"], reindent=True, keyword_case='upper')
        print(formatted_sql)
        print(f'TIME: {query["time"]}s\n')