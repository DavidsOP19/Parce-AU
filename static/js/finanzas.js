/**
 * Lógica del módulo de Control Financiero.
 * Gestiona ingresos, gastos, cálculos automáticos y persistencia en localStorage.
 */

const Finanzas = {
    STORAGE_KEY: 'parce_finanzas_movimientos',

    movimientos: [],
    chartInstance: null,

    /** Inicializa el módulo al cargar la página. */
    init() {
        this.cargarMovimientos();
        this.setearFechasDefault();
        this.vincularFormularios();
        this.vincularBotones();
        this.renderizar();
    },

    /** Lee los movimientos desde localStorage. */
    cargarMovimientos() {
        this.movimientos = ParceAU.load(this.STORAGE_KEY, []);
    },

    /** Guarda los movimientos en localStorage. */
    guardarMovimientos() {
        ParceAU.save(this.STORAGE_KEY, this.movimientos);
    },

    /** Setea las fechas default de los formularios al día de hoy. */
    setearFechasDefault() {
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('ingresoFecha').value = hoy;
        document.getElementById('gastoFecha').value = hoy;
    },

    /** Vincula eventos a los formularios. */
    vincularFormularios() {
        document.getElementById('formIngreso').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarIngreso();
        });

        document.getElementById('formGasto').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarGasto();
        });
    },

    /** Vincula eventos a los botones. */
    vincularBotones() {
        document.getElementById('btnClearAll').addEventListener('click', () => {
            if (this.movimientos.length === 0) {
                ParceAU.toast('No hay movimientos para limpiar.', 'info');
                return;
            }
            if (confirm('¿Estás seguro de que deseas limpiar todos los movimientos?')) {
                if (confirm('⚠️ Esta acción es irreversible. ¿Deseas continuar?')) {
                    this.movimientos = [];
                    this.guardarMovimientos();
                    this.renderizar();
                    ParceAU.toast('Todos los movimientos eliminados.', 'success');
                }
            }
        });
    },

    /** Agrega un ingreso desde el formulario. */
    agregarIngreso() {
        const desc = document.getElementById('ingresoDesc').value.trim();
        const cat = document.getElementById('ingresoCategoria').value.trim();
        const valor = parseFloat(document.getElementById('ingresoValor').value) || 0;
        const fecha = document.getElementById('ingresoFecha').value;

        if (!desc || !cat || valor <= 0 || !fecha) {
            ParceAU.toast('Por favor completa todos los campos requeridos del ingreso.', 'danger');
            return;
        }

        this.movimientos.push({
            id: ParceAU.uid(),
            tipo: 'ingreso',
            descripcion: desc,
            categoria: cat,
            valor: valor,
            fecha: fecha
        });

        this.guardarMovimientos();
        document.getElementById('formIngreso').reset();
        this.setearFechasDefault();
        this.renderizar();
        ParceAU.toast(`Ingreso agregado: ${ParceAU.formatAUD(valor)}`, 'success');
    },

    /** Agrega un gasto desde el formulario. */
    agregarGasto() {
        const desc = document.getElementById('gastoDesc').value.trim();
        const cat = document.getElementById('gastoCategoria').value.trim();
        const valor = parseFloat(document.getElementById('gastoValor').value) || 0;
        const fecha = document.getElementById('gastoFecha').value;

        if (!cat || valor <= 0 || !fecha) {
            ParceAU.toast('Por favor completa todos los campos requeridos del gasto.', 'danger');
            return;
        }

        this.movimientos.push({
            id: ParceAU.uid(),
            tipo: 'gasto',
            descripcion: desc || '(sin descripción)',
            categoria: cat,
            valor: valor,
            fecha: fecha
        });

        this.guardarMovimientos();
        document.getElementById('formGasto').reset();
        this.setearFechasDefault();
        this.renderizar();
        ParceAU.toast(`Gasto agregado: ${ParceAU.formatAUD(valor)}`, 'success');
    },

    /** Elimina un movimiento por id. */
    eliminarMovimiento(id) {
        if (confirm('¿Deseas eliminar este movimiento?')) {
            this.movimientos = this.movimientos.filter(m => m.id !== id);
            this.guardarMovimientos();
            this.renderizar();
            ParceAU.toast('Movimiento eliminado.', 'info');
        }
    },

    /** Calcula el total de ingresos. */
    calcularTotalIngresos() {
        return this.movimientos
            .filter(m => m.tipo === 'ingreso')
            .reduce((sum, m) => sum + m.valor, 0);
    },

    /** Calcula el total de gastos. */
    calcularTotalGastos() {
        return this.movimientos
            .filter(m => m.tipo === 'gasto')
            .reduce((sum, m) => sum + m.valor, 0);
    },

    /** Calcula el saldo (ingresos - gastos). */
    calcularSaldo() {
        return this.calcularTotalIngresos() - this.calcularTotalGastos();
    },

    /** Calcula el porcentaje gastado. */
    calcularPorcentajeGastado() {
        const ingresos = this.calcularTotalIngresos();
        if (ingresos === 0) return 0;
        return (this.calcularTotalGastos() / ingresos) * 100;
    },

    /** Calcula los días restantes del mes. */
    calcularDiasRestantes() {
        const hoy = new Date();
        const daysInMonth = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
        return Math.max(1, daysInMonth - hoy.getDate() + 1);
    },

    /** Calcula el presupuesto diario recomendado. */
    calcularPresupuestoDiario() {
        const saldo = this.calcularSaldo();
        if (saldo <= 0) return 0;
        const dias = this.calcularDiasRestantes();
        return saldo / dias;
    },

    /** Renderiza el resumen visual y la tabla. */
    renderizar() {
        this.actualizarResumen();
        this.actualizarProgressBar();
        this.actualizarTabla();
        this.actualizarChart();
    },

    /** Renderiza el donut chart de gastos por categoría. */
    actualizarChart() {
        const canvas = document.getElementById('chart-gastos');
        const empty = document.getElementById('chart-empty');
        if (!canvas || typeof Chart === 'undefined') return;

        const gastos = this.movimientos.filter(m => m.tipo === 'gasto');
        const porCategoria = {};
        gastos.forEach(g => {
            porCategoria[g.categoria] = (porCategoria[g.categoria] || 0) + g.valor;
        });
        const labels = Object.keys(porCategoria);
        const values = Object.values(porCategoria);

        if (labels.length === 0) {
            canvas.classList.add('d-none');
            if (empty) empty.classList.remove('d-none');
            if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
            return;
        }
        canvas.classList.remove('d-none');
        if (empty) empty.classList.add('d-none');

        const palette = [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
            '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16', '#94A3B8'
        ];
        const data = {
            labels,
            datasets: [{
                data: values,
                backgroundColor: labels.map((_, i) => palette[i % palette.length]),
                borderColor: '#FFFFFF',
                borderWidth: 3,
                hoverOffset: 8
            }]
        };
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: { font: { family: 'Inter', size: 12 }, color: '#334155', boxWidth: 12, padding: 12 }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.92)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (ctx) => {
                            const total = values.reduce((a, b) => a + b, 0);
                            const pct = total ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                            return `${ctx.label}: ${ParceAU.formatAUD(ctx.parsed)} (${pct}%)`;
                        }
                    }
                }
            }
        };

        if (this.chartInstance) {
            this.chartInstance.data = data;
            this.chartInstance.update('none');
        } else {
            this.chartInstance = new Chart(canvas, { type: 'doughnut', data, options });
        }
    },

    /** Actualiza los 4 summary cards y calcula valores. */
    actualizarResumen() {
        const totalIngresos = this.calcularTotalIngresos();
        const totalGastos = this.calcularTotalGastos();
        const saldo = this.calcularSaldo();
        const presupuestoDiario = this.calcularPresupuestoDiario();

        document.getElementById('totalIngresos').textContent = ParceAU.formatAUD(totalIngresos);
        document.getElementById('totalGastos').textContent = ParceAU.formatAUD(totalGastos);
        document.getElementById('saldoDisponible').textContent = ParceAU.formatAUD(saldo);
        document.getElementById('presupuestoDiario').textContent = ParceAU.formatAUD(presupuestoDiario);

        // Cambiar color del saldo si es negativo
        const cardSaldo = document.getElementById('cardSaldo');
        if (saldo < 0) {
            cardSaldo.className = 'card summary-card tinted-danger h-100';
        } else {
            cardSaldo.className = 'card summary-card tinted-info h-100';
        }
    },

    /** Actualiza la progress bar de porcentaje gastado. */
    actualizarProgressBar() {
        const porcentaje = this.calcularPorcentajeGastado();
        const bar = document.getElementById('progressBar');
        const label = document.getElementById('porcentajeLabel');

        let bgColor = 'bg-success';
        if (porcentaje >= 50 && porcentaje < 80) {
            bgColor = 'bg-warning';
        } else if (porcentaje >= 80) {
            bgColor = 'bg-danger';
        }

        bar.style.width = Math.min(100, porcentaje) + '%';
        bar.className = 'progress-bar ' + bgColor;
        bar.setAttribute('aria-valuenow', Math.round(porcentaje));
        label.textContent = Math.round(porcentaje) + '%';
        label.className = 'badge ' + bgColor;
        label.style.fontSize = '1rem';
    },

    /** Actualiza la tabla de movimientos (ordenada por fecha descendente). */
    actualizarTabla() {
        const tbody = document.getElementById('tbodyMovimientos');
        
        if (this.movimientos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="bi bi-inbox empty-state-icon"></i><div class="empty-state-title">No hay movimientos</div><small>Agrega un ingreso o gasto para empezar.</small></div></td></tr>`;
            return;
        }

        // Ordenar por fecha descendente
        const ordenados = [...this.movimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        tbody.innerHTML = ordenados.map(m => {
            const badgeClass = m.tipo === 'ingreso' ? 'bg-success' : 'bg-danger';
            const tipoTexto = m.tipo === 'ingreso' ? 'Ingreso' : 'Gasto';
            const fecha = new Date(m.fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            return `
                <tr>
                    <td>${fecha}</td>
                    <td><span class="badge ${badgeClass}">${tipoTexto}</span></td>
                    <td>${m.categoria}</td>
                    <td>${m.descripcion}</td>
                    <td><strong class="${m.tipo === 'ingreso' ? 'text-success' : 'text-danger'}">${m.tipo === 'gasto' ? '-' : '+'}${ParceAU.formatAUD(m.valor)}</strong></td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="Finanzas.eliminarMovimiento('${m.id}')" title="Eliminar">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
};

// Inicializa al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    Finanzas.init();
});
