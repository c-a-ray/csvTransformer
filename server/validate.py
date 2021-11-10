
from subprocess import run
from time import sleep, time
from os.path import join, exists
from os import getcwd, remove
from pandas import read_csv


def validate_csv(csv_path: str) -> bool:
    svc_path = '/Users/codyray/github.com/chungd87/CS361-Microservice---CSV-Checker/CSVChecker.py'
    csv_filename = csv_path[:-4]
    svc_output_path = join(getcwd(), f'{csv_filename}OutputResult.csv')

    run(['python3', f'{svc_path}', f'{csv_path}'])

    start = time()
    elapsed = 0
    while not exists(svc_output_path) and elapsed < 2:
        sleep(0.001)
        elapsed = time() - start

    result = read_csv(svc_output_path)
    remove(svc_output_path)
    return bool(result['boolean'].loc[0])
