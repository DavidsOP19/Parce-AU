# 🇨🇴🇦🇺 Parce AU

> **Tu guía rápida para sobrevivir como estudiante colombiano en Australia.**

Aplicación web monolítica (Flask + Jinja2 + Bootstrap 5 + JS Vanilla) con herramientas prácticas: calculadora de horas, control financiero, checklist de llegada, plantillas en inglés, números importantes, guía de transporte público y directorio de abogados migratorios por ciudad.

- ✅ Sin login ni registro.
- ✅ Sin base de datos.
- ✅ Sin APIs externas.
- ✅ Funciona offline (Bootstrap incluido localmente).
- ✅ Datos del usuario en `localStorage` (privados, en su propio navegador).

---

## 🚀 Cómo ejecutar

### Requisitos

- Python 3.9 o superior

### Pasos

```bash
# 1. (Opcional pero recomendado) crear entorno virtual
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Ejecutar la aplicación
python app.py

# 4. Abrir en el navegador
# http://localhost:5000
```

---

## 📦 Estructura del proyecto

```
ParceAU/
├── app.py                  # Flask app y rutas
├── requirements.txt
├── REQUERIMIENTO.md        # Documento de requerimientos
├── data/                   # Información estática (JSON)
│   ├── checklists.json
│   ├── plantillas.json
│   ├── numeros.json
│   ├── transporte.json
│   └── abogados.json       # Directorio de abogados migratorios
├── static/
│   ├── vendor/             # Bootstrap 5 local (offline)
│   ├── css/style.css
│   └── js/                 # Lógica por módulo + utilidades
└── templates/              # Vistas Jinja2
```

---

## 🧰 Módulos

| Módulo                      | Descripción                                                                 |
| --------------------------- | --------------------------------------------------------------------------- |
| ⏱️ Calculadora de horas     | Registra turnos y vigila el límite por quincena (configurable).             |
| 💰 Control financiero       | Ingresos, gastos, saldo y presupuesto diario.                              |
| ✅ Checklist                 | Tareas antes y después de llegar a Australia.                              |
| 💬 Plantillas en inglés     | Mensajes listos para copiar al portapapeles.                               |
| 📞 Números importantes      | Emergencias, Fair Work, Lifeline, etc.                                     |
| 🚇 Transporte público       | Tarjetas y consejos por ciudad.                                            |
| ⚖️ Abogados migratorios     | Directorio por ciudad con idioma (ES/EN), ubicación y datos de contacto.   |

---

## 💾 Datos del usuario

Toda la información que ingreses (turnos, ingresos, gastos, checklists marcados, límite de horas) se guarda **únicamente en el `localStorage` de tu navegador**, en tu propio dispositivo. No se envía a ningún servidor.

Si vacías el caché del navegador o usas otro dispositivo, los datos no se transfieren.

---

## ⚠️ Aviso

Esta aplicación es una **guía informativa**. No reemplaza asesoría migratoria, legal, financiera ni médica.
