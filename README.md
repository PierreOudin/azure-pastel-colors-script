# Azure DevOps Pastel Colors

Script Tampermonkey pour transformer les couleurs agressives des workitems Azure DevOps en teintes pastel plus agréables.

## Fonctionnalités

- **Conversion dynamique** : Transforme automatiquement toutes les couleurs personnalisées en versions pastel
- **3 Presets** : Choisissez l'intensité pastel qui vous convient
- **Sans modification du contenu** : Seule l'apparence visuelle change, pas les données des workitems
- **Détection automatique** : Identifie les workitems avec couleurs personnalisées uniquement (les couleurs par défaut restent inchangées)
- **Sélecteurs robustes** : Détection via multiple stratégies pour s'adapter aux changements d'interface
- **Gestion d'erreurs** : Try-catch global et gestion gracieuse des erreurs individuelles
- **Mode debug** : Option pour activer les logs détaillés
- **Intervalle adaptatif** : Vérifications fréquentes au démarrage, puis espacées pour les performances
- **Réinitialisation propre** : Possibilité de réinitialiser les styles modifiés

## Installation

### 1. Installer Tampermonkey

1. Installez l'extension **Tampermonkey** sur votre navigateur :
   - [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox](https://addons.mozilla.org/fr/firefox/addon/tampermonkey/)
   - [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### 2. Installer le script

**Option A : Installation automatique (recommandée)**

Cliquez sur ce lien pour installer directement :
```
https://raw.githubusercontent.com/PierreOudin/azure-pastel-colors-script/main/azure-devops-pastel.user.js
```

Tampermonkey devrait détecter automatiquement et proposer l'installation.

**Option B : Installation manuelle**

1. Ouvrez le tableau de bord Tampermonkey (icône dans la barre d'outils → Tableau de bord)
2. Cliquez sur l'onglet **"Utilitaires"**
3. Dans la section "URL", collez :
   ```
   https://raw.githubusercontent.com/PierreOudin/azure-pastel-colors-script/main/azure-devops-pastel.user.js
   ```
4. Cliquez sur **"Importer"**
5. Cliquez sur **"Installer"**

## Utilisation

### Accéder aux options

Une fois installé, cliquez sur l'icône 🐒 Tampermonkey dans votre barre d'outils lorsque vous êtes sur un Board Azure DevOps. Vous verrez un menu avec les options suivantes :

**Presets :**
- **🎨 Pastel Léger** - Saturation réduite à 60%, luminosité +20%
- **🎨 Pastel Moyen** - Saturation réduite à 40%, luminosité +30% (défaut)
- **🎨 Pastel Intense** - Saturation réduite à 30%, luminosité +40%

**Actions :**
- **ℹ️ Preset actuel** - Affiche le preset actif et ses paramètres
- **🔄 Réappliquer couleurs** - Force la réapplication immédiate
- **🧹 Réinitialiser styles** - Supprime les modifications et restaure les couleurs originales
- **🐛 Mode debug** - Active/désactive les logs détaillés dans la console

### Comment ça marche

Le script détecte automatiquement :
1. Les **couleurs par défaut** d'Azure DevOps (blanc, gris clair) → **Ne sont pas modifiées**
2. Les **couleurs personnalisées** via les règles de template → **Transformées en pastel**

### Vérification du fonctionnement

Ouvrez la console du navigateur (F12 → Console) pour voir les messages :
- `Azure Pastel Theme: Script chargé avec succès!`
- `Azure Pastel Theme: X workitem(s) modifié(s)`

## Fonctionnement technique

### Algorithme de conversion

Le script utilise l'espace de couleurs **HSL** (Teinte, Saturation, Luminosité) :

1. **Extraction** : Récupère la couleur RGB du workitem
2. **Conversion** : RGB → HSL
3. **Transformation** :
   - Saturation × facteur (0.3 à 0.6 selon le preset)
   - Luminosité + boost (0.2 à 0.4 selon le preset)
4. **Reconversion** : HSL → RGB → Hexadécimal
5. **Application** : Nouvelle couleur appliquée au workitem

### Préservation des couleurs par défaut

Les couleurs suivantes sont automatiquement ignorées :
- **Blancs** : `#ffffff`, `#f5f5f5`, `#fafafa`, `#f8f8f8`
- **Gris clairs** : `#f0f0f0`, `#ebebeb`, `#e8e8e8`, `#e5e5e5`, `#e0e0e0`, `#ddd`, `#cccccc`
- **Transparents** : `transparent`, `rgba(0,0,0,0)`, `rgba(255,255,255,0)`
- **Valeurs CSS** : `inherit`, `initial`, `unset`
- **Gris détectés automatiquement** : Toutes les couleurs où R=G=B avec luminosité > 200

## Commandes du menu Tampermonkey

### Changer de preset
Cliquez sur 🎨 **Pastel Léger**, 🎨 **Pastel Moyen** ou 🎨 **Pastel Intense** pour appliquer immédiatement le style souhaité. Le preset est sauvegardé automatiquement.

### Vérifier le preset actif
Cliquez sur ℹ️ **Preset actuel** pour voir quel preset est actif et ses paramètres exacts (saturation et luminosité).

### Forcer la réapplication
Si les couleurs ne semblent pas s'appliquer correctement, cliquez sur 🔄 **Réappliquer couleurs** pour forcer une nouvelle passe.

### Réinitialiser les styles
Pour revenir aux couleurs originales sans désinstaller le script, cliquez sur 🧹 **Réinitialiser styles**. Cette option est utile pour :
- Tester les couleurs d'origine
- Résoudre des conflits visuels
- Désactiver temporairement le script

### Mode debug
Pour activer les logs détaillés dans la console du navigateur (F12) :
1. Cliquez sur 🐛 **Mode debug: OFF** pour l'activer
2. La page se rechargera automatiquement
3. Ouvrez la console (F12 → Console) pour voir les messages détaillés
4. Revenez au mode normal en cliquant à nouveau sur le menu (qui affichera maintenant 🐛 **Mode debug: ON**)

## Résolution de problèmes

### Aucune couleur modifiée

Si la console affiche :
```
Azure Pastel Theme: Aucune couleur personnalisée détectée
```

**Vérifiez que :**
1. Vous êtes bien sur un Board Azure DevOps (pas sur une autre page)
2. Vos workitems ont des couleurs personnalisées via des règles de template
3. Les règles de template sont bien actives et appliquent des couleurs

### Le script ne fonctionne plus après une mise à jour Azure DevOps

Le script utilise **plusieurs stratégies de détection** pour s'adapter aux changements d'interface. Cependant, si vous constatez des problèmes après une mise à jour :

1. **Essayez d'abord** : Cliquez sur 🧹 **Réinitialiser styles** puis 🔄 **Réappliquer couleurs**
2. Activez le 🐛 **Mode debug** et vérifiez la console (F12)
3. Si le problème persiste, créez une issue sur GitHub avec :
   - La description du problème
   - Les messages de la console
   - Le preset utilisé
   - La version d'Azure DevOps (si connue)

### Performances

Le script utilise un **intervalle adaptatif** pour minimiser l'impact sur les performances :
- **Au démarrage** : Vérifie toutes les 2 secondes (10 vérifications)
- **Ensuite** : Passe à une vérification toutes les 10 secondes

Cette approche garantit une détection rapide des changements initiaux tout en réduisant la charge CPU à long terme.

### Conflits avec d'autres extensions

Si vous utilisez d'autres extensions qui modifient Azure DevOps (Dark Reader, Stylish, etc.) :

1. **Ordre d'exécution** : Le script utilise `!important` sur les styles pour avoir la priorité
2. **Réinitialisation** : Utilisez 🧹 **Réinitialiser styles** pour nettoyer les conflits
3. **Isolation** : Le script ne modifie que les éléments spécifiques aux workitems colorés

### Préférences non sauvegardées

Le preset sélectionné est sauvegardé automatiquement via Tampermonkey. Si vos préférences ne persistent pas :

1. Vérifiez que Tampermonkey a les permissions de stockage
2. Essayez de réinstaller le script

## Mises à jour

Le script se met à jour automatiquement via Tampermonkey si vous l'avez installé depuis l'URL GitHub.

Pour forcer une mise à jour manuelle :
1. Tableau de bord Tampermonkey
2. Trouvez "Azure DevOps Pastel Colors"
3. Clic droit → "Rechercher une mise à jour"

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir une issue pour signaler un bug
- Proposer des améliorations
- Soumettre une pull request

## Licence

MIT License - Libre d'utilisation et de modification.

## Changelog

### v1.0
- Première version
- 3 presets pastel (Léger, Moyen, Intense)
- Détection automatique des couleurs personnalisées
- Menu Tampermonkey pour changer de preset
- Observer DOM pour les boards dynamiques
- **Corrections apportées** :
  - Sélecteurs CSS multiples et robustes
  - Gestion d'erreurs complète (try-catch global)
  - Détection étendue des couleurs par défaut (gris auto-détectés)
  - Utilisation de `!important` pour éviter les conflits CSS
  - Validation des presets avec fallback
  - Mode debug optionnel
  - Intervalle adaptatif (2s → 10s) pour les performances
  - Fonction de réinitialisation propre
  - Nettoyage à la désinstallation
