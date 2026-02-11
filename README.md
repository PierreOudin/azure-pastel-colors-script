# Azure DevOps Pastel Colors

Script Tampermonkey pour transformer les couleurs agressives des workitems Azure DevOps en teintes pastel plus agréables.

## Fonctionnalités

- **Conversion dynamique** : Transforme automatiquement toutes les couleurs personnalisées en versions pastel
- **4 Presets** : Choisissez l'intensité qui vous convient (Vif, Léger, Moyen, Intense)
- **Changement de preset instantané** : Passez d'un style à l'autre sans recharger la page
- **Sans modification du contenu** : Seule l'apparence visuelle change, pas les données des workitems
- **Détection automatique** : Identifie les workitems avec couleurs personnalisées uniquement (les couleurs par défaut restent inchangées)
- **Réinitialisation propre** : Bouton pour restaurer les couleurs originales

## Installation

### 1. Installer Tampermonkey

Installez l'extension **Tampermonkey** sur votre navigateur :
- [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox](https://addons.mozilla.org/fr/firefox/addon/tampermonkey/)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### 2. Installer le script

Cliquez sur ce lien pour installer directement :
```
https://raw.githubusercontent.com/PierreOudin/azure-pastel-colors-script/main/azure-devops-pastel.user.js
```

Tampermonkey détectera automatiquement et proposera l'installation.

## Utilisation

### Changer de preset

Une fois sur votre Board Azure DevOps :

1. **Cliquez sur l'icône 🐒 Tampermonkey** dans votre barre d'outils
2. **Sélectionnez un preset** :
   - 🎨 **Pastel Vif (85%)** - Couleurs presque originales, légèrement adoucies
   - 🎨 **Pastel Léger (70%)** - Équilibre parfait (présélectionné)
   - 🎨 **Pastel Moyen (50%)** - Pastel équilibré
   - 🎨 **Pastel Intense (35%)** - Très pastel

Le changement est instantané !

### Autres commandes

- **🔄 Réappliquer** : Force la réapplication immédiate (utile si des workitems n'ont pas été détectés)
- **🧹 Réinitialiser** : Restaure les couleurs originales

## Fonctionnement

### Algorithme HSL

Le script utilise l'espace de couleurs **HSL** (Teinte, Saturation, Luminosité) :

1. **Extraction** : Récupère la couleur RGB du workitem
2. **Conversion** : RGB → HSL
3. **Transformation** selon le preset choisi :
   - Saturation × facteur (35% à 85% selon le preset)
   - Luminosité + boost (10% à 35% selon le preset)
4. **Reconversion** : HSL → RGB
5. **Application** : Nouvelle couleur appliquée au workitem

### Stockage intelligent

- La **couleur originale** est stockée pour chaque workitem modifié
- Permet de **changer de preset** sans dégrader les couleurs
- La **réinitialisation** restaure les vraies couleurs d'origine

## Résolution de problèmes

### Les couleurs ne changent pas

1. **Vérifiez que vous êtes sur un Board** (pas sur la liste des workitems)
2. **Vérifiez que vos workitems ont des couleurs personnalisées** :
   - Faites clic droit sur un workitem coloré → Inspecter
   - Cherchez `background-color` dans les styles calculés
3. **Testez dans la console** :
   ```javascript
   document.querySelectorAll('.wit-card').length
   ```
   Si ça retourne 0, le sélecteur ne correspond pas à votre Board. Ouvrez une issue avec votre URL.

### Les couleurs deviennent grises quand je change de preset

C'est corrigé dans la v1.1 ! Mettez à jour le script :
- Tableau de bord Tampermonkey
- Clic droit sur "Azure DevOps Pastel Colors" → "Rechercher une mise à jour"

### Réinitialiser affiche du noir

C'est corrigé dans la v1.1 ! Le bouton "🧹 Réinitialiser" restaure maintenant correctement les couleurs originales.

## Changelog

### v1.1
- ✅ **Correction** : Plus de re-traitement des workitems déjà modifiés
- ✅ **Correction** : Stockage de la couleur originale pour permettre le changement de preset
- ✅ **Correction** : Réinitialisation restaure les vraies couleurs originales (plus de noir)
- ✅ **Amélioration** : 4 presets optimisés (Vif 85%, Léger 70%, Moyen 50%, Intense 35%)
- ✅ **Amélioration** : Preset par défaut sur "Léger" (votre préférence)
- ✅ **Simplification** : Code allégé et plus stable

### v1.0
- Première version
- 3 presets de base
- Détection automatique des couleurs personnalisées
- Menu Tampermonkey

## Licence

MIT License - Libre d'utilisation et de modification.

---

**Profitez de vos couleurs pastel sur Azure DevOps !** 🎨
