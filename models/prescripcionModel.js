import sequelize from '../sequalize.js'; // Asegúrate de que la ruta sea correcta
import { Transaction } from 'sequelize';

class Prescripcion {
    constructor({ id, fecha, vigencia, diagnostico, prof_id_refeps, paciente_id, estado }) {
        this.id = id;
        this.fecha = fecha;
        this.vigencia = vigencia;
        this.diagnostico = diagnostico;
        this.prof_id_refeps = prof_id_refeps;
        this.paciente_id = paciente_id;
        this.estado = estado;
    }


    static async crear({ fecha, vigencia, diagnostico, prof_id_refeps, paciente_id, estado }, transaction = null) {
        try {
            const query = `INSERT INTO prescripcion (fecha, vigencia, diagnostico, prof_id_refeps, paciente_id, estado) VALUES (?, ?, ?, ?, ?, ?)`;
            const [result] = await sequelize.query(query, {
                replacements: [fecha, vigencia, diagnostico, prof_id_refeps, paciente_id, estado],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });

            const insertId = result;

            return new Prescripcion({
                id: insertId,
                fecha,
                vigencia,
                diagnostico,
                prof_id_refeps,
                paciente_id,
                estado
            });
        } catch (error) {
            console.error('Error en crear:', error);
            throw error;
        }
    }


    static async agregarMedicamentoItemAprescripcion(prescripcion_id, medicamento_item_id, administracion, duracion, transaction = null) {
        try {
            const query = `INSERT INTO prescripcion_medicamento_item (prescripcion_id, medicamento_item_id, administracion, duracion) VALUES (?, ?, ?, ?)`;
            await sequelize.query(query, {
                replacements: [prescripcion_id, medicamento_item_id, administracion, duracion],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });
        } catch (error) {
            console.error('Error al agregar medicamento a la prescripción:', error);
            throw error;
        }
    }

    static async agregarPrestacionAprescripcion(prescripcion_id, prestacion_id, lado_id = null, indicacion, justificacion, transaction = null) {
        try {
            const query = `INSERT INTO prescripcion_prestacion (prescripcion_id, prestacion_id, lado_id, indicacion, justificacion) VALUES (?, ?, ?, ?, ?)`;
            await sequelize.query(query, {
                replacements: [
                    prescripcion_id,
                    prestacion_id,
                    lado_id ? lado_id : null,
                    indicacion,
                    justificacion
                ],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });
        } catch (error) {
            console.error('Error al agregar prestación a la prescripción:', error);
            throw error;
        }
    }


    static async obtenerPrescripcionesAnteriores(paciente_id, transaction = null) {
        try {
            const query = `
                SELECT * 
                FROM prescripcion 
                WHERE paciente_id = ?
            `;
            const prescripciones = await sequelize.query(query, {
                replacements: [paciente_id],
                type: sequelize.QueryTypes.SELECT,
                transaction
            });
            return prescripciones;
        } catch (error) {
            console.error('Error al obtener las prescripciones anteriores:', error);
            throw error;
        }
    }

    static async obtenerPrestacionesEnPrescripcion(prescripcion_id, transaction = null) {
        try {
            // Consulta SQL para obtener los estudios y detalles asociados
            const query = `
                SELECT 
                    pp.prestacion_id,
                    pp.lado_id,
                    pp.indicacion,
                    pp.justificacion,
                    pp.conclucionFinal,
                    pr.descripcion AS descripcion_prestacion,
                    l.descripcion AS descripcion_lado
                FROM prescripcion_prestacion pp
                LEFT JOIN prestacion pr ON pp.prestacion_id = pr.id
                LEFT JOIN lado l ON pp.lado_id = l.id
                WHERE pp.prescripcion_id = ?
            `;

            // Ejecutar la consulta
            const estudios = await sequelize.query(query, {
                replacements: [prescripcion_id],
                type: sequelize.QueryTypes.SELECT,
                transaction
            });

            return estudios;
        } catch (error) {
            console.error('Error al obtener estudios por ID de prescripción:', error);
            throw error;
        }

    }


    static async obtenerMedicamentosEnPrescripcion(prescripcion_id, transaction = null) {
        try {
            // Consulta SQL para obtener los medicamentos asociados a la prescripción
            const query = `
             SELECT 
                pmi.id,
                pmi.prescripcion_id,
                pmi.medicamento_item_id,
                pmi.administracion,
                pmi.duracion,
                mi.medicamento_id,
                m.nombre_generico
            FROM 
                prescripcion_medicamento_item pmi
            JOIN 
                medicamento_item mi ON pmi.medicamento_item_id = mi.item_id
            JOIN 
                medicamento m ON mi.medicamento_id = m.id
            WHERE 
                pmi.prescripcion_id =  ?
            `;

            // Ejecutar la consulta
            const medicamentos = await sequelize.query(query, {
                replacements: [prescripcion_id],
                type: sequelize.QueryTypes.SELECT,
                transaction
            });

            return medicamentos;
        } catch (error) {
            console.error('Error al obtener medicamentos por ID de prescripción:', error);
            throw error;
        }
    }



}







export default Prescripcion;