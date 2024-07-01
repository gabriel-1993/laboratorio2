import {createPool} from 'mysql2/promise';

const pool = createPool({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'laboratorio2'
})

export default pool;

// // database.js o config.js
// import { Sequelize } from 'sequelize';

// const sequelize = new Sequelize('laboratorio2', 'root', '', {
//   host: 'localhost',
//   dialect: 'mysql',
// });

// export default sequelize;