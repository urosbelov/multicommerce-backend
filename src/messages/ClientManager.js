const clients = new Map();

const registerClient = (clientId, userId) => {
  clients.set(clientId, userId);
  console.log("[WebSocket] Client Manager New Client: ", clients);
};

const removeClient = clientId => {
  clients.delete(clientId);
  console.log("[WebScocket] Client Manager Remove Client: ", clients);
};

const getClientById = userId => {
  return [...clients].find(([key, value]) => userId === value)[0];
};

const getClientBySocket = clientId => {
  return clients.get(clientId);
};

const getAllClients = clientId => {
  return clients.values();
};

const clientExist = clientId => {
  return clients.has(clientId);
};

module.exports = {
  registerClient,
  removeClient,
  getAllClients,
  getClientById,
  clientExist,
  getClientBySocket
};
