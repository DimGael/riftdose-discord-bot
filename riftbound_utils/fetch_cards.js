const axios = require('axios');
const fs = require('fs');

const api = axios.create({
  baseURL: 'https://api.riftcodex.com',
  timeout: 20000,
  headers: { 'Accept': 'application/json' }
});

function keepsKeysInArray(data, keys) {
  const formattedData = {};

  keys.forEach(key => {
    if (key.name)
      formattedData[key.name] = keepsKeysInArray(data[key.name], key.keys)
    else 
      formattedData[key] = data[key];
  });

  return formattedData;
}

function fileNeedsUpdate(filepath) {
  if (!fs.existsSync(filepath)) 
    return true;
  let creationDate = new Date(JSON.parse(fs.readFileSync(filepath)).creationDate);
  let today = new Date();
  let diff = (creationDate.getFullYear() - today.getFullYear())*12 + (creationDate.getMonth() - today.getMonth());
  if (diff <= -1)
    return true;
  else
    return false;
}

module.exports = async function (set_id = 'ogn', onlyIfOutdated = true) {
  try {
    let filePath = './riftbound_utils/datas/' + set_id + '.json';

    if (fs.existsSync(filePath) && (onlyIfOutdated && !fileNeedsUpdate(filePath))) {
      console.log("Données déjà chargées pour le set '" + set_id + "'. Utilisation de ces données")
      return;
    }

    console.log("Récupération des cartes du set " + set_id + " ...")

    let page = 1;
    let numberOfPages = 100;

    const mappedResult = {
      runes: {
        alt: [],
        common: []
      },
      signature: [],
      overnumbered: [],
      alt: [],
      epic: [],
      rare: [],
      uncommon: [],
      common: [],
    };

    while (page <= numberOfPages) {
      const response = await api.get('/cards', {
        params: {
          set_id,
          size: 30,
          page
        }
      });

      numberOfPages = response.data.pages;
      console.log("["+set_id+"] Page " + page + " sur " + numberOfPages)

      const KEYS_TO_KEEP = [
        "id",
        "riftbound_id",
        "name",
        { name: "classification", keys: ["type", "rarity"] },
        { name: "media", keys: ["image_url"] },
        { name: "metadata", keys: ["alternate_art", "overnumbered", "signature"] }
      ];

      response.data.items.forEach(function (card) {
        if (card.classification.type === "Rune") {
          if (card.classification.rarity === "Showcase")
            mappedResult.runes.alt.push(keepsKeysInArray(card, KEYS_TO_KEEP));
          else 
            mappedResult.runes.common.push(keepsKeysInArray(card, KEYS_TO_KEEP));
        }
        else if (card.metadata.signature) 
          mappedResult.signature.push(keepsKeysInArray(card, KEYS_TO_KEEP));
        else if (card.metadata.overnumbered) 
          mappedResult.overnumbered.push(keepsKeysInArray(card, KEYS_TO_KEEP));
        else if (card.metadata.alternate_art) 
          mappedResult.alt.push(keepsKeysInArray(card, KEYS_TO_KEEP));
        else if (card.classification.rarity === "Epic")
          mappedResult.epic.push(keepsKeysInArray(card, KEYS_TO_KEEP));
        else if (card.classification.rarity === "Rare")
          mappedResult.rare.push(keepsKeysInArray(card, KEYS_TO_KEEP));
        else if (card.classification.rarity === "Uncommon")
          mappedResult.uncommon.push(keepsKeysInArray(card, KEYS_TO_KEEP));
        else if (card.classification.rarity === "Common")
          mappedResult.common.push(keepsKeysInArray(card, KEYS_TO_KEEP));
        else
          console.error("Don't know where to put this card", card)
      });

      page++;
    };

    mappedResult.creationDate = new Date();
    fs.writeFileSync(filePath, JSON.stringify(mappedResult, null, 2), 'utf8', (err) => {
      if (err) {
        console.error("Erreur :", err);
        return;
      }
      console.log("Données sauvegardées !");
    });

    console.log("Done ! File created : " + './riftbound_api/datas/' + set_id + '.json')

  } catch (error) {
    console.error('\n❌ Échec de la requête :');
    if (error.response) {

      console.error(`Statut : ${error.response.status}`);
      console.error('Message :', error.response.data);
    } else if (error.request) {
      console.error('Aucune réponse reçue du serveur. Vérifiez l\'URL ou votre connexion.');
    } else {
      console.error(error);
    }
  }
}

