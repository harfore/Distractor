chrome.runtime.onInstalled.addListener(function () {
    console.log('Extension installée.');
});

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install' || details.reason === 'update') {
        // Fonction pour créer une nouvelle fenêtre popup
        function createRandomPopup() {
            chrome.windows.create({
                url: 'rappel.html', // Remplace par le chemin de ton popup HTML
                type: 'popup',
                width: 400,
                height: 200,
            });
        }

        function getRandomInterval() {
            return Math.floor((Math.random() * 30) + 1) * 1000
            // (10 * 60 * 1000 - 1 * 60 * 1000 + 1) + 1 * 60 * 1000);
        }

        // Appelle la fonction pour la première fois après le délai initial
        setTimeout(createRandomPopup, getRandomInterval());

        // Ensuite, répète l'appel à intervalles aléatoires entre 1 et 10 minutes
        setInterval(function () {
            createRandomPopup();
        }, getRandomInterval());
    }
});