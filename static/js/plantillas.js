/**
 * Lógica para el módulo de Plantillas en Inglés.
 * - Búsqueda en vivo (live filter)
 * - Copiar al portapapeles con feedback
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const noResults = document.getElementById('noResults');
    const accordion = document.getElementById('plantillasAccordion');

    // Listener para búsqueda en vivo
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        filterPlantillas(query);
    });

    // Listeners para botones "Copiar"
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const templateId = btn.dataset.templateId;
            const textarea = document.querySelector(`[data-template-text][data-template-id="${templateId}"]`);
            
            if (!textarea) return;

            const text = textarea.value;
            const originalText = btn.textContent;
            
            const success = await ParceAU.copyToClipboard(text);
            
            if (success) {
                btn.textContent = '✅ Copiado';
                btn.classList.add('disabled');
                ParceAU.toast('Plantilla copiada al portapapeles.', 'success', 2000);
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.remove('disabled');
                }, 2000);
            } else {
                btn.textContent = '❌ Error al copiar';
                btn.classList.add('disabled');
                ParceAU.toast('No se pudo copiar al portapapeles. Copia manualmente.', 'danger');
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.remove('disabled');
                }, 2000);
            }
        });
    });

    /**
     * Filtra las plantillas según el término de búsqueda.
     * Ocultación a nivel de categoría, plantilla y muestra mensaje si no hay resultados.
     */
    function filterPlantillas(query) {
        const categoryItems = accordion.querySelectorAll('.accordion-item');
        let hasVisiblePlantillas = false;

        categoryItems.forEach(categoryItem => {
            const plantillas = categoryItem.querySelectorAll('[data-plantilla-id]');
            let visibleCount = 0;

            plantillas.forEach(plantilla => {
                const searchable = plantilla.dataset.searchable || '';
                const isMatch = query === '' || searchable.includes(query);
                
                if (isMatch) {
                    plantilla.classList.remove('d-none');
                    visibleCount++;
                    hasVisiblePlantillas = true;
                } else {
                    plantilla.classList.add('d-none');
                }
            });

            // Ocultar la categoría si no hay plantillas visibles
            if (visibleCount === 0) {
                categoryItem.classList.add('d-none');
            } else {
                categoryItem.classList.remove('d-none');
            }
        });

        // Mostrar mensaje de "no resultados" solo si hay búsqueda activa
        if (query !== '' && !hasVisiblePlantillas) {
            noResults.classList.remove('d-none');
        } else {
            noResults.classList.add('d-none');
        }
    }
});
