/**
 * CAPA DE LÓGICA DE NEGOCIO (app.js)
 * Maneja el estado global de la aplicación, cómputos financieros,
 * segmentación de rangos numéricos y formateo de mensajes para WhatsApp.
 */

const app = {
  // Estado interno de la aplicación
  data: null,
  numerosSeleccionados: [],
  rangoActualIndex: 0,
  _fetchPromise: null,

  /**
   * Carga el archivo data.json mediante un patrón de promesa cacheada
   * @returns {Promise<Object>} Promesa que resuelve con los datos de la rifa
   */
  async cargarDatos() {
    if (this.data) return this.data;
    if (this._fetchPromise) return this._fetchPromise;

    this._fetchPromise = (async () => {
      try {
        const respuesta = await fetch("assets/data/data.json");
        if (!respuesta.ok) {
          throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        this.data = await respuesta.json();
        return this.data;
      } catch (error) {
        console.error("Error crítico al cargar data.json:", error);
        this._fetchPromise = null; // Libera el caché para permitir reintentos
        throw error;
      }
    })();

    return this._fetchPromise;
  },

  /**
   * Alterna la selección de un número (Agregar/Quitar)
   * @param {number} numero - Número seleccionado por el usuario
   * @returns {boolean} True si la operación fue exitosa, False si el número no está disponible
   */
  toggleNumero(numero) {
    if (!this.data || !this.data.boletos) return false;

    const strNum = String(numero);
    const boleto = this.data.boletos[strNum];

    // Impide seleccionar boletos ocupados o reservados
    if (boleto && boleto.estado === "ocupado") {
      return false;
    }

    const index = this.numerosSeleccionados.indexOf(numero);
    if (index > -1) {
      this.numerosSeleccionados.splice(index, 1);
    } else {
      this.numerosSeleccionados.push(numero);
      this.numerosSeleccionados.sort((a, b) => a - b);
    }
    return true;
  },

  /**
   * Calcula la cantidad y el total acumulado a pagar
   * @returns {Object} Resumen con cantidad, total numérico, texto de lista y monto formateado
   */
  obtenerResumen() {
    const cantidad = this.numerosSeleccionados.length;

    if (!this.data || !this.data.configuracion) {
      return {
        cantidad: 0,
        total: 0,
        montoFormateado: "S/ 0.00",
        listaTexto: "-",
      };
    }

    const config = this.data.configuracion;
    const precioUnitario = Number(
      config.precio_boleto || config.precioTicket || 0,
    );
    const total = cantidad * precioUnitario;
    const simboloMoneda = config.moneda || "S/";

    // Formateo estandarizado de moneda
    const formatoMoneda = new Intl.NumberFormat("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(total);

    return {
      cantidad,
      total,
      montoFormateado: `${simboloMoneda} ${formatoMoneda}`,
      listaTexto: cantidad > 0 ? this.numerosSeleccionados.join(", ") : "-",
    };
  },

  /**
   * Obtiene la cantidad total de páginas/pestañas según la configuración
   * @returns {number}
   */
  obtenerTotalPaginas() {
    if (!this.data || !this.data.configuracion) return 0;
    const config = this.data.configuracion;
    const total = config.total_boletos || 100;
    const porPagina = config.por_pagina || 50;
    return Math.ceil(total / porPagina);
  },

  /**
   * Retorna los límites numéricos (mínimo y máximo) de la página o rango actual
   * @param {number} [index=this.rangoActualIndex] - Índice del rango solicitado
   * @returns {{min: number, max: number}}
   */
  obtenerRangoNumerico(index = this.rangoActualIndex) {
    if (!this.data || !this.data.configuracion) return { min: 1, max: 1 };
    const config = this.data.configuracion;
    const inicio = config.numero_inicio || 1;
    const porPagina = config.por_pagina || 50;
    const total = config.total_boletos || 100;

    const min = inicio + index * porPagina;
    const max = Math.min(min + porPagina - 1, inicio + total - 1);

    return { min, max };
  },

  /**
   * Genera la URL codificada lista para redirección a WhatsApp
   * @param {string} nombre - Nombre del comprador
   * @param {string} telefono - Teléfono del comprador
   * @returns {string} URL formateada para wa.me
   */
  generarUrlWhatsApp(nombre, telefono) {
    if (!this.data || !this.data.configuracion) return "#";

    const config = this.data.configuracion;
    const resumen = this.obtenerResumen();

    // Limpia caracteres no numéricos del teléfono de contacto
    const numeroDestino = String(config.whatsapp_contacto || "").replace(
      /\D/g,
      "",
    );

    const mensaje = `Hola, deseo reservar los siguientes números para la *${config.titulo || "Gran Rifa"}*:

📌 *Números:* ${resumen.listaTexto}
👤 *Nombre:* ${nombre}
📞 *Teléfono:* ${telefono}
💰 *Total a Pagar:* ${resumen.montoFormateado}

Quedo a la espera de los datos de pago para confirmar mi reserva. ¡Muchas gracias!`;

    return `https://wa.me/${numeroDestino}?text=${encodeURIComponent(mensaje)}`;
  },

  /**
   * Reinicia la selección actual de boletos
   */
  limpiarSeleccion() {
    this.numerosSeleccionados = [];
  },
};
