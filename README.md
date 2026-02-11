# Azure DevOps Pastel Colors

Script pour transformer les couleurs agressives des workitems Azure DevOps en teintes pastel plus agréables.

## Fonctionnalités

- **Conversion dynamique** : Transforme automatiquement toutes les couleurs personnalisées en versions pastel
- **Sans modification du contenu** : Seule l'apparence visuelle change, pas les données des workitems
- **Détection automatique** : Identifie les workitems avec couleurs personnalisées uniquement (les couleurs par défaut restent inchangées)
- **Réglage fin** : Paramètres optimisés (70% saturation, +15% luminosité) pour un équilibre parfait

## Installation Rapide (Méthode Console)

**Si Tampermonkey ne fonctionne pas sur votre navigateur**, utilisez cette méthode simple :

1. **Allez sur votre Board Azure DevOps**
2. **Ouvrez la console** (F12 → Console)
3. **Copiez-collez le script** ci-dessous et appuyez sur Entrée :

```javascript
// Azure DevOps Pastel Colors - Version Console
(function() {
    const SATURATION = 0.70;    // 70% = équilibre parfait
    const LUMINOSITE = 0.15;    // +15% = légèrement plus clair
    
    console.log(`🎨 Azure Pastel: Saturation ${SATURATION*100}%, Luminosité +${LUMINOSITE*100}%`);
    let modified = 0;
    
    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: h || 0, s: s || 0, l };
    }
    
    function hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }
    
    document.querySelectorAll('.wit-card').forEach(el => {
        const bg = getComputedStyle(el).backgroundColor;
        if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') return;
        const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return;
        const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
        if (r === g && g === b && r > 200) return;
        const hsl = rgbToHsl(r, g, b);
        hsl.s = hsl.s * SATURATION;
        hsl.l = Math.min(hsl.l + LUMINOSITE, 0.9);
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        el.style.setProperty('background-color', `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'important');
        modified++;
    });
    
    console.log(`✅ ${modified} workitem(s) modifié(s)`);
})();
```

### Personnaliser les couleurs

Vous pouvez ajuster l'intensité des couleurs en modifiant les 2 lignes en haut du script :

```javascript
const SATURATION = 0.70;  // 0.3 = très fade, 0.5 = moyen, 0.8 = vif, 1.0 = original
const LUMINOSITE = 0.15;  // 0.0 = pas de changement, 0.3 = beaucoup plus clair
```

**Valeurs recommandées :**
- **Très pastel** : `SATURATION = 0.5`, `LUMINOSITE = 0.25`
- **Équilibré (par défaut)** : `SATURATION = 0.7`, `LUMINOSITE = 0.15`
- **Légèrement adouci** : `SATURATION = 0.85`, `LUMINOSITE = 0.08`

### Créer un favori (Bookmarklet)

Pour réutiliser le script facilement :

1. Créez un nouveau favori dans votre navigateur
2. **Nom** : `Azure Pastel`
3. **URL** : Copiez le script ci-dessus et préfixez-le par `javascript:` (sans espace)

Exemple :
```javascript
javascript:(function(){const SATURATION=0.70;const LUMINOSITE=0.15;console.log(`🎨 Azure Pastel: Saturation ${SATURATION*100}%, Luminosité +${LUMINOSITE*100}%`);let modified=0;function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h,s,l=(max+min)/2;if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break}}return{h:h||0,s:s||0,l}}function hslToRgb(h,s,l){let r,g,b;if(s===0){r=g=b=l}else{const hue2rgb=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p};const q=l<0.5?l*(1+s):l+s-l*s;const p=2*l-q;r=hue2rgb(p,q,h+1/3);g=hue2rgb(p,q,h);b=hue2rgb(p,q,h-1/3)}return{r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)}}document.querySelectorAll('.wit-card').forEach(el=>{const bg=getComputedStyle(el).backgroundColor;if(!bg||bg==='rgba(0, 0, 0, 0)'||bg==='transparent')return;const match=bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);if(!match)return;const r=parseInt(match[1]),g=parseInt(match[2]),b=parseInt(match[3]);if(r===g&&g===b&&r>200)return;const hsl=rgbToHsl(r,g,b);hsl.s=hsl.s*SATURATION;hsl.l=Math.min(hsl.l+LUMINOSITE,0.9);const rgb=hslToRgb(hsl.h,hsl.s,hsl.l);el.style.setProperty('background-color',`rgb(${rgb.r},${rgb.g},${rgb.b})`,'important');modified++});console.log(`✅ ${modified} workitem(s) modifié(s)`)})();
```

## Installation Alternative (Tampermonkey)

**Note :** Si la méthode console ci-dessus fonctionne, cette étape est optionnelle.

1. Installez l'extension **Tampermonkey** :
   - [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox](https://addons.mozilla.org/fr/firefox/addon/tampermonkey/)
   - [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

2. Installez le script depuis :
```
https://raw.githubusercontent.com/PierreOudin/azure-pastel-colors-script/main/azure-devops-pastel.user.js
```

## Fonctionnement Technique

### Algorithme de Conversion HSL

Le script utilise l'espace de couleurs **HSL** (Teinte, Saturation, Luminosité) :

1. **Extraction** : Récupère la couleur RGB du workitem
2. **Conversion** : RGB → HSL
3. **Transformation** :
   - Saturation × 0.7 (70% de la saturation originale)
   - Luminosité + 15% (légèrement plus clair)
4. **Reconversion** : HSL → RGB
5. **Application** : Nouvelle couleur appliquée au workitem

### Détection des Couleurs

Les workitems sont identifiés par la classe CSS `.wit-card`. Les couleurs par défaut (blancs, gris clairs) sont automatiquement ignorées.

## Résolution de Problèmes

### Aucune couleur modifiée

Si vous voyez `✅ 0 workitem(s) modifié(s)` :

1. **Vérifiez que vous êtes sur un Board** (pas sur la liste des workitems)
2. **Vérifiez que vos workitems ont des couleurs** :
   - Faites clic droit sur un workitem → Inspecter
   - Cherchez `background-color` dans les styles
3. **Testez les sélecteurs** dans la console :
   ```javascript
   document.querySelectorAll('.wit-card').length
   ```
   Si ça retourne 0, le sélecteur ne correspond pas à votre Board.

### Les couleurs ne sont pas assez/m trop pastel

Modifiez les paramètres `SATURATION` et `LUMINOSITE` en haut du script :
- **Plus de couleur** : Augmentez `SATURATION` (0.8 → 0.9)
- **Moins de couleur** : Diminuez `SATURATION` (0.7 → 0.5)
- **Plus clair** : Augmentez `LUMINOSITE` (0.15 → 0.25)
- **Moins clair** : Diminuez `LUMINOSITE` (0.15 → 0.08)

## Changelog

### v1.0
- Première version fonctionnelle
- Algorithme HSL avec réglage fin (70% saturation, +15% luminosité)
- Détection automatique via sélecteur `.wit-card`
- Documentation complète avec méthode console (bookmarklet)

## Licence

MIT License - Libre d'utilisation et de modification.
