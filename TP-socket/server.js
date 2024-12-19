const net = require("net");

// Port de la socket pour le serveur
const PORT = 5001;

// Création du serveur, la socket ouverte par le client est en paramètre.
const server = net.createServer((socket) => {
  console.log("--- Client connecté.");

  // Écouter les requêtes RPC du client
  socket.on("data", (data) => {
    const request = JSON.parse(data.toString());
    const response = {
      status: "success",
      data: request.params.text,
    };
    socket.write(JSON.stringify(response));
  });

  socket.on("end", () => {
    console.log("--- Client déconnecté.");
  });
});

// Démarre le serveur sur le port 5001
server.listen(PORT, () => {
  console.log(`Serveur RPC en écoute sur le port ${PORT}`);
});