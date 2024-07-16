import sequelize from '../sequalize.js';
import { Transaction } from 'sequelize';


class Medicamento {
    constructor({ id, nombre_generico, nombre_comercial, estado, familia, categoria }) {
        this.id = id;
        this.nombre_generico = nombre_generico;
        this.nombre_comercial = nombre_comercial;
        this.estado = estado;
        this.familia = familia;
        this.categoria = categoria;
    }


    static async validarNombreGenerico(nombre, transaction = null) {
        const query = `SELECT * FROM medicamento WHERE nombre_generico = ?`;
        const [rows] = await sequelize.query(query, {
            replacements: [nombre],
            type: sequelize.QueryTypes.SELECT,
            transaction
        });
        if (rows.length === 0) {
            return null;
        }
        const { id, nombre_generico, nombre_comercial, estado, familia, categoria } = rows[0];
        return new Medicamento({ id, nombre_generico, nombre_comercial, estado, familia, categoria });
    }

    static async crear({ nombre_generico, nombre_comercial, id_familia, id_categoria }, transaction = null) {
        const query = `INSERT INTO medicamento (nombre_generico, nombre_comercial, id_familia, id_categoria) VALUES (?, ?, ?, ?)`;
        const [result] = await sequelize.query(query, {
            replacements: [nombre_generico, nombre_comercial, id_familia, id_categoria],
            type: sequelize.QueryTypes.INSERT,
            transaction
        });
        return new Medicamento({ id: result[0], nombre_generico, nombre_comercial, id_familia, id_categoria });
    }




}

export default Medicamento;