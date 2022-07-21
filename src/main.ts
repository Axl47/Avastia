require('dotenv').config();
import { SuperClient } from './structures/Client'
import {serverCreation} from './keep_alive';

export const client = new SuperClient();
client.start();

// Server maintains the replit online
serverCreation();