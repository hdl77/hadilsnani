// server/services/calculTonnage.js

/**
 * Calcule le tonnage total des produits pour une liste de produits donnée.
 * Cette fonction convertit les poids/volumes en grammes, puis en tonnes.
 *
 * @param {Array<Object>} listeProduitsACalculer - Tableau d'objets, où chaque objet contient:
 * - `productId`: ID du produit (string).
 * - `quantity`: Quantité de ce produit (number).
 * @param {Array<Object>} tousLesProduitsDisponibles - Tableau complet de tous les produits depuis la base de données, où chaque objet contient:
 * - `_id`: ID du produit (string).
 * - `name`: Nom du produit (string).
 * - `weight`: Poids ou volume du produit (number).
 * - `unite`: Unité du poids/volume ('g', 'gr', 'kg', 'L', 'ml', 'cl', etc.) (string).
 * @returns {number} Le tonnage total calculé en tonnes. Retourne 0 si aucune donnée valide n'est trouvée.
 */
export const calculerTonnageClient = (listeProduitsACalculer, tousLesProduitsDisponibles) => {
    let poidsTotalGrammes = 0;

    if (!Array.isArray(listeProduitsACalculer) || !Array.isArray(tousLesProduitsDisponibles)) {
        console.error("Erreur: Les entrées de 'calculerTonnageClient' doivent être des tableaux.");
        return 0;
    }

    for (const produitClient of listeProduitsACalculer) {
        const detailsProduit = tousLesProduitsDisponibles.find(p => p._id.toString() === produitClient.productId);

        if (detailsProduit) {
            let poidsBase = detailsProduit.weight;
            let unite = detailsProduit.unite ? detailsProduit.unite.toLowerCase() : '';
            let poidsUnitaireGrammes = 0;

            switch (unite) {
                case 'g':
                case 'gr':
                    poidsUnitaireGrammes = poidsBase;
                    break;
                case 'kg':
                    poidsUnitaireGrammes = poidsBase * 1000;
                    break;
                case 'tonnes':
                    poidsUnitaireGrammes = poidsBase * 1000 * 1000; // Convert tonnes to grams
                    break;
                case 'l': // Pour les litres, supposant une densité de 1g/ml (comme l'eau)
                    poidsUnitaireGrammes = poidsBase * 1000; // 1L = 1000ml = 1000g = 1kg
                    break;
                case 'ml': // Pour les millilitres, supposant une densité de 1g/ml
                    poidsUnitaireGrammes = poidsBase; // 1 ml = 1g
                    break;
                case 'cl': // Pour les centilitres, supposant une densité de 1g/ml
                    poidsUnitaireGrammes = poidsBase * 10; // 1 cl = 10 ml = 10g
                    break;
                default:
                    console.warn(`Unité de poids/volume inconnue pour le produit "${detailsProduit.name}" (ID: ${detailsProduit._id}, Unité: ${detailsProduit.unite}). Le poids ne sera pas inclus dans le calcul du tonnage.`);
                    poidsUnitaireGrammes = 0; // Ne pas ajouter de poids si l'unité est inconnue
                    break;
            }

            // Ajouter le poids total de ce produit (poids unitaire * quantité)
            poidsTotalGrammes += poidsUnitaireGrammes * produitClient.quantity;
        } else {
            console.warn(`Produit avec l'ID "${produitClient.productId}" non trouvé dans la base de données. Il sera ignoré pour le calcul du tonnage.`);
        }
    }

    // Convertir le total des grammes en tonnes (1 tonne = 1 000 000 grammes)
    return poidsTotalGrammes / 1000000;
};