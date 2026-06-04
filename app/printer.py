from datetime import datetime
from .config import PRINTER_VENDOR_ID, PRINTER_PRODUCT_ID, PRINTER_FALLBACK, RESTAURANT_NAME

try:
    from escpos.printer import Usb, File
    HAS_ESCPOS = True
except ImportError:
    HAS_ESCPOS = False


class PrinterController:
    def __init__(self):
        self.printer = None
        self.status_ok = False
        self._init_printer()

    def _init_printer(self):
        if not HAS_ESCPOS:
            self.status_ok = False
            return

        try:
            self.printer = Usb(PRINTER_VENDOR_ID, PRINTER_PRODUCT_ID)
            self.status_ok = True
        except Exception:
            try:
                self.printer = File(PRINTER_FALLBACK)
                self.status_ok = True
            except Exception:
                self.printer = None
                self.status_ok = False

    def check_printer(self) -> dict:
        return {
            "ok": self.status_ok,
            "device": "USB" if isinstance(self.printer, Usb) else "FILE" if self.printer else None,
        }

    def print_receipt(self, order_data) -> dict:
        if not self.printer or not self.status_ok:
            return {"ok": False, "error": "Yazıcı bağlı değil"}

        try:
            p = self.printer

            p.set_align("center")
            p.set("b", True)
            p.text(RESTAURANT_NAME + "\n")
            p.set("b", False)
            p.text(datetime.now().strftime("%d.%m.%Y %H:%M\n\n"))
            p.set_align("left")

            p.text("-" * 40 + "\n")
            p.text(f"{'Ürün':<20} {'Adet':>5} {'Fiyat':>8}\n")
            p.text("-" * 40 + "\n")

            total = 0
            for item in order_data.get("items", []):
                name = item["product_name"][:20]
                qty = item["quantity"]
                price = item["unit_price"]
                line_total = qty * price
                total += line_total

                p.text(f"{name:<20} {qty:>5} {line_total:>8.2f}\n")

            p.text("-" * 40 + "\n")
            p.set_align("right")
            p.set("b", True)
            p.text(f"TOPLAM: {total:.2f} TL\n")
            p.set("b", False)
            p.set_align("center")

            if order_data.get("customer"):
                p.text(f"\nTeşekkür ederim: {order_data['customer']['name']}\n")

            p.text("\n\n")
            p.cut()

            return {"ok": True}
        except Exception as e:
            return {"ok": False, "error": str(e)}
