/**
 * Módulo Checklist para Parce AU.
 * Gestiona el estado del checklist en localStorage.
 */

const ChecklistModule = {
    STORAGE_KEY: "parce_checklist",

    init() {
        this.loadState();
        this.renderCheckboxes();
        this.attachListeners();
    },

    loadState() {
        this.state = ParceAU.load(this.STORAGE_KEY, {});
    },

    saveState() {
        ParceAU.save(this.STORAGE_KEY, this.state);
    },

    renderCheckboxes() {
        document.querySelectorAll(".checklist-checkbox").forEach(checkbox => {
            const section = checkbox.dataset.section;
            const task = checkbox.dataset.task;
            const isCompleted = this.state[section]?.[task] || false;
            checkbox.checked = isCompleted;
            this.updateTaskLabel(checkbox);
        });
        this.updateAllProgress();
    },

    attachListeners() {
        document.querySelectorAll(".checklist-checkbox").forEach(checkbox => {
            checkbox.addEventListener("change", (e) => {
                const section = e.target.dataset.section;
                const task = e.target.dataset.task;
                const isChecked = e.target.checked;

                if (!this.state[section]) {
                    this.state[section] = {};
                }
                this.state[section][task] = isChecked;
                this.saveState();

                this.updateTaskLabel(e.target);
                this.updateSectionProgress(section);
                this.updateGlobalProgress();
            });
        });

        const resetBtn = document.getElementById("reset-btn");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                if (confirm("¿Estás seguro de que quieres reiniciar el checklist? Se limpiarán todos los datos guardados.")) {
                    this.state = {};
                    this.saveState();
                    this.renderCheckboxes();
                    if (window.ParceAU && ParceAU.toast) {
                        ParceAU.toast("Checklist reiniciado.", "info");
                    }
                }
            });
        }
    },

    updateTaskLabel(checkbox) {
        const label = checkbox.nextElementSibling;
        if (checkbox.checked) {
            label.classList.add("completed");
        } else {
            label.classList.remove("completed");
        }
    },

    updateSectionProgress(sectionId) {
        const checkboxes = document.querySelectorAll(`[data-section="${sectionId}"]`);
        const total = checkboxes.length;
        const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        const countEl = document.querySelector(`[data-section-count="${sectionId}"]`);
        if (countEl) {
            countEl.textContent = `${completed} / ${total}`;
        }

        const barEl = document.querySelector(`[data-section-bar="${sectionId}"]`);
        if (barEl) {
            barEl.style.width = `${percentage}%`;
            barEl.setAttribute("aria-valuenow", percentage);
        }
    },

    updateGlobalProgress() {
        const allCheckboxes = document.querySelectorAll(".checklist-checkbox");
        const totalTasks = allCheckboxes.length;
        const completedTasks = Array.from(allCheckboxes).filter(cb => cb.checked).length;
        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const countEl = document.getElementById("total-count");
        if (countEl) {
            countEl.textContent = `${completedTasks} / ${totalTasks}`;
        }

        const percentageEl = document.getElementById("total-percentage");
        if (percentageEl) {
            percentageEl.textContent = `${percentage}%`;
        }

        const barEl = document.getElementById("total-progress-bar");
        if (barEl) {
            barEl.style.width = `${percentage}%`;
            barEl.setAttribute("aria-valuenow", percentage);
        }
    },

    updateAllProgress() {
        const container = document.getElementById("checklists-container");
        if (container) {
            const sectionIds = new Set();
            document.querySelectorAll("[data-section-count]").forEach(el => {
                sectionIds.add(el.dataset.sectionCount);
            });
            sectionIds.forEach(sectionId => this.updateSectionProgress(sectionId));
        }
        this.updateGlobalProgress();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    ChecklistModule.init();
});
