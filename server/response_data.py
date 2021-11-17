"""
response_data.py: 
Contains the ResponseData class, an object used to store and manage 
data for an HTTP response to the CSV Transformer UI.
"""

class ResponseData:
    def __init__(self):
        # Default response
        self.success: bool = True
        self.status: int = 200
        self.error: str = ''
        self.data: dict = {}

    def fail(self, status: int, error: str):
        # Method to set error status and message
        self.success = False
        self.status = status
        self.error = error

    def set_data(self, data: dict):
        # Method to set data field
        self.data = data

    def get_response_dict(self) -> dict:
        # Returns a dictionary of values for response
        return {
            'success': self.success,
            'status': self.status,
            'error': self.error,
            'data': self.data
        }
