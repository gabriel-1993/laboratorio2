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


    





}




export default Paciente;