import sequelize from '../sequalize.js';


class Paciente {
    constructor({ id, nombre, apellido, documento, fecha_nacimiento, sexo, telefono, alergia, estado }) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.documento = documento;
        this.fecha_nacimiento = fecha_nacimiento;
        this.sexo = sexo;
        this.telefono = telefono;
        this.alergia = alergia;
        this.estado = estado;
    }

    static async crear({ nombre, apellido, documento, fecha_nacimiento, sexo, telefono, alergia }, transaction = null) {
        try {
            console.log('Datos a insertar:', { nombre, apellido, documento, fecha_nacimiento, sexo, telefono, alergia });

            const query = `INSERT INTO paciente (nombre, apellido, documento, fecha_nacimiento, sexo, telefono, alergia) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const [result] = await sequelize.query(query, {
                replacements: [nombre, apellido, documento, fecha_nacimiento, sexo, telefono, alergia || null],
                type: sequelize.QueryTypes.INSERT,
                transaction
            });

            return new Paciente({
                id: result.insertId,
                nombre,
                apellido,
                documento,
                fecha_nacimiento,
                sexo,
                telefono,
                alergia: alergia || null
            });
        } catch (error) {
            console.error('Error en crear:', error);
            throw error;
        }
    }

    // Buscar paciente por documento/ validar DNI ocupado
    static async buscarDocumento(documentoPaciente, transaction = null) {
        try {
            const query = `SELECT * FROM paciente WHERE documento = ?`;
            const rows = await sequelize.query(query, {
                replacements: [documentoPaciente],
                type: sequelize.QueryTypes.SELECT,
                transaction
            });

            if (rows.length === 0) {
                return null;
            }

            const pacienteData = rows[0];
            const { id, nombre, apellido, documento, fecha_nacimiento, sexo, telefono, alergia, estado } = pacienteData;
            return new Paciente({ id, nombre, apellido, documento, fecha_nacimiento, sexo, telefono, alergia, estado });
        } catch (error) {
            console.error('Error en buscarDocumento:', error);
            throw error;
        }
    }

//BUSCAR OBRA Y PLAN DEL PACIENTE
static async buscarObraYPlanPorPacienteId(pacienteId, transaction = null) {
    try {
        const queryObraSocial = `
            SELECT os.nombre 
            FROM paciente_obrasocial pos 
            JOIN obrasocial os ON pos.obra_social_id = os.id 
            WHERE pos.paciente_id = ?`;

        const obraSocialRows = await sequelize.query(queryObraSocial, {
            replacements: [pacienteId],
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        const nombreObraSocial = obraSocialRows.length > 0 ? obraSocialRows[0].nombre : null;

        const queryPlan = `
            SELECT p.nombre 
            FROM paciente_plan pp 
            JOIN plan p ON pp.plan_id = p.id 
            WHERE pp.paciente_id = ?`;

        const planRows = await sequelize.query(queryPlan, {
            replacements: [pacienteId],
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        const nombrePlan = planRows.length > 0 ? planRows[0].nombre : null;

        return {
            obra_social: nombreObraSocial,
            plan: nombrePlan
        };
    } catch (error) {
        console.error('Error en buscarObraYPlanPorPacienteId:', error);
        throw error;
    }
}




    // Buscar todos los pacientes
    static async obtenerTodosLosPacientes(transaction = null) {
        try {
            const query = `SELECT * FROM paciente`;
            const rows = await sequelize.query(query, {
                type: sequelize.QueryTypes.SELECT,
                transaction
            });

            if (!rows || rows.length === 0) {
                return null;
            }

            // Mapea los resultados a instancias de Paciente
            return rows.map(row => new Paciente({
                id: row.id,
                nombre: row.nombre,
                apellido: row.apellido,
                documento: row.documento,
                fecha_nacimiento: row.fecha_nacimiento,
                sexo: row.sexo,
                telefono: row.telefono,
                alergia: row.alergia,
                estado: row.estado,
            }));
        } catch (error) {
            console.error('Error en obtenerTodosLosPacientes:', error);
            throw error;
        }
    }

    //modificar paciente
    static async modificarPaciente(id,
        nombre,
        apellido,
        documento,
        fecha_nacimiento,
        sexo,
        telefono,
        alergia,
        estado, transaction = null) {
        try {
            const query = `
        UPDATE paciente
        SET nombre = ?,
            apellido = ?,
            documento = ?,
            fecha_nacimiento = ?,
            sexo = ?,
            telefono = ?,
            alergia = ?,
            estado = ?
        WHERE id = ?
      `;

            const valores = [nombre,
                apellido,
                documento,
                fecha_nacimiento,
                sexo,
                telefono,
                alergia,
                estado, 
                id];

            await sequelize.query(query, {
                replacements: valores,
                type: sequelize.QueryTypes.UPDATE,
                transaction
            });
        } catch (error) {
            console.error('Error al modificar el medicamento:', error);
            throw error;
        }
    }






}




export default Paciente;