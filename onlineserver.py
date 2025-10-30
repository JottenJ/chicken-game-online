import http.server
import socketserver
import json
import os

PORT = 8000
HIGHSCORE_FILE = "highscore.json"

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/highscore":
            # Läs highscore och skicka tillbaka
            if os.path.exists(HIGHSCORE_FILE):
                with open(HIGHSCORE_FILE, "r", encoding="utf-8") as f:
                    highscores = json.load(f)
            else:
                highscores = {}

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(highscores, ensure_ascii=False).encode("utf-8"))
        else:
            # Servera statiska filer (index.html, styles.css, app.js)
            return super().do_GET()

    def do_POST(self):
        if self.path == "/update_highscore":
            length = int(self.headers.get("Content-Length", "0"))
            data = self.rfile.read(length)
            try:
                payload = json.loads(data.decode("utf-8"))
            except Exception:
                payload = {}

            winner = payload.get("winner", "").strip()
            if not winner:
                self.send_error(400, "Missing winner")
                return

            # Läs in befintlig highscore
            if os.path.exists(HIGHSCORE_FILE):
                with open(HIGHSCORE_FILE, "r", encoding="utf-8") as f:
                    highscores = json.load(f)
            else:
                highscores = {}

            # Uppdatera vinnaren
            highscores[winner] = highscores.get(winner, 0) + 1

            # Spara tillbaka
            with open(HIGHSCORE_FILE, "w", encoding="utf-8") as f:
                json.dump(highscores, f, ensure_ascii=False, indent=2)

            # Svar
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(highscores, ensure_ascii=False).encode("utf-8"))
        else:
            self.send_error(404, "Not Found")

if __name__ == "__main__":
    Handler = MyHandler
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        print(f"Servern körs på http://192.168.21.31:{PORT}")
        httpd.serve_forever()
