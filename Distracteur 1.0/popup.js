import resources from './resources.js';

// Maintenant, vous pouvez utiliser les URLs comme ceci :
let musiqueUrls = resources.musiqueUrls
let videoUrls = resources.videoUrls
let articleUrls = resources.articlesUrls
let jeuxUrls = resources.jeuxUrls

let newPopupWindowId;
let currentWindow;
let displayedResources = {
    musique: new Set(),
    video: new Set(),
    article: new Set(),
    jeux: new Set(),
};

let isFirstResourceLiked = false
let messageType;
let likedUrls = new Set();
let dislikedUrls = [];
let likedResourcesDropdown;

document.addEventListener('DOMContentLoaded', function () {
    likedResourcesDropdown = document.getElementById('likedResourcesDropdown');
    document.getElementById('videoOption').addEventListener('click', () => changeMessageType('une video'));
    document.getElementById('musiqueOption').addEventListener('click', () => changeMessageType('une musique'));
    document.getElementById('articleOption').addEventListener('click', () => changeMessageType('un article'));
    document.getElementById('jeuxOption').addEventListener('click', () => changeMessageType('un jeux'));

    // Boutons Like et Dislike

    document.getElementById('likeBtn').addEventListener('click', () => likeResource());
    document.getElementById('dislikeBtn').addEventListener('click', () => dislikeResource());

    // ecoute l'evenement de changement du menu dropdown
    likedResourcesDropdown.addEventListener('change', function () {
        // Ouvrez une nouvelle fenêtre avec l'URL sélectionnée
        openWindow(likedResourcesDropdown.value, 700, 900);
    });
});


function likeResource() {
    getCurrentResourceUrl(function (currentUrl) {
        likedUrls.add(currentUrl);

        if (!isFirstResourceLiked) {
            likedResourcesDropdown.style.display = 'block';
            isFirstResourceLiked = true;
        }

        // Ajoute dynamiquement l'URL likée au menu déroulant
        saveLikedUrlsToLocalStorage();
        addLikedResourceToDropdown(currentUrl);
        console.log(currentUrl);
    });
}

function saveLikedUrlsToLocalStorage() {
    const likedUrlsArray = Array.from(likedUrls);
    localStorage.setItem('likedUrls', JSON.stringify(likedUrlsArray));
}

document.addEventListener('DOMContentLoaded', function () {
    //load liked URLs from localStorage
    loadLikedUrlsFromLocalStorage();

    likedResourcesDropdown = document.getElementById('likedResourcesDropdown');
});

function loadLikedUrlsFromLocalStorage() {
    const storedLikedUrls = localStorage.getItem('likedUrls');
    if (storedLikedUrls) {
        likedUrls = new Set(JSON.parse(storedLikedUrls))
    }
}

function addLikedResourceToDropdown(url) {
    // Crée un nouvel élément d'option
    const option = document.createElement('option');
    option.value = url;
    option.text = url;
    option.style.color = 'black';

    // Ajoute l'option au menu déroulant
    likedResourcesDropdown.appendChild(option);
}

function dislikeResource() {
    try {
        getCurrentResourceUrl(function (currentUrl) {
            let correctedLink = "";
            if (currentUrl.includes("youtube") || currentUrl.includes("youtu.be")) {
                correctedLink = currentUrl.replace("www.", "").replace("youtube", "youtu.be").replace(".com", "").replace("watch?v=", "");
                console.log('Link after changes: ' + correctedLink);
            } else {
                correctedLink = currentUrl;
            }
            dislikedUrls.push(correctedLink);
            let hasCommonValue = dislikedUrls.some(correctedLink => musiqueUrls.includes(correctedLink)); // boolean
            let hasCommonValue2 = dislikedUrls.some(correctedLink => videoUrls.includes(correctedLink));
            let hasCommonValue3 = dislikedUrls.some(correctedLink => articleUrls.includes(correctedLink));
            let hasCommonValue4 = dislikedUrls.some(correctedLink => jeuxUrls.includes(correctedLink));


            if (hasCommonValue) {
                musiqueUrls = musiqueUrls.filter(item => item !== correctedLink);
                console.log(`${correctedLink} disliked!`)
                console.log('Updated musique URLs: ', musiqueUrls);
            } else if (hasCommonValue2) {
                videoUrls = videoUrls.filter(item => item !== correctedLink);
                console.log('Updated Video URLs: ', videoUrls);
            } else if (hasCommonValue3) {
                articleUrls = articleUrls.filter(item => item !== correctedLink);
                console.log('Updated article URLs: ', articleUrls)
            } else if (hasCommonValue4) {
                jeuxUrls = jeuxUrls.filter(item => item !== correctedLink);
                console.log('Updated game URLs: ', jeuxUrls)
            } else {
                console.log("Sorry, no common value found with dislikedUrls.")
            }
        });
    } catch (error) {
        console.error('An error occured while getting the current resorce URL:', error.message)
    }
    saveDislikedUrlsToLocalStorage();
};

function saveDislikedUrlsToLocalStorage() {
    localStorage.setItem('dislikedUrls', JSON.stringify(dislikedUrls))
}

document.addEventListener('DOMContentLoaded', function () {
    loadDislikedUrlsFromLocalStorage();
})

function loadDislikedUrlsFromLocalStorage() {
    const storedDislikedUrls = localStorage.getItem('dislikedUrls');
    if (storedDislikedUrls) {
        dislikedUrls = JSON.parse(storedDislikedUrls);
    }
}


function changeMessageType(type) {
    messageType = type;
    changeMessage();
}

function changeMessage() {

    const messages = [`Tu as choisi de perdre ton temps avec ${messageType}  `];

    document.getElementById('message').innerText = messages;
    var img = document.createElement("img");
    img.src = "images/devil.png";
    var src = document.getElementById("message");
    img.style.height = "30px";
    img.style.marginBottom = "-9px";
    src.appendChild(img);

    // Supprime la ressource précédente
    if (currentWindow) {
        chrome.windows.remove(currentWindow.id);
    }

    // Affiche la nouvelle ressource
    displayRandomAvailableResources();
}

// Fonction pour ajuster la logique de sélection en fonction des préférences
function displayRandomAvailableResources() {
    let availableResources = getAvailableResources();

    // Choisir une ressource aléatoire parmi les disponibles
    const randomUrl = availableResources[Math.floor(Math.random() * availableResources.length)];

    // Marquer la ressource comme affichée
    markResourceAsDisplayed(randomUrl);
    let height, width;

    if (messageType === "une musique") {
        height = 600, width = 900;
    } else if (messageType === "une video") {
        height = 800, width = 1200;
    } else if (messageType === "un article") {
        height = 800, width = 900;
    } else if (messageType === "un jeux") {
        height = 700, width = 1100;
    }
    openWindow(randomUrl, height, width);
    return randomUrl
}

// Fonction pour réinitialiser les ressources affichées
function resetDisplayedResources() {
    displayedResources = {
        musique: new Set(),
        video: new Set(),
        article: new Set(),
        jeux: new Set()
    };
}

// Fonction pour marquer la ressource comme affichée
function markResourceAsDisplayed(url) {
    // Sélection du set en fonction du type
    let currentSet;
    if (messageType === "une musique") {
        currentSet = displayedResources.musique;
    } else if (messageType === "une video") {
        currentSet = displayedResources.video;
    } else if (messageType === "un article") {
        currentSet = displayedResources.article;
    } else if (messageType === "un jeux") {
        currentSet = displayedResources.jeux;
    }

    // Marquer la ressource comme affichée
    currentSet.add(url);
}

// Fonction pour récupérer les ressources disponibles en fonction du type actuel
function getAvailableResources() {
    let availableResources;

    // Sélectionne les ressources disponibles en fonction du type
    if (messageType === "une musique") {
        availableResources = musiqueUrls.filter(url => !displayedResources.musique.has(url));
    } else if (messageType === "une video") {
        availableResources = videoUrls.filter(url => !displayedResources.video.has(url));
    } else if (messageType === "un article") {
        availableResources = articleUrls.filter(url => !displayedResources.article.has(url));
    } else if (messageType === "un jeux") {
        availableResources = jeuxUrls.filter(url => !displayedResources.jeux.has(url));
    }

    // Si toutes les ressources ont été affichées au moins une fois, réinitialiser le set
    if (availableResources && availableResources.length === 0) {
        resetDisplayedResources();
        // Récupère à nouveau les ressources disponibles après la réinitialisation
        availableResources = getAvailableResources();
    }

    return availableResources;
}

// Écouteur d'événement pour détecter la création de nouvelles fenêtres
chrome.windows.onCreated.addListener(function (window) {
    // Vérifiez si la nouvelle fenêtre est une fenêtre popup (type 'popup')
    if (window.type === 'popup') {
        // Stockez l'ID de la nouvelle fenêtre popup
        newPopupWindowId = window.id;
    }
});

// Fonction pour obtenir l'URL de la ressource actuellement affichée
function getCurrentResourceUrl(callback) {
    // Utilise les API de l'extension Chrome pour obtenir l'URL actuel
    chrome.tabs.query({ active: true, windowId: newPopupWindowId }, function (tabs) {
        const currentUrl = tabs[0].url;
        console.log('Current URL:', currentUrl);
        callback(currentUrl);
    });
}

// Fonction pour ouvrir une fenêtre avec une URL spécifiée
function openWindow(url, height, width) {
    const left = Math.floor(Math.random() * (screen.width - width));
    const top = Math.floor(Math.random() * (screen.height - height));

    // Si le top est dans la partie haute de l'écran, ajustez-le
    const adjustedTop = top < screen.height / 4 ? screen.height / 4 : top;

    chrome.windows.create({
        url,
        type: 'popup',
        width,
        height,
        left,
        top: adjustedTop,
    }, function (window) {
        currentWindow = window;
    });
    console.log(url)
}