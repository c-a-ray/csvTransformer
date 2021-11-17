
from subprocess import run
from time import sleep, time
from os.path import join, exists
from os import getcwd, remove
from pandas import read_csv


def validate_csv(csv_path: str) -> bool:
    """
    Interacts with the CSV Checker microservice to
    determine whether a CSV file is valid or not.

    Args:
        csv_path (str): path to CSV file to validate

    Returns:
        bool: True if the CSV file is valid, else false
    """

    # Determine path to the CSV Checker microservice
    svc_path = '/Users/codyray/github.com/chungd87/CS361-Microservice---CSV-Checker/CSVChecker.py'
    
    # Microservice writes output to a csv file with the form "./{csv_filename}OutputResults.csv"
    svc_output_path = join(getcwd(), f'{csv_path[:-4]}OutputResult.csv')

    # Call the microservice and pass the CSV path as an argument
    run(['python3', f'{svc_path}', f'{csv_path}'])

    # Wait until the output file exists
    wait_until_exists(svc_output_path)

    # Read the results and remove the output file
    result = read_csv(svc_output_path)
    remove(svc_output_path)

    # The result is in the first row of column "boolean"
    return bool(result['boolean'].loc[0])


def wait_until_exists(filepath: str):
    """
    Sleeps unil the specified file exists. Checks for 
    file existence every 0.001 seconds and returns as
    soon as the file is detected.

    Args:
        filepath (str): file to wait for
    """    
    start = time()
    elapsed = 0
    while not exists(filepath) and elapsed < 2:
        sleep(0.001)
        elapsed = time() - start
