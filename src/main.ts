require('dotenv').config();
import { SuperClient } from './structures/Client';

export const client = new SuperClient();
client.start();
