import json

# Läs in highscore
with open("highscore.json", "r", encoding="utf-8") as f:
    highscores = json.load(f)

# Uppdatera vinnare
vinnare = "Otto"
highscores[vinnare] = highscores.get(vinnare, 0) + 1

# Spara tillbaka
with open("highscore.json", "w", encoding="utf-8") as f:
    json.dump(highscores, f, ensure_ascii=False, indent=2)
