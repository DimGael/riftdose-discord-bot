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
    if (key.name) {
      formattedData[key.name] = keepsKeysInArray(data[key.name], key.keys)
    } else {
      formattedData[key] = data[key];
    }
  });

  return formattedData;
}

module.exports = async function (set_id = 'ogn') {
  try {
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

    fs.writeFileSync('./riftbound_utils/datas/' + set_id + '.json', JSON.stringify(mappedResult, null, 2), 'utf8', (err) => {
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

