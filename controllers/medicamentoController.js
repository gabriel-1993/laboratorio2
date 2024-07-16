import Medicamento from '../models/medicamentoModel.js';
import sequelize from '../sequalize.js';

const mostrarFormAgregarMedicamento = (req, res) => {
    if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'ADMINISTRADOR')) {
      res.render('formCrearMedicamento');
    } else {
      res.status(403).json({ mensaje: 'Acceso denegado' });
    }
  };

  export default {
    mostrarFormAgregarMedicamento
};



const agregarMedicamento = async () => {
    const transaction = await sequelize.transaction();
    try {
        const medicamento = await Medicamento.crear({
            nombre_generico: 'Nombre Genérico',
            nombre_comercial: 'Nombre Comercial',
            id_familia: 1,
            id_categoria: 2
        }, transaction);

        // Llama a otros métodos que utilizan la misma transacción
        // Ejemplo:
        // await OtroModelo.otroMetodo(data, transaction);

        await transaction.commit();
        return medicamento;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
