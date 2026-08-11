/**
 * CAPA DE LÓGICA DE NEGOCIO (app.js)
 * Mantiene el estado de la aplicación, realiza búsquedas de datos,
 * cálculos numéricos y construcción de URLs de reserva.
 */

const app = {
  // Estado interno
  data: null,
  numerosSeleccionados: [],
  rangoActualIndex: 0, // 0 para el primer grupo (101-150), 1 para el segundo (151-200)
  /**
   * Carga el archivo de datos data.json
   */
  async cargarDatos() {
    try {
      const respuesta = await fetch("assets/data/data.json");
      if (!respuesta.ok) throw new Error("No se pudo cargar la base de datos.");
      this.data = await respuesta.json();
      return this.data;
    } catch (error) {
      console.error("Error al cargar data.json:", error);
      throw error;
    }
  },

  /**
   * Alterna la selección de un número
   */
  toggleNumero(numero) {
    const strNum = String(numero);
    const boleto = this.data.boletos[strNum];

    // Si el número está marcado como ocupado en el JSON, no se puede seleccionar
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
   * Calcula la cantidad y monto total acumulado
   */
  obtenerResumen() {
    const cantidad = this.numerosSeleccionados.length;
    const precioUnitario = this.data.configuracion.precio_boleto;
    const moneda = this.data.configuracion.moneda;
    const total = cantidad * precioUnitario;

    return {
      cantidad,
      total,
      montoFormateado: `${moneda} ${total.toFixed(2)}`,
      listaTexto: cantidad > 0 ? this.numerosSeleccionados.join(", ") : "-",
    };
  },

  /**
   * Genera la URL codificada para redireccionar a WhatsApp
   */
  generarUrlWhatsApp(nombre, telefono) {
    const config = this.data.configuracion;
    const resumen = this.obtenerResumen();

    const mensaje = `Hola, deseo reservar los siguientes números para la *${config.titulo}*:

📌 *Números:* ${resumen.listaTexto}
👤 *Nombre:* ${nombre}
📞 *Teléfono:* ${telefono}
💰 *Total a Pagar:* ${resumen.montoFormateado}

Quedo a la espera de los datos de pago para confirmar mi reserva. ¡Muchas gracias!`;

    const mensajeEncoded = encodeURIComponent(mensaje);
    return `https://wa.me/${config.whatsapp_contacto}?text=${mensajeEncoded}`;
  },
};
