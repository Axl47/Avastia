import { config } from 'dotenv';
config();

import { SuperClient } from './structures/Client.js';

export const client = new SuperClient();
client.start();
