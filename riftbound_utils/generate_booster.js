const fs = require('fs');

module.exports = function (set_id = 'ogn') {
    const cardDatabase = JSON.parse(fs.readFileSync('./riftbound_utils/datas/' + set_id + '.json'))

    // Fonction utilitaire pour obtenir une carte aléatoire d'une rareté précise
    function getRandomCardByRarity(rarity) {
        const pool = cardDatabase[rarity];
        if (!pool || pool.length === 0) return { name: `Placeholder ${rarity}` };
        const randomIndex = Math.floor(Math.random() * pool.length);
        const card = pool[randomIndex];
        return {
            name: card.name,
            rarity: card.classification.rarity,
            image: card.media.image_url
        };
    }

    // Fonction maîtresse : Déterminer la rareté du slot "Rare / Spécial" selon les pull rates
    function rollSpecialSlotRarity() {
        const roll = Math.random(); // Génère un nombre entre 0 et 1

        // Signature / Très Rare (1/720)
        if (roll < (1 / 720)) return "signature";
        // Overnumbered / Showcase (1/72)
        if (roll < (1 / 72)) return "overnumbered";
        // Alternate Art (1/11 en moyenne)
        if (roll < (1 / 11)) return "alt";
        // Epic (1/4)
        if (roll < (1 / 4)) return "epic";
        // Par défaut, c'est une Rare classique
        return "rare";
    }

    function rollFoilSlotRarity() {
        const roll = Math.random();

        if (roll < (25.08 / 100))
            return "uncommon"
        if (roll < (12 / 100))
            return "rare"
        if (roll < (4.3 / 100))
            return "epic"

        return "common";
    }

    const booster = {
        hasAltRune: false,
        commons: [],
        uncommons: [],
        foil: undefined,
        rareOrBetter: []
    };

    // TODO - Générer chance pour avoir rune alternative ou non
    if (Math.random() < (3 / 100)) {
        booster.hasAltRune = true;
    }

    for (let i = 0; i < 7; i++) {
        booster.commons.push({ ...getRandomCardByRarity("common")});
    }

    for (let i = 0; i < 3; i++) {
        booster.uncommons.push({ ...getRandomCardByRarity("uncommon")});
    }

    const foilRarity = rollFoilSlotRarity();
    booster.foil = { ...getRandomCardByRarity(foilRarity)};


    for (let i = 0; i < 2; i++) {
        const specialRarity = rollSpecialSlotRarity();
        booster.rareOrBetter.push({ ...getRandomCardByRarity(specialRarity)});
    }

    return booster;

}