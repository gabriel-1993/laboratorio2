// config/sequelize.js
import { Sequelize } from 'sequelize';

// const sequelize = new Sequelize('laboratorio2', 'root', '', {
//   host: 'localhost',
//   dialect: 'mysql',
// });

const sequelize = new Sequelize('laboratorio2', 'root', '1234', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    acquire: 60000, // tiempo máximo en milisegundos para intentar obtener una conexión antes de lanzar un error
    idle: 10000    // tiempo máximo en milisegundos que una conexión puede estar inactiva antes de ser liberada
  }
});

export default sequelize;