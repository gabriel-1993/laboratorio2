import Profesional from '../models/profesionalModel.js';




const obtenerDatosProfesional = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const datosProfesional = await Profesional.obtenerDatosProfesional(usuario_id);
        res.status(200).json(datosProfesional);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener datos del profesional' });
    }
}




export default {
    obtenerDatosProfesional
};