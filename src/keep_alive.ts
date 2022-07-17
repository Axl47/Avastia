import { createServer, IncomingMessage, ServerResponse } from 'http';

createServer(function (req: IncomingMessage, res: ServerResponse) {
    res.write("I'm alive");
    res.end();
  }).listen(8080);