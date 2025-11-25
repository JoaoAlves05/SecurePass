import sys
import pathlib
import importlib.util
import pytest

# Add project root to sys.path so "import app" works during tests
ROOT = pathlib.Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# If FastAPI (and other runtime deps) are not installed, skip tests with helpful message
if importlib.util.find_spec("fastapi") is None:
    pytest.skip("FastAPI not installed. Install dev deps: pip install -r requirements.txt", allow_module_level=True)