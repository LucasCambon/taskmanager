const app = require('../../src/app');

describe('Server Initialization', () => {
  let server;

  beforeAll(async () => {
    server = app.listen(3000);
  }, 10000);

  afterAll(async () => {
    await server.close(); // Cerrar el servidor después de todas las pruebas
  }, 10000);

  test('Server should start and listen on the specified port', async () => {
    expect(server).toBeDefined();
    // You can perform additional assertions here, such as checking the server's address and port
  });
});