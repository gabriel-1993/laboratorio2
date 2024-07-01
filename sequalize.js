// config/sequelize.js
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('laboratorio2', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

export default sequelize;