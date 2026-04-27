"""
Parce AU - Aplicación web monolítica con Flask.

Tu guía rápida para sobrevivir como estudiante colombiano en Australia.
"""
import json
from pathlib import Path
from flask import Flask, render_template

app = Flask(__name__)

DATA_DIR = Path(__file__).parent / "data"


def load_json(filename: str):
    """Lee un archivo JSON desde la carpeta data/."""
    path = DATA_DIR / filename
    with path.open(encoding="utf-8") as f:
        return json.load(f)


@app.route("/")
def index():
    return render_template("index.html", active="home")


@app.route("/horas")
def horas():
    return render_template("horas.html", active="horas")


@app.route("/finanzas")
def finanzas():
    return render_template("finanzas.html", active="finanzas")


@app.route("/checklist")
def checklist():
    data = load_json("checklists.json")
    return render_template("checklist.html", active="checklist", checklists=data)


@app.route("/plantillas")
def plantillas():
    data = load_json("plantillas.json")
    return render_template("plantillas.html", active="plantillas", plantillas=data)


@app.route("/numeros")
def numeros():
    data = load_json("numeros.json")
    return render_template("numeros.html", active="numeros", numeros=data)


@app.route("/transporte")
def transporte():
    data = load_json("transporte.json")
    return render_template("transporte.html", active="transporte", ciudades=data)


@app.route("/abogados")
def abogados():
    data = load_json("abogados.json")
    lista = data.get("abogados", []) if isinstance(data, dict) else data
    # Agrupar por ciudad para acordeón
    ciudades_orden = ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra"]
    agrupados = {c: [] for c in ciudades_orden}
    otros = []
    for ab in lista:
        c = ab.get("ciudad")
        if c in agrupados:
            agrupados[c].append(ab)
        else:
            otros.append(ab)
    if otros:
        agrupados["Otras ciudades"] = otros
    # Filtrar ciudades sin abogados
    agrupados = {k: v for k, v in agrupados.items() if v}
    return render_template(
        "abogados.html",
        active="abogados",
        agrupados=agrupados,
        total=len(lista),
        ciudades_disponibles=list(agrupados.keys()),
    )


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
