import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent
DATABASE_PATH = BASE_DIR / "tel_pos.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# Server
HOST = "0.0.0.0"
PORT = 8000

# Printer
PRINTER_VENDOR_ID = 0x0483
PRINTER_PRODUCT_ID = 0x0110
PRINTER_FALLBACK = str(Path("/tmp/print_output.txt"))  # Unix; Windows → NUL

# Restaurant info
RESTAURANT_NAME = "Tel-POS Restoran"
