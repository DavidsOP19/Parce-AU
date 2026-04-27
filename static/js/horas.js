/**
 * Módulo Calculadora de Horas de Trabajo - Parce AU
 * Gestiona turnos casuals, cálculo de ingresos y alertas quincenales.
 */

const HorasApp = (() => {
    // ===== Constantes =====
    const STORAGE_TURNOS = 'parce_horas_turnos';
    const STORAGE_LIMITE = 'parce_horas_limite';
    const LIMITE_DEFAULT = 48;

    // ===== Estado =====
    let turnos = [];
    let limite = LIMITE_DEFAULT;
    let modoVista = 'current'; // 'current' o 'all'
    let chartInstance = null;

    // ===== Utilidades =====

    /**
     * Obtiene la quincena actual basada en la fecha de hoy.
     * Quincena 1: 1-14, Quincena 2: 15-fin del mes
     */
    function getQuincenaActual() {
        const hoy = new Date();
        const dia = hoy.getDate();
        return dia <= 14 ? 1 : 2;
    }

    /**
     * Obtiene el mes y año actual como string 'YYYY-MM'.
     */
    function getMesActual() {
        const hoy = new Date();
        const year = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        return `${year}-${mes}`;
    }

    /**
     * Determina a qué quincena pertenece una fecha.
     * Retorna { quincena: 1|2, mesAnio: 'YYYY-MM' }
     */
    function getQuincena(fecha) {
        const d = new Date(fecha + 'T00:00:00');
        const dia = d.getDate();
        const year = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const mesAnio = `${year}-${mes}`;
        const quincena = dia <= 14 ? 1 : 2;
        return { quincena, mesAnio };
    }

    /**
     * Calcula horas reales de un turno.
     * Si hora_salida < hora_inicio, se suma 24 horas (turno que cruza medianoche).
     * Resta los minutos de break.
     */
    function calcularHoras(inicio, salida, breakMinutos) {
        const [hiH, hiM] = inicio.split(':').map(Number);
        const [hsH, hsM] = salida.split(':').map(Number);

        let minutosInicio = hiH * 60 + hiM;
        let minutosSalida = hsH * 60 + hsM;

        if (minutosSalida < minutosInicio) {
            minutosSalida += 24 * 60; // Suma 24 horas
        }

        let minutosTrabajados = minutosSalida - minutosInicio - breakMinutos;
        minutosTrabajados = Math.max(0, minutosTrabajados);

        return minutosTrabajados / 60;
    }

    /**
     * Filtra turnos según el modo de vista.
     */
    function filtrarTurnos() {
        if (modoVista === 'all') {
            return turnos;
        }
        // Modo 'current': solo quincena actual
        const actual = getQuincenaActual();
        const mesActual = getMesActual();
        return turnos.filter(turno => {
            const q = getQuincena(turno.fecha);
            return q.quincena === actual && q.mesAnio === mesActual;
        });
    }

    /**
     * Calcula totales para los turnos filtrados.
     */
    function calcularTotales() {
        const turnosFiltrados = filtrarTurnos();
        const horas = turnosFiltrados.reduce((sum, t) => sum + t.horas, 0);
        const ingreso = turnosFiltrados.reduce((sum, t) => sum + t.ingreso, 0);
        const restantes = limite - horas;
        const cantidad = turnosFiltrados.length;
        return { horas, ingreso, restantes, cantidad };
    }

    /**
     * Determina el nivel de alerta según el porcentaje de horas usadas.
     */
    function getNivelAlerta() {
        const { horas } = calcularTotales();
        const porcentaje = (horas / limite) * 100;
        if (porcentaje < 75) return 'ok';
        if (porcentaje < 100) return 'warn';
        return 'danger';
    }

    /**
     * Obtiene el texto descriptivo y emoji para la alerta.
     */
    function getTextoAlerta() {
        const nivel = getNivelAlerta();
        const { horas } = calcularTotales();
        const porcentaje = ((horas / limite) * 100).toFixed(1);

        if (nivel === 'ok') {
            return { emoji: '✅', texto: `Excelente: solo ${porcentaje}% del límite alcanzado.` };
        }
        if (nivel === 'warn') {
            return { emoji: '⚠️', texto: `Cuidado: ${porcentaje}% del límite alcanzado. Acercándose al máximo.` };
        }
        return { emoji: '🔴', texto: `Límite alcanzado: ${porcentaje}% ocupado. Verifica tu asignación de horas.` };
    }

    // ===== Persistencia =====

    function cargarDatos() {
        turnos = ParceAU.load(STORAGE_TURNOS, []);
        limite = ParceAU.load(STORAGE_LIMITE, LIMITE_DEFAULT);
    }

    function guardarDatos() {
        ParceAU.save(STORAGE_TURNOS, turnos);
        ParceAU.save(STORAGE_LIMITE, limite);
    }

    // ===== Renderizado =====

    function renderizarResumen() {
        const { horas, ingreso, restantes, cantidad } = calcularTotales();
        document.getElementById('summary-hours').textContent = ParceAU.formatHours(horas);
        document.getElementById('summary-income').textContent = ParceAU.formatAUD(ingreso);
        document.getElementById('summary-remaining').textContent = ParceAU.formatHours(restantes);
        document.getElementById('summary-shifts').textContent = cantidad;
    }

    function renderizarAlerta() {
        const nivel = getNivelAlerta();
        const { emoji, texto } = getTextoAlerta();
        const container = document.getElementById('alert-container');
        const icon = nivel === 'ok' ? 'bi-check-circle-fill' : nivel === 'warn' ? 'bi-exclamation-triangle-fill' : 'bi-exclamation-octagon-fill';
        container.innerHTML = `<div class="alert-bar ${nivel}"><i class="bi ${icon}"></i><div>${texto}</div></div>`;
    }

    /**
     * Renderiza el gráfico de barras: horas trabajadas por día de la semana.
     */
    function renderizarChart() {
        const canvas = document.getElementById('chart-horas');
        if (!canvas || typeof Chart === 'undefined') return;

        const turnosFiltrados = filtrarTurnos();
        const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const horasPorDia = [0, 0, 0, 0, 0, 0, 0];
        turnosFiltrados.forEach(t => {
            const d = new Date(t.fecha + 'T00:00:00');
            horasPorDia[d.getDay()] += t.horas;
        });

        const labelEl = document.getElementById('chart-period-label');
        if (labelEl) labelEl.textContent = modoVista === 'all' ? 'Todas las quincenas' : 'Quincena actual';

        const data = {
            labels: dias,
            datasets: [{
                label: 'Horas',
                data: horasPorDia,
                backgroundColor: horasPorDia.map(v => v > 0 ? 'rgba(59, 130, 246, 0.85)' : 'rgba(226, 232, 240, 0.6)'),
                borderColor: 'rgba(30, 64, 175, 1)',
                borderWidth: 0,
                borderRadius: 8,
                borderSkipped: false,
            }]
        };
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.92)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: { family: 'Inter', weight: '600' },
                    bodyFont: { family: 'Inter' },
                    callbacks: { label: (ctx) => `${ctx.parsed.y.toFixed(2)} horas` }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { font: { family: 'Inter' }, color: '#64748B' },
                    grid: { color: 'rgba(226, 232, 240, 0.6)' }
                },
                x: {
                    ticks: { font: { family: 'Inter', weight: '600' }, color: '#334155' },
                    grid: { display: false }
                }
            }
        };

        if (chartInstance) {
            chartInstance.data = data;
            chartInstance.update('none');
        } else {
            chartInstance = new Chart(canvas, { type: 'bar', data, options });
        }
    }

    function renderizarTabla() {
        const tbody = document.getElementById('tbody-turnos');
        const emptyMsg = document.getElementById('empty-message');
        const turnosFiltrados = filtrarTurnos();

        // Ordena por fecha descendente
        turnosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        if (turnosFiltrados.length === 0) {
            tbody.innerHTML = '';
            emptyMsg.style.display = 'block';
            return;
        }

        emptyMsg.style.display = 'none';
        tbody.innerHTML = turnosFiltrados.map(turno => `
            <tr>
                <td>${new Date(turno.fecha + 'T00:00:00').toLocaleDateString('es-ES')}</td>
                <td><strong>${turno.lugar}</strong></td>
                <td>${turno.inicio}</td>
                <td>${turno.salida}</td>
                <td>${turno.break} min</td>
                <td><span class="badge bg-info-subtle text-info-emphasis">${ParceAU.formatHours(turno.horas)}</span></td>
                <td>${ParceAU.formatAUD(turno.pago)}</td>
                <td><strong class="text-success">${ParceAU.formatAUD(turno.ingreso)}</strong></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="HorasApp.eliminarTurno('${turno.id}')" title="Eliminar turno">
                        <i class="bi bi-trash3"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    function actualizarUI() {
        renderizarResumen();
        renderizarAlerta();
        renderizarTabla();
        renderizarChart();
    }

    // ===== Eventos =====

    function setupEventos() {
        // Selector de quincena
        document.getElementById('quincena-selector').addEventListener('change', (e) => {
            modoVista = e.target.value;
            actualizarUI();
        });

        // Guardar límite
        document.getElementById('btn-guardar-limite').addEventListener('click', () => {
            const nuevoLimite = parseFloat(document.getElementById('limite-horas').value);
            if (!isNaN(nuevoLimite) && nuevoLimite >= 0) {
                limite = nuevoLimite;
                guardarDatos();
                actualizarUI();
                ParceAU.toast('Límite guardado correctamente.', 'success');
            } else {
                ParceAU.toast('Por favor ingresa un número válido.', 'warning');
            }
        });

        // Agregar turno
        document.getElementById('form-turno').addEventListener('submit', (e) => {
            e.preventDefault();
            agregarTurno();
        });

        // Limpiar todo
        document.getElementById('btn-limpiar-todo').addEventListener('click', () => {
            if (confirm('⚠️ ¿Eliminar TODOS los turnos? Esta acción no se puede deshacer.')) {
                if (confirm('🔴 Confirmar nuevamente. ¿REALMENTE deseas eliminar TODOS los datos?')) {
                    turnos = [];
                    guardarDatos();
                    document.getElementById('form-turno').reset();
                    actualizarUI();
                    ParceAU.toast('Todos los turnos han sido eliminados.', 'success');
                }
            }
        });
    }

    function agregarTurno() {
        const fecha = document.getElementById('input-fecha').value;
        const lugar = document.getElementById('input-lugar').value.trim();
        const inicio = document.getElementById('input-inicio').value;
        const salida = document.getElementById('input-salida').value;
        const breakMinutos = parseInt(document.getElementById('input-break').value) || 0;
        const pago = parseFloat(document.getElementById('input-pago').value);

        // Validaciones
        if (!fecha || !lugar || !inicio || !salida || isNaN(pago) || pago < 0) {
            ParceAU.toast('Por favor completa todos los campos requeridos correctamente.', 'danger');
            return;
        }

        const horas = calcularHoras(inicio, salida, breakMinutos);
        if (horas <= 0) {
            ParceAU.toast('Las horas calculadas deben ser mayores a cero. Verifica inicio, salida y break.', 'danger');
            return;
        }

        const ingreso = horas * pago;
        const turno = {
            id: ParceAU.uid(),
            fecha,
            lugar,
            inicio,
            salida,
            break: breakMinutos,
            pago,
            horas: parseFloat(horas.toFixed(2)),
            ingreso: parseFloat(ingreso.toFixed(2))
        };

        turnos.push(turno);
        guardarDatos();
        document.getElementById('form-turno').reset();
        actualizarUI();
        ParceAU.toast(`Turno agregado: ${ParceAU.formatHours(horas)} = ${ParceAU.formatAUD(ingreso)}`, 'success');
    }

    // ===== API Pública =====

    return {
        init() {
            cargarDatos();
            // Establece el valor actual del límite en el input
            document.getElementById('limite-horas').value = limite;
            setupEventos();
            actualizarUI();
        },

        eliminarTurno(id) {
            if (confirm('🗑️ ¿Eliminar este turno?')) {
                turnos = turnos.filter(t => t.id !== id);
                guardarDatos();
                actualizarUI();
                ParceAU.toast('Turno eliminado.', 'info');
            }
        }
    };
})();

// Inicializa al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    HorasApp.init();
});
