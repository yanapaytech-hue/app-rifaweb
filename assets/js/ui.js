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
            /*se agrega tab para la presentación*/
            this.renderizarTabs(data.configuracion);
            this.renderizarTablero();
        } catch (e) {
            console.error(e);
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
        if(!container) return;  /*agreba el tab para varias paginas*/
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
     * Genera las pestañas dinámicamente según el rango (Ej: 101-150, 151-200)
     */
    renderizarTabs(config) {
        const container = document.getElementById('range-tabs');
        if (!container) return;

        const inicio = config.numero_inicio || 1;
        const total = config.total_boletos || 100;
        const porPagina = config.por_pagina || 50;
        const cantidadTabs = Math.ceil(total / porPagina);

        let html = '';
        for (let i = 0; i < cantidadTabs; i++) {
            const numInicioGroup = inicio + (i * porPagina);
            const numFinGroup = Math.min(inicio + ((i + 1) * porPagina) - 1, inicio + total - 1);
            const activeClass = i === app.rangoActualIndex ? 'active' : '';

            html += `<button class="tab-btn ${activeClass}" onclick="ui.cambiarRango(${i})">${numInicioGroup} - ${numFinGroup}</button>`;
        }

        container.innerHTML = html;
    },

    cambiarRango(index) {
        app.rangoActualIndex = index;
        this.renderizarTabs(app.data.configuracion);
        this.renderizarTablero();
    },

    /**
     * Muestra solo los números que corresponden a la pestaña seleccionada
     */
    renderizarTablero() {
        const config = app.data.configuracion;
        const boletos = app.data.boletos;
        const grid = document.getElementById('numeros-grid');

        const inicio = config.numero_inicio || 1;
        const porPagina = config.por_pagina || 50;

        const minNum = inicio + (app.rangoActualIndex * porPagina);
        const maxNum = Math.min(minNum + porPagina - 1, inicio + config.total_boletos - 1);

        let html = '';
        for (let i = minNum; i <= maxNum; i++) {
            const numStr = String(i);
            const boleto = boletos[numStr] || { estado: 'disponible' };
            const esOcupado = boleto.estado === 'ocupado';
            const esSeleccionado = app.numerosSeleccionados.includes(i);

            let claseEstado = esOcupado ? 'ocupado' : '';
            if (esSeleccionado) claseEstado += ' seleccionado';

            html += `<button class="num-btn ${claseEstado}" id="btn-num-${i}" onclick="ui.onNumeroClick(${i})">${i}</button>`;
        }

        grid.innerHTML = html;
    },
    /**
     * Manejador de click en un número
     */
    
    /*onNumeroClick(numero) {
        const exito = app.toggleNumero(numero);
        if (!exito) return;

        this.renderizarTablero();
        this.actualizarBarraCarrito();
    },*/
    
    // Agregar dentro del objeto ui en assets/js/ui.js

    /**
     * Abre el popup del tablero ampliado y sincroniza los contenidos
     */
    abrirModalTableroGrande() {
        const modal = document.getElementById('modal-tablero-grande');
        if (modal) {
            this.renderizarTabsModal(app.data.configuracion);
            this.renderizarTableroModal();
            modal.classList.add('active');
        }
    },

    /**
     * Cierra el popup del tablero ampliado
     */
    cerrarModalTableroGrande() {
        const modal = document.getElementById('modal-tablero-grande');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Renderiza las pestañas dentro del modal
     */
    renderizarTabsModal(config) {
        const container = document.getElementById('modal-range-tabs');
        if (!container) return;

        const inicio = config.numero_inicio || 1;
        const total = config.total_boletos || 100;
        const porPagina = config.por_pagina || 50;
        const cantidadTabs = Math.ceil(total / porPagina);

        let html = '';
        for (let i = 0; i < cantidadTabs; i++) {
            const numInicioGroup = inicio + (i * porPagina);
            const numFinGroup = Math.min(inicio + ((i + 1) * porPagina) - 1, inicio + total - 1);
            const activeClass = i === app.rangoActualIndex ? 'active' : '';

            html += `<button class="tab-btn ${activeClass}" onclick="ui.cambiarRangoModal(${i})">${numInicioGroup} - ${numFinGroup}</button>`;
        }

        container.innerHTML = html;
    },

    /**
     * Cambia el rango y actualiza ambas vistas (principal y modal)
     */
    cambiarRangoModal(index) {
        app.rangoActualIndex = index;
        this.renderizarTabs(app.data.configuracion);
        this.renderizarTablero();
        this.renderizarTabsModal(app.data.configuracion);
        this.renderizarTableroModal();
    },

    /**
     * Renderiza la grilla de números dentro del modal
     */
    renderizarTableroModal() {
        const config = app.data.configuracion;
        const boletos = app.data.boletos;
        const grid = document.getElementById('modal-numeros-grid');
        if (!grid) return;

        const inicio = config.numero_inicio || 1;
        const porPagina = config.por_pagina || 50;

        const minNum = inicio + (app.rangoActualIndex * porPagina);
        const maxNum = Math.min(minNum + porPagina - 1, inicio + config.total_boletos - 1);

        let html = '';
        for (let i = minNum; i <= maxNum; i++) {
            const numStr = String(i);
            const boleto = boletos[numStr] || { estado: 'disponible' };
            const esOcupado = boleto.estado === 'ocupado';
            const esSeleccionado = app.numerosSeleccionados.includes(i);

            let claseEstado = esOcupado ? 'ocupado' : '';
            if (esSeleccionado) claseEstado += ' seleccionado';

            html += `<button class="num-btn ${claseEstado}" onclick="ui.onNumeroClick(${i})">${i}</button>`;
        }

        grid.innerHTML = html;
    },
    
    // Sobrescribe onNumeroClick para mantener sincronizadas ambas pantallas
    onNumeroClick(numero) {
        const exito = app.toggleNumero(numero);
        if (!exito) return;

        this.renderizarTablero();
        this.renderizarTableroModal();
        this.actualizarBarraCarrito();
    },

    // Actualiza los totales de la barra flotante
    /*actualizarBarraCarrito() {
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
    },*/

    /**
     * Actualiza los totales de la barra flotante con verificaciones nulas
     */
    actualizarBarraCarrito() {
        const resumen = app.obtenerResumen();
        const cartBar = document.getElementById('cart-bar');
        const cartCant = document.getElementById('cart-cant');
        const cartLista = document.getElementById('cart-lista');
        const cartMonto = document.getElementById('cart-monto');

        // Si alguno de los elementos del DOM no existe, detiene la ejecución para evitar fallos
        if (!cartBar || !cartCant || !cartLista || !cartMonto) {
            console.warn("Advertencia: No se encontraron todos los elementos del carrito en el DOM.");
            return;
        }

        // Asignación segura de valores
        cartCant.textContent = resumen.cantidad;
        cartLista.textContent = resumen.listaTexto;
        cartMonto.textContent = resumen.montoFormateado;

        // Alterna la visibilidad
        if (resumen.cantidad > 0) {
            cartBar.classList.add('visible');
        } else {
            cartBar.classList.remove('visible');
        }
    },

    // Abre el modal de reserva
    abrirModalWhatsApp() {
        const resumen = app.obtenerResumen();
        if (resumen.cantidad === 0) return;

        document.getElementById('modal-numeros').textContent = resumen.listaTexto;
        document.getElementById('modal-total').textContent = resumen.montoFormateado;
        document.getElementById('modal-reserva').classList.add('active');
    },

    // Cierra el modal de reserva
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