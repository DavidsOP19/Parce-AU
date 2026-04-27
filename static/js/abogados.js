/**
 * Filtrado y búsqueda en el directorio de abogados migratorios.
 */
(function () {
    const search = document.getElementById('searchAbogados');
    const filterCiudad = document.getElementById('filterCiudad');
    const filterIdioma = document.getElementById('filterIdioma');
    const visibleCount = document.getElementById('visibleCount');
    const noResults = document.getElementById('noResultsAbogados');
    const accordion = document.getElementById('abogadosAccordion');
    if (!accordion) return;

    const cards = Array.from(document.querySelectorAll('.abogado-card-wrap'));
    const sections = Array.from(document.querySelectorAll('.ciudad-section'));

    function aplicarFiltros() {
        const q = (search.value || '').trim().toLowerCase();
        const ciudad = filterCiudad.value;
        const idioma = filterIdioma.value;
        let visibles = 0;

        cards.forEach(card => {
            const nombre = card.dataset.nombre || '';
            const firma = card.dataset.firma || '';
            const direccion = card.dataset.direccion || '';
            const cardCiudad = card.dataset.ciudad || '';
            const idiomas = (card.dataset.idiomas || '').split(',').filter(Boolean);

            let matchTexto = !q || nombre.includes(q) || firma.includes(q) || direccion.includes(q);
            let matchCiudad = !ciudad || cardCiudad === ciudad;
            let matchIdioma = true;
            if (idioma === 'es') matchIdioma = idiomas.includes('es');
            else if (idioma === 'en') matchIdioma = idiomas.length === 1 && idiomas[0] === 'en';

            const ok = matchTexto && matchCiudad && matchIdioma;
            card.classList.toggle('d-none', !ok);
            if (ok) visibles++;
        });

        // Esconder/mostrar secciones de ciudad sin tarjetas visibles + actualizar contador por ciudad
        sections.forEach(section => {
            const sectionCards = section.querySelectorAll('.abogado-card-wrap:not(.d-none)');
            const count = sectionCards.length;
            section.classList.toggle('d-none', count === 0);
            const badge = section.querySelector('[data-city-count]');
            if (badge) badge.textContent = count;
        });

        visibleCount.textContent = `${visibles} visible${visibles === 1 ? '' : 's'}`;
        noResults.classList.toggle('d-none', visibles > 0);
    }

    [search, filterCiudad, filterIdioma].forEach(el => {
        if (!el) return;
        el.addEventListener('input', aplicarFiltros);
        el.addEventListener('change', aplicarFiltros);
    });
})();
