document.addEventListener('DOMContentLoaded', function() {
    const ciudadSelect = document.getElementById('ciudad-select');
    const ciudadCards = document.querySelectorAll('.ciudad-card');

    // Listener para cambio de selección
    ciudadSelect.addEventListener('change', function() {
        const selectedCiudad = this.value;
        
        // Ocultar todas las cards
        ciudadCards.forEach(card => {
            card.style.display = 'none';
        });
        
        // Mostrar la card seleccionada
        const activeCard = document.querySelector(`.ciudad-card[data-ciudad="${selectedCiudad}"]`);
        if (activeCard) {
            activeCard.style.display = 'block';
            // Scroll suave hacia la card
            activeCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
