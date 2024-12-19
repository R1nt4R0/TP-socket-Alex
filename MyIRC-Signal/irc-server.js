const net = require("net");
const readline = require("readline");

const PORT = 6667;
const clients = []; // Liste des clients connectés

// Création du serveur
const server = net.createServer((socket) => {
  console.log("--- Un client s'est connecté.");

  let username = null;

  // Préparation de l'interface de saisie pour chaque client
  const rl = readline.createInterface({
    input: socket,
    output: socket,
    prompt: ""
  });

  // Demande du pseudo au client à la connexion
  socket.write("Bienvenue sur le serveur IRC! Entrez votre pseudo:\n");

  // Gestion de l'entrée utilisateur
  rl.on("line", (line) => {
    const message = line.trim();

    if (!username) {
      // Si l'utilisateur n'a pas encore défini son pseudo
      setUsername(socket, message);
    } else {
      // Traitement des commandes ou message classique
      handleCommand(socket, message);
    }
  });

  // Gestion de la déconnexion du client
  socket.on("end", () => {
    console.log(`--- ${username || "Un client"} s'est déconnecté.`);
    broadcast(`${username} a quitté le chat.`, socket);
    removeClient(socket);
  });

  // Gestion des erreurs de socket
  socket.on("error", (err) => {
    console.error("Erreur sur le socket:", err.message);
  });

  // Fonction pour définir le pseudo de l'utilisateur
  function setUsername(socket, message) {
    username = message;
    socket.write(`Bienvenue, ${username}!\n`);
    broadcast(`${username} a rejoint le chat.`, socket);
    clients.push({ username, socket });
  }

  // Fonction pour gérer les commandes ou les messages classiques
  function handleCommand(socket, message) {
    if (message.startsWith("/list")) {
      sendUserList(socket);
    } else if (message.startsWith("/whisper")) {
      sendWhisper(socket, message);
    } else {
      broadcast(`${username}: ${message}`, socket);
    }
  }

  // Fonction pour envoyer la liste des utilisateurs connectés
  function sendUserList(socket) {
    const userList = clients.map(client => client.username).join(", ");
    socket.write(`Clients connectés: ${userList}\n`);
  }

  // Fonction pour gérer les chuchotements (messages privés)
  function sendWhisper(socket, message) {
    const parts = message.split(" ");
    const recipient = parts[1];
    const whisperMessage = parts.slice(2).join(" ");

    if (!recipient || !whisperMessage) {
      socket.write("Usage: /whisper [pseudo] [message]\n\r");
      return;
    }

    const recipientClient = clients.find(client => client.username === recipient);

    if (recipientClient) {
      recipientClient.socket.write(`[Chuchotement de ${username}]: ${whisperMessage}\n`);
      socket.write(`[Chuchotement a ${recipient}]: ${whisperMessage}\n\r`);
    } else {
      socket.write(`Le destinataire ${recipient} n'est pas connecté.\n\r`);
    }
  }

  // Fonction pour transmettre un message à tous les clients sauf l'expéditeur
  function broadcast(message, senderSocket) {
    clients.forEach(({ socket }) => {
      if (socket !== senderSocket) {
        socket.write(`${message}\n\r`);
      }
    });
  }

  // Fonction pour supprimer un client de la liste lorsqu'il se déconnecte
  function removeClient(socket) {
    const index = clients.findIndex(client => client.socket === socket);
    if (index !== -1) clients.splice(index, 1);
  }
});

// Gestion des signaux (SIGINT, SIGTERM)
function handleSignal(signal) {
  console.log(`Signal ${signal} reçu. Arrêt du serveur dans 5 secondes...`);

  // Envoyer un message à tous les clients connectés
  clients.forEach(({ socket }) => {
    socket.write("Le serveur va fermer dans 5 secondes. Merci de votre participation.\n\r");
  });

  // Arrêter le serveur après un délai de 5 secondes
  setTimeout(() => {
    console.log("Arrêt du serveur.");
    server.close(() => {
      process.exit(0); // Quitter proprement
    });
  }, 5000);
}

// Écoute des signaux SIGINT et SIGTERM
process.on("SIGINT", () => handleSignal("SIGINT"));
process.on("SIGTERM", () => handleSignal("SIGTERM"));

// Démarrer le serveur sur le port spécifié
server.listen(PORT, () => {
  console.log(`Serveur IRC en écoute sur le port ${PORT}`);
});
