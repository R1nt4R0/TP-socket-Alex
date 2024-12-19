let canTerminate = true; // Indique si le processus peut être arrêté

// Fonction générique pour gérer les signaux
async function handleSignal(signal) {
  if (canTerminate) {
    console.log(`Signal ${signal} reçu.`);
    console.log("Nettoyage en cours...");

    // Attendre 5 secondes avant de quitter le processus
    setTimeout(() => {
      console.log("Arrêt du processus.");
      process.exit(0); // Quitter proprement avec le code 0
    }, 5000);
  } else {
    console.log(`Signal ${signal} reçu, mais l'arrêt est impossible pour le moment.`);
  }
}

// Écoute des signaux SIGINT et SIGTERM
process.on("SIGINT", () => handleSignal("SIGINT"));
process.on("SIGTERM", () => handleSignal("SIGTERM"));

// Simulation d'une application qui reste active
console.log("Application en cours d'exécution.");
console.log("Appuyez sur CTRL+C pour envoyer un signal ou utilisez Stop-Process -Id <PID>.");

// Alterne entre l'état où le processus peut être arrêté et bloqué
setInterval(() => {
  canTerminate = !canTerminate;
  if (canTerminate) {
    console.log("Le processus peut maintenant être arrêté.");
  } else {
    console.log("Le processus est dans une phase critique, arrêt impossible pour le moment.");
  }
}, 5000);

// Exécute une tâche répétée pour simuler une activité
setInterval(() => {
  console.log("Le processus est toujours actif...");
}, 2000);
