import sequelize from '../sequalize.js';
import { Transaction } from 'sequelize';


class ObraSocial {
    constructor({ id, nombre, telefono, direccion, estado }) {
        this.id = id;
        this.nombre = nombre;
        this.telefono = telefono;
        this.direccion = direccion;
        this.estado = estado;
    }

    //Buscar todas las obras sociales 
    static async buscarObrasSociales(transaction = null) {
        try {
            const obrasSociales = await sequelize.query(
                `SELECT 
            *
         FROM obrasocial`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!obrasSociales || obrasSociales.length === 0) {
                return null; // No se encontraron items
            }

            return obrasSociales;
        } catch (error) {
            console.error('Error al buscar todas las obrasSociales :', error);
            throw error;
        }
    }

    //Buscar todos los planes
    static async buscarPlanes(transaction = null) {
        try {
            const planes = await sequelize.query(
                `SELECT 
            *
         FROM plan`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    transaction
                }
            );
            if (!planes || planes.length === 0) {
                return null; // No se encontraron items
            }
            return planes;
        } catch (error) {
            console.error('Error al buscar todos los planes :', error);
            throw error;
        }
    }

    //Agregar Obra Social y recuperar id
    static async agregarObraSocial(descripcion, telefono, direccion, estado, transaction = null) {
        try {
            const query = `INSERT INTO obrasocial (nombre, telefono, direccion, estado) VALUES (?, ?, ?, ?)`;
            const [results] = await sequelize.query(query, {
                replacements: [descripcion, telefono, direccion, estado],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });
            // El ID insertado está en la primera posición del array 'results'
            const insertId = results;
            return insertId;
        } catch (error) {
            console.error('Error al agregar obra social:', error);
            throw error; // Lanzar el error para que sea manejado por la transacción
        }
    }

    //Agregar Plan y recuperar id
    static async agregarPlan(nombre, transaction = null) {
        const estado = 1;
        try {
            const query = `INSERT INTO plan (nombre, estado) VALUES (?, ?)`;
            const [results] = await sequelize.query(query, {
                replacements: [nombre, estado],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });
            // El ID insertado está en la primera posición del array 'results'
            const insertId = results;
            return insertId;
        } catch (error) {
            console.error('Error al agregar plan:', error);
            throw error; // Lanzar el error para que sea manejado por la transacción
        }
    }

    //Asignar Plan a obra social
    static async asignarPlan(idObraSocial, idPlan, transaction = null) {
        try {
            const query = `INSERT INTO obrasocial_plan (obraSocial_id, plan_id) VALUES (?, ?)`;
            await sequelize.query(query, {
                replacements: [idObraSocial, idPlan],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });
        } catch (error) {
            console.error('Error al asignar plan a obra social:', error);
            throw error; // Lanzar el error para que sea manejado por la transacción
        }
    }

    //eliminar relacion entre obra y plan
    static async desasignarPlan(idObraSocial, idPlan, transaction = null) {
        try {

            // Validar que no sean nulos o indefinidos
            if (!idObraSocial || !idPlan) {
                throw new Error('El ID de Obra Social o el ID del Plan no pueden ser nulos o indefinidos');
            }

            const query = `DELETE FROM obrasocial_plan WHERE obraSocial_id = ? AND plan_id = ?`;
            await sequelize.query(query, {
                replacements: [idObraSocial, idPlan],
                type: sequelize.QueryTypes.DELETE,
                transaction
            });
        } catch (error) {
            console.error('Error al desasignar plan de obra social:', error);
            throw error; // Lanzar el error para que sea manejado por la transacción
        }
    }


    //Buscar planes asignados a obra social con nombre
    static async buscarPlanesAsignados(idObraSocial, transaction = null) {
        try {
            const planesAsignados = await sequelize.query(
                `SELECT 
                osp.*, 
                p.nombre AS nombrePlan 
             FROM obrasocial_plan osp
             INNER JOIN plan p ON osp.plan_id = p.id
             WHERE osp.obraSocial_id = ?`,
                {
                    replacements: [idObraSocial],
                    type: sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!planesAsignados || planesAsignados.length === 0) {
                return null; // No se encontraron items
            }

            return planesAsignados;
        } catch (error) {
            console.error('Error al buscar todos los planes asignados:', error);
            throw error;
        }
    }

    //Modificar datos obra social
    static async modificarObraSocial(idObraSocial, nombre, telefono, direccion, estado, transaction = null) {
        try {
            const query = `
          UPDATE obrasocial
          SET nombre = ?,
          estado = ?,
          telefono = ?,
          direccion = ?
            
          WHERE id = ?
        `;
            const valores = [nombre, estado, telefono, direccion, idObraSocial];
            await sequelize.query(query, {
                replacements: valores,
                type: sequelize.QueryTypes.UPDATE,
                transaction
            });
        } catch (error) {
            console.error('Error al modificar obra social:', error);
            throw error;
        }
    }



}


export default ObraSocial;