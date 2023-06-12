import dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { app } from './app';

dotenv.config({ path: '../config.env' });

const port = process.env.PORT;
if (!port) {
  console.log(
    `If Port is undefine, Check "dotenv.config({ path: '..........' })" path of config.env is correct?
    For run from C:\\Users\\iamni\\Desktop\\kanban-ts\\backend >>> use { path: '../config.env' }
    For run from C:\\Users\\iamni\\Desktop\\kanban-ts\\ >>>>>>>>>> use { path: './config.env' }`
  );
}
// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );

const DB = 'mongodb://127.0.0.1:27017/kanban-ts';

mongoose.connect(DB).then(() => console.log('DB connection succesful'));

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
