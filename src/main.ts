require('dotenv').config();
import { SuperClient } from './structures/Client'

export const client = new SuperClient();
client.start();

/* Replit Config
const DSTOKEN = process.env['DSTOKEN'];

// Keep Alive maintains the replit online
const keep_alive = require('./keep_alive')
*/