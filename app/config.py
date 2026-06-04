import os
import sys
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent

# PyInstaller'da DB'yi APPDATA'ya koy (update'te silinmez)
if getattr(sys, 'frozen', False):
    db_dir = Path(os.environ.get('APPDATA', '')) / 'TelPOS'
    db_dir.mkdir(parents=True, exist_ok=True)
    DATABASE_PATH = db_dir / 'tel_pos.db'
else:
    DATABASE_PATH = BASE_DIR / "tel_pos.db"

DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# Server
HOST = "0.0.0.0"
PORT = 8000

# Printer
PRINTER_VENDOR_ID = 0x0483
PRINTER_PRODUCT_ID = 0x0110
# Windows'ta NUL, Unix'te /tmp
if sys.platform == 'win32':
    PRINTER_FALLBACK = 'NUL'
else:
    PRINTER_FALLBACK = str(Path("/tmp/print_output.txt"))

# Restaurant info
RESTAURANT_NAME = "Tel-POS Restoran"
