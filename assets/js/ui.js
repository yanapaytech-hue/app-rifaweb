/**
 * CAPA DE PRESENTACIÓN / INTERFAZ DE USUARIO (ui.js)
 * Renderiza elementos en el DOM, escucha clicks del usuario
 * y coordina la actualización visual con la lógica de negocio.
 */

const ui = {
    /**
     * Inicializa la interfaz al cargar la página
     */
    async init() {
        try {
            const data = await app.cargarDatos();
            this.renderizarEncabezado(data.configuracion);
            this.renderizarPremios(data.premios);
            this.renderizarTablero(data.configuracion.total_boletos, data.boletos);
        } catch (e) {
            alert("Ocurrió un error al cargar la información de la rifa.");
        }
    },

    /**
     * Actualiza el título y la descripción
     */
    renderizarEncabezado(config) {
        document.getElementById('rifa-titulo').textContent = config.titulo;
        document.getElementById('rifa-descripcion').textContent = config.descripcion;
    },

    /**
     * Renderiza las tarjetas de premios
     */
    renderizarPremios(premios) {
        const container = document.getElementById('premios-container');
        container.innerHTML = premios.map(p => `
            <div class="premio-card">
                <div class="premio-icono">${p.icono}</div>
                <div class="premio-info">
                    <h3>${p.puesto}</h3>
                    <p>${p.nombre}</p>
                </div>
            </div>
        `).join('');
    },

    /**
     * Renderiza la grilla de números
     */
    renderizarTablero(total, boletos) {
        const grid = document.getElementById('numeros-grid');
        let html = '';

        for (let i = 1; i <= total; i++) {
            const numStr = String(i);
            const boleto = boletos[numStr] || { estado: 'disponible' };
            const esOcupado = boleto.estado === 'ocupado';
            
            const claseEstado = esOcupado ? 'ocupado' : '';
            const numPadded = String(i).padStart(2, '0');

            html += `<button class="num-btn ${claseEstado}" id="btn-num-${i}" onclick="ui.onNumeroClick(${i})">${numPadded}</button>`;
        }

        grid.innerHTML = html;
    },

    /**
     * Manejador de click en un número
     */
    onNumeroClick(numero) {
        const exito = app.toggleNumero(numero);
        if (!exito) return;

        // Actualizar aspecto visual del botón
        const btn = document.getElementById(`btn-num-${numero}`);
        btn.classList.toggle('seleccionado');

        // Actualizar barra flotante
        this.actualizarBarraCarrito();
    },

    /**
     * Actualiza los totales de la barra flotante
     */
    actualizarBarraCarrito() {
        const resumen = app.obtenerResumen();
        const cartBar = document.getElementById('cart-bar');

        document.getElementById('cart-cant').textContent = resumen.cantidad;
        document.getElementById('cart-lista').textContent = resumen.listaTexto;
        document.getElementById('cart-monto').textContent = resumen.montoFormateado;

        if (resumen.cantidad > 0) {
            cartBar.classList.add('visible');
        } else {
            cartBar.classList.remove('visible');
        }
    },

    /**
     * Abre el modal de reserva
     */
    abrirModalWhatsApp() {
        const resumen = app.obtenerResumen();
        if (resumen.cantidad === 0) return;

        document.getElementById('modal-numeros').textContent = resumen.listaTexto;
        document.getElementById('modal-total').textContent = resumen.montoFormateado;
        document.getElementById('modal-reserva').classList.add('active');
    },

    /**
     * Cierra el modal de reserva
     */
    cerrarModalWhatsApp() {
        document.getElementById('modal-reserva').classList.remove('active');
    },

    /**
     * Procesa la confirmación y redirige a WhatsApp
     */
    confirmarReserva(event) {
        event.preventDefault();

        const nombre = document.getElementById('nombre-comprador').value.trim();
        const telefono = document.getElementById('telefono-comprador').value.trim();

        if (!nombre || !telefono) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const urlWhatsApp = app.generarUrlWhatsApp(nombre, telefono);
        window.open(urlWhatsApp, '_blank');
        this.cerrarModalWhatsApp();
    }
};

// Iniciar aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => ui.init());