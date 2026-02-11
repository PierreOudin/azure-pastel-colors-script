# Azure DevOps Pastel Colors

Script Tampermonkey pour transformer les couleurs agressives des workitems Azure DevOps en teintes pastel plus agréables.

## Fonctionnalités

- **Dropdown intégrée** : Menu de sélection directement dans les onglets Azure DevOps (Board/Analytics...)
- **4 Presets** : Choisissez l'intensité qui vous convient (Vif, Léger, Moyen, Intense)
- **Adaptation au thème** : Les couleurs de l'interface s'adaptent automatiquement au thème Azure DevOps (clair, sombre, etc.)
- **Changement de preset instantané** : Passez d'un style à l'autre sans recharger la page
- **Sans modification du contenu** : Seule l'apparence visuelle change, pas les données des workitems
- **Détection automatique** : Identifie les workitems avec couleurs personnalisées uniquement
- **Réinitialisation propre** : Restaure les vraies couleurs originales

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

Une fois sur votre Board Azure DevOps, vous verrez un nouveau menu dans les onglets :

```
Board | Analytics | Feature Timeline | Epic Roadmap | 🎨 Pastel: [Léger ▼]
```

**Sélectionnez un preset** :
- 🎨 **Vif** - Couleurs presque originales, légèrement adoucies (85%)
- 🎨 **Léger** - Équilibre parfait (70%) ← **Présélectionné**
- 🎨 **Moyen** - Pastel équilibré (50%)
- 🎨 **Intense** - Très pastel (35%)
- **—** - Désactiver / Réinitialiser

Le changement est **instantané** !

### Menu Tampermonkey (backup)

Si la dropdown ne s'affiche pas, utilisez le menu Tampermonkey (icône 🐒) :
- 🎨 Vif / Léger / Moyen / Intense
- 🔄 Réappliquer
- 🧹 Réinitialiser

## Fonctionnement

### Algorithme HSL

Le script utilise l'espace de couleurs **HSL** (Teinte, Saturation, Luminosité) :

1. **Extraction** : Récupère la couleur RGB du workitem
2. **Conversion** : RGB → HSL
3. **Transformation** selon le preset choisi :
   - Saturation × facteur (35% à 85%)
   - Luminosité + boost (10% à 35%)
4. **Reconversion** : HSL → RGB
5. **Application** : Nouvelle couleur appliquée

### Stockage intelligent

- La **couleur originale** est stockée pour chaque workitem
- Permet de **changer de preset** sans dégrader les couleurs
- La **réinitialisation** restaure les vraies couleurs d'origine

## Résolution de problèmes

### La dropdown n'apparaît pas

1. **Rechargez la page** (F5)
2. **Vérifiez la console** (F12) pour les erreurs
3. Le script attend 2 secondes que la page charge - patientez
4. Utilisez le **menu Tampermonkey** en attendant

### Les couleurs ne changent pas

1. **Vérifiez que vous êtes sur un Board** (pas sur la liste)
2. **Vérifiez que vos workitems ont des couleurs** :
   - Clic droit sur un workitem → Inspecter
   - Cherchez `background-color` dans les styles
3. **Testez dans la console** :
   ```javascript
   document.querySelectorAll('.wit-card').length
   ```
   Si ça retourne 0, ouvrez une issue avec votre URL.

### Problèmes de visibilité (thème sombre)

La dropdown s'adapte automatiquement au thème Azure DevOps. Si vous avez des problèmes de contraste :
- Assurez-vous d'avoir la **dernière version** du script
- Le style hérite des couleurs du thème actif

## Changelog

### v1.9
- ✅ **Dropdown simplifiée** : Select HTML basique qui fonctionne avec tous les thèmes
- ✅ **Adaptation thème** : Pas de couleurs forcées, hérite du thème Azure DevOps
- ✅ **Correction** : Dropdown s'ouvre correctement

### v1.8
- ✅ **Dropdown native** : Tentative d'utilisation des classes Azure DevOps (bolt-*)

### v1.1 - v1.7
- ✅ Dropdown intégrée aux onglets
- ✅ Correction du re-traitement des couleurs
- ✅ Stockage des couleurs originales
- ✅ Réinitialisation propre
- ✅ 4 presets optimisés

### v1.0
- Première version
- 3 presets de base
- Menu Tampermonkey uniquement

## Licence

MIT License - Libre d'utilisation et de modification.

---

**Profitez de vos couleurs pastel sur Azure DevOps !** 🎨
