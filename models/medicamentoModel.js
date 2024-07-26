import sequelize from '../sequalize.js';
import { Transaction } from 'sequelize';


class Medicamento {
    constructor({ id, nombre_generico, nombre_comercial, estado, familia_id, categoria_id }) {
        this.id = id;
        this.nombre_generico = nombre_generico;
        this.nombre_comercial = nombre_comercial;
        this.estado = estado;
        this.familia_id = familia_id;
        this.categoria_id = categoria_id;
    }


    // VALIDAR SI EXISTE EL NOMBRE GENERICO COMO MEDICAMENTO
    static async validarNombreGenerico(nombre, transaction = null) {
        const query = `SELECT * FROM medicamento WHERE nombre_generico = ?`;
        try {
            const [rows] = await sequelize.query(query, {
                replacements: [nombre],
                type: sequelize.QueryTypes.SELECT,
                transaction
            });

            if (rows === undefined) {
                return null;
            }

            //SI EXISTE RETORNO UN OBJETO CON SUS DATOS
            const { id, nombre_generico, nombre_comercial, estado, familia_id, categoria_id } = rows;
            return new Medicamento({ id, nombre_generico, nombre_comercial, estado, familia_id, categoria_id });
        } catch (error) {
            console.error('Error en la consulta:', error);
            throw error;
        }
    }

    // BUSCAR CATEGORIA POR SU ID( ID esta asignado en medicamento)
    static async buscarCategoriaId(categoria_id, transaction = null) {
        const query = `SELECT * FROM categoria WHERE id = ?`;
        const [rows] = await sequelize.query(query, {
            replacements: [categoria_id],
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        if (rows.length === 0) {
            return null; // Si no hay resultados, retornamos null 
        }

        // Si hay resultados, entonces creamos y retornamos un objeto Medicamento
        const { id, descripcion } = rows;
        return ({ id, descripcion });
    }

    //BUSCAR FAMILIA POR SU ID (ID esta asignado en medicamento)
    static async buscarFamiliaId(familia_id, transaction = null) {
        const query = `SELECT * FROM familia WHERE id = ?`;
        const [rows] = await sequelize.query(query, {
            replacements: [familia_id],
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        if (rows.length === 0) {
            return null; // Si no hay resultados, retornamos null 
        }

        // Si hay resultados, entonces creamos y retornamos un objeto Medicamento
        const { id, descripcion } = rows;
        return ({ id, descripcion });
    }

    // AGERGAR FAMILIA
    static async agregarFamilia(descripcion, transaction = null) {
        try {
            const query = `
            INSERT INTO familia (descripcion) VALUES (?)
        `;
            await sequelize.query(query, {
                replacements: [descripcion],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });

            const [result] = await sequelize.query('SELECT LAST_INSERT_ID() AS id', {
                type: sequelize.QueryTypes.SELECT,
                transaction
            });

            return result.id;

        } catch (error) {
            console.error('Error al agregar familia:', error);
            throw error;
        }
    }

    // AGERGAR CATEGORIA
    static async agregarCategoria(descripcion, transaction = null) {
        try {
            const query = `
                INSERT INTO categoria (descripcion) VALUES (?)
            `;
            await sequelize.query(query, {
                replacements: [descripcion],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });

            const [result] = await sequelize.query('SELECT LAST_INSERT_ID() AS id', {
                type: sequelize.QueryTypes.SELECT,
                transaction
            });

            return result.id;

        } catch (error) {
            console.error('Error al agregar categoria:', error);
            throw error;
        }
    }

    // AGERGAR FORMA FARMACEUTICA NUEVA
    static async agregarFormaFarmaceutica(descripcion, transaction = null) {
        try {
            const query = `
                INSERT INTO formafarmaceutica (descripcion) VALUES (?)
            `;
            await sequelize.query(query, {
                replacements: [descripcion],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });

            const [result] = await sequelize.query('SELECT LAST_INSERT_ID() AS id', {
                type: sequelize.QueryTypes.SELECT,
                transaction
            });

            return result.id;

        } catch (error) {
            console.error('Error al agregar formaFarmaceutica:', error);
            throw error;
        }
    }

    // AGERGAR PRESENTACION NUEVA
    static async agregarPresentacion(descripcion, transaction = null) {
        try {
            const query = `
                INSERT INTO presentacion (descripcion) VALUES (?)
            `;
            await sequelize.query(query, {
                replacements: [descripcion],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });

            const [result] = await sequelize.query('SELECT LAST_INSERT_ID() AS id', {
                type: sequelize.QueryTypes.SELECT,
                transaction
            });

            return result.id;

        } catch (error) {
            console.error('Error al agregar presentacion:', error);
            throw error;
        }
    }

    // AGERGAR CONCENTRACION NUEVA
    static async agregarConcentracion(descripcion, transaction = null) {
        try {
            const query = `
                INSERT INTO concentracion (descripcion) VALUES (?)
            `;
            await sequelize.query(query, {
                replacements: [descripcion],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });

            const [result] = await sequelize.query('SELECT LAST_INSERT_ID() AS id', {
                type: sequelize.QueryTypes.SELECT,
                transaction
            });

            return result.id;

        } catch (error) {
            console.error('Error al agregar concentracion:', error);
            throw error;
        }
    }

    //ASIGNAR FORMA FARMACEUTICA A MEDICAMENTO
    static async asignarFormaMedicamento(medicamentoId, formaId, transaction = null) {
        try {
            const query = `
                INSERT INTO medicamento_formafarmaceutica (medicamento_id, formaFarmaceutica_id) VALUES (?, ?)
            `;
            await sequelize.query(query, {
                replacements: [medicamentoId, formaId],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });
        } catch (error) {
            console.error('Error al asignar forma farmacéutica al medicamento:', error);
            throw error;
        }
    }

    //ASIGNAR PRESENTACION A MEDICAMENTO
    static async asignarPresentacionMedicamento(medicamentoId, presentacionId, transaction = null) {
        try {
            const query = `
                INSERT INTO medicamento_presentacion (medicamento_id, presentacion_id) VALUES (?, ?)
            `;
            await sequelize.query(query, {
                replacements: [medicamentoId, presentacionId],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });
        } catch (error) {
            console.error('Error al asignar presentacion al medicamento:', error);
            throw error;
        }
    }

    //ASIGNAR CONCENTRACION A MEDICAMENTO
    static async asignarConcentracionMedicamento(medicamentoId, concentracionId, transaction = null) {
        try {
            const query = `
                INSERT INTO medicamento_concentracion (medicamento_id, concentracion_id) VALUES (?, ?)
            `;
            await sequelize.query(query, {
                replacements: [medicamentoId, concentracionId],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });
        } catch (error) {
            console.error('Error al asignar concentracion al medicamento:', error);
            throw error;
        }
    }

    //CONSULTAR SI FORMA FARMACEUTICA ESTA ASIGNADA A UN MEDICAMENTO
    static async consultarMedicamentoFormaFarmaceutica(medicamentoId, formaId, transaction = null) {
        const query = `SELECT * FROM medicamento_formafarmaceutica WHERE medicamento_id = ? AND formaFarmaceutica_id = ?`;
        const [result] = await sequelize.query(query, {
            replacements: [medicamentoId, formaId],
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        // Verificar si result es undefined
        if (!result || result.length === 0) {
            return null; // Si no hay resultados, retornamos null 
        }

        // Si hay resultados, entonces creamos y retornamos un objeto 
        const { medicamento_id, formaFarmaceutica_id } = result;
        return { medicamento_id, formaFarmaceutica_id };
    }

    //CONSULTAR SI PRESENTACION ESTA ASIGNADA A UN MEDICAMENTO
    static async consultarMedicamentoPresentacion(medicamentoId, presentacionId, transaction = null) {
        const query = `SELECT * FROM medicamento_presentacion WHERE medicamento_id = ? AND presentacion_id = ?`;
        const [result] = await sequelize.query(query, {
            replacements: [medicamentoId, presentacionId],
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        if (!result || result.length === 0) {
            return null; // Si no hay resultados, retornamos null 
        }

        // Si hay resultados, entonces creamos y retornamos un objeto 
        const { medicamento_id, presentacion_id } = result;
        return ({ medicamento_id, presentacion_id });
    }

    //CONSULTAR SI CONCENTRACION ESTA ASIGNADA A UN MEDICAMENTO
    static async consultarMedicamentoConcentracion(medicamentoId, concentracionId, transaction = null) {
        const query = `SELECT * FROM medicamento_concentracion WHERE medicamento_id = ? AND concentracion_id = ?`;
        const [result] = await sequelize.query(query, {
            replacements: [medicamentoId, concentracionId],
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        if (!result || result.length === 0) {
            return null; // Si no hay resultados, retornamos null 
        }

        // Si hay resultados, entonces creamos y retornamos un objeto 
        const { medicamento_id, concentracion_id } = result;
        return ({ medicamento_id, concentracion_id });
    }

    // BUSCAR ITEM MEDICAMENTO POR MEDICAMENTO ID
    //Por cada item encontrado devuelve su concentracion_id, estado, formafarmaceutica_id, medicamento_id, presentacion_id
    // (Queda pendiente buscar la descripciones de cada ID para renderizarlas)

    // BUSCAR ITEM DEL MEDICAMENTO POR SU ID Y TRAER LAS DESCRIPCIONES DE FORMA,PRESENTACION Y CONCENTRACION
    static async buscarItemsMedicamento(medicamento_id, transaction = null) {
        try {
            const query = `
                SELECT mi.*,
                       ff.descripcion AS descripcion_forma,
                       p.descripcion AS descripcion_presentacion,
                       c.descripcion AS descripcion_concentracion
                FROM medicamento_item mi
                LEFT JOIN formafarmaceutica ff ON mi.formafarmaceutica_id = ff.id
                LEFT JOIN presentacion p ON mi.presentacion_id = p.id
                LEFT JOIN concentracion c ON mi.concentracion_id = c.id
                WHERE mi.medicamento_id = :medicamento_id
            `;

            const items = await sequelize.query(query, {
                replacements: { medicamento_id },
                type: sequelize.QueryTypes.SELECT,
                transaction
            });

            return items;
        } catch (error) {
            console.error('Error al buscar los items del medicamento:', error);
            throw error;
        }
    }

    // las siguientes 3 funciones que se utilizan en el controlador para buscar datos de un medicamento
    //OBTENER DESCRIPCION DE LAS CONCENTRACIONES ASIGNADAS A UN MEDICAMENTO
    static async buscarConcentracionesMedicamento(medicamento_id, transaction = null) {
        try {
            const items = await sequelize.query(
                `SELECT mc.medicamento_id, mc.concentracion_id, c.descripcion
                    FROM medicamento_concentracion mc
                    JOIN concentracion c ON mc.concentracion_id = c.id
                    WHERE mc.medicamento_id = ?`,
                {
                    replacements: [medicamento_id],
                    type: sequelize.QueryTypes.SELECT,
                    transaction // Añade la transacción a la consulta
                }
            );

            if (!items || items.length === 0) {
                return null; // No se encontraron items
            }

            return items;
        } catch (error) {
            console.error('Error al buscar los items del medicamento:', error);
            throw error;
        }
    }

    //OBTENER DESCRIPCION DE LAS PRESENTACIONES ASIGNADAS A UN MEDICAMENTO
    static async buscarPresentacionesMedicamento(medicamento_id, transaction = null) {
        try {
            const items = await sequelize.query(
                `SELECT mp.medicamento_id, mp.presentacion_id, p.descripcion
                    FROM medicamento_presentacion mp
                    JOIN presentacion p ON mp.presentacion_id = p.id
                    WHERE mp.medicamento_id = ?`,
                {
                    replacements: [medicamento_id],
                    type: sequelize.QueryTypes.SELECT,
                    transaction // Añade la transacción a la consulta
                }
            );

            if (!items || items.length === 0) {
                return null; // No se encontraron items
            }

            return items;
        } catch (error) {
            console.error('Error al buscar los items del medicamento:', error);
            throw error;
        }
    }

    //OBTENER DESCRIPCION DE LAS FORMAS ASIGNADAS A UN MEDICAMENTO
    static async buscarFormasMedicamento(medicamento_id, transaction = null) {
        try {
            const items = await sequelize.query(
                `SELECT mf.medicamento_id, mf.formaFarmaceutica_id, f.descripcion
                    FROM medicamento_formafarmaceutica mf
                    JOIN formafarmaceutica f ON mf.formaFarmaceutica_id = f.id
                    WHERE mf.medicamento_id = ?`,
                {
                    replacements: [medicamento_id],
                    type: sequelize.QueryTypes.SELECT,
                    transaction // Añade la transacción a la consulta
                }
            );

            if (!items || items.length === 0) {
                return null; // No se encontraron items
            }

            return items;
        } catch (error) {
            console.error('Error al buscar los items del medicamento:', error);
            throw error;
        }
    }



    //Buscar todos los medicamentos 
    static async buscarMedicamentos(transaction = null) {
        try {
            const medicamentos = await sequelize.query(
                `SELECT 
                *
             FROM medicamento`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!medicamentos || medicamentos.length === 0) {
                return null; // No se encontraron items
            }

            return medicamentos;
        } catch (error) {
            console.error('Error al buscar todos los medicamentos disponibles:', error);
            throw error;
        }
    }

    //Buscar todas las familias
    static async buscarFamilias(transaction = null) {
        try {
            const familias = await sequelize.query(
                `SELECT 
                *
             FROM familia`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!familias || familias.length === 0) {
                return null; // No se encontraron items
            }

            return familias;
        } catch (error) {
            console.error('Error al buscar todas las familias disponibles:', error);
            throw error;
        }
    }

    //BUSCAR TODAS LAS CATEGORIAS
    static async buscarCategorias(transaction = null) {
        try {
            const categorias = await sequelize.query(
                `SELECT 
                    *
                 FROM categoria`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!categorias || categorias.length === 0) {
                return null; // No se encontraron items
            }

            return categorias;
        } catch (error) {
            console.error('Error al buscar todas las categorias disponibles:', error);
            throw error;
        }
    }

    //Buscar todas las formas 
    static async buscarFormas(transaction = null) {
        try {
            const formas = await sequelize.query(
                `SELECT 
            *
         FROM formafarmaceutica`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!formas || formas.length === 0) {
                return null; // No se encontraron items
            }

            return formas;
        } catch (error) {
            console.error('Error al buscar todas las formas disponibles:', error);
            throw error;
        }
    }

    // Buscar todas las presentaciones 
    static async buscarPresentaciones(transaction = null) {
        try {
            const presentaciones = await sequelize.query(
                `SELECT 
                *
             FROM presentacion`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!presentaciones || presentaciones.length === 0) {
                return null; // No se encontraron items
            }

            return presentaciones;
        } catch (error) {
            console.error('Error al buscar todas las presentaciones disponibles:', error);
            throw error;
        }
    }

    //Buscar todas las concentraciones
    static async buscarConcentraciones(transaction = null) {
        try {
            const concentraciones = await sequelize.query(
                `SELECT 
                *
             FROM concentracion`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!concentraciones || concentraciones.length === 0) {
                return null; // No se encontraron items
            }

            return concentraciones;
        } catch (error) {
            console.error('Error al buscar todas las concentraciones disponibles:', error);
            throw error;
        }
    }




    // AGREGAR ITEM MEDICAMENTO (PREVIAMENTE DEBE ESTAR AGREGADA FORMA PRESENTACION Y CONCENTRACION EN SUS TABLAS COMO EN LA DE RELACION CON MEDICAMENTO)
    static async agregarItemMedicamento({ medicamentoId, formaFarmaceuticaId, presentacionId, concentracionId, estado, transaction = null }) {
        try {
            // Preparar la consulta SQL con placeholders para evitar SQL Injection
            const sql = `
                INSERT INTO medicamento_item 
                    (medicamento_id, formafarmaceutica_id, presentacion_id, concentracion_id, estado) 
                VALUES 
                    (?, ?, ?, ?, ?)
            `;

            // Ejecutar la consulta con Sequelize utilizando la transacción opcional
            await sequelize.query(sql, {
                replacements: [medicamentoId, formaFarmaceuticaId, presentacionId, concentracionId, estado],
                type: sequelize.QueryTypes.INSERT,
                transaction: transaction
            });

            // Retornar los datos insertados como confirmación
            return {
                medicamentoId,
                formaFarmaceuticaId,
                presentacionId,
                concentracionId,
                estado
            };
        } catch (error) {
            // Revertir la transacción en caso de error (si se está utilizando una transacción)
            console.error('Error al agregar ítem de medicamento :', error);
            throw error;
        }
    }


    static async crear({ nombre_generico, nombre_comercial, familia_id, categoria_id }, transaction = null) {
        const estado = 1;
        const query = `INSERT INTO medicamento (nombre_generico, nombre_comercial, estado, familia_id, categoria_id) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await sequelize.query(query, {
            replacements: [nombre_generico, nombre_comercial, estado, familia_id, categoria_id],
            type: sequelize.QueryTypes.INSERT,
            transaction
        });

        return new Medicamento({ id: result, nombre_generico, nombre_comercial, estado, familia_id, categoria_id });
    }





}

export default Medicamento;