class ResponseData:
    def __init__(self) -> None:
        self.success: bool = True
        self.status: int = 200
        self.error: str = ''
        self.data: dict = {}

    def fail(self, status: int, error: str) -> None:
        self.success = False
        self.status = status
        self.error = error

    def set_data(self, data: dict) -> None:
        self.data = data

    def get_response_dict(self) -> dict:
        return {
            'success': self.success,
            'status': self.status,
            'error': self.error,
            'data': self.data
        }
