// ==UserScript==
// @name         Azure DevOps Pastel Colors
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Transforme les couleurs agressives des workitems Azure DevOps en teintes pastel
// @author       PierreOudin
// @match        https://dev.azure.com/*
// @match        https://*.visualstudio.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Log immédiat pour vérifier que le script s'exécute
    console.log('🎨 Azure Pastel Theme: Script démarré - URL:', window.location.href);

    // Gestionnaire d'erreurs global
    window.addEventListener('error', function(e) {
        console.error('Azure Pastel Theme: Erreur détectée', e.message);
    });

    try {
        console.log('🎨 Azure Pastel Theme: Initialisation...');
        // Initialisation des variables globales
        window.azurePastelDebug = GM_getValue('azurePastelDebug', false);
        window.azurePastelAttempts = 0;

        // Configuration des presets
        const PRESETS = {
            'pastel-leger': { saturationFactor: 0.6, lightnessBoost: 0.2, name: 'Pastel Léger' },
            'pastel-moyen': { saturationFactor: 0.4, lightnessBoost: 0.3, name: 'Pastel Moyen' },
            'pastel-intense': { saturationFactor: 0.3, lightnessBoost: 0.4, name: 'Pastel Intense' }
        };

        // Validation du preset
        let currentPreset = GM_getValue('currentPreset', 'pastel-moyen');
        if (!PRESETS[currentPreset]) {
            console.warn('Azure Pastel Theme: Preset invalide détecté, utilisation du preset par défaut');
            currentPreset = 'pastel-moyen';
            GM_setValue('currentPreset', currentPreset);
        }

        // Couleurs par défaut Azure DevOps à ignorer (liste étendue)
        const DEFAULT_COLORS = [
            '#ffffff', '#f5f5f5', '#fafafa', '#f8f8f8',  // Blancs/Gris très clairs
            '#f0f0f0', '#ebebeb', '#e8e8e8', '#e5e5e5',  // Gris clairs
            '#e0e0e0', '#ddd', '#ddd', '#cccccc',         // Gris
            'transparent', 'rgba(0,0,0,0)', 'rgba(255,255,255,0)', // Transparents
            'inherit', 'initial', 'unset'                 // Valeurs CSS spéciales
        ];

    /**
     * Convertit RGB en HSL
     */
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return { h, s, l };
    }

    /**
     * Convertit HSL en RGB
     */
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

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    /**
     * Convertit une couleur hexadécimale en RGB
     */
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convertit RGB en hexadécimal
     */
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Extrait la couleur RGB d'une chaîne rgb(r,g,b)
     */
    function extractRgb(colorStr) {
        const rgbMatch = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            return {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3])
            };
        }
        return null;
    }

    /**
     * Vérifie si une couleur est une couleur par défaut à ignorer
     */
    function isDefaultColor(color) {
        if (!color || typeof color !== 'string') return true;
        const normalizedColor = color.toLowerCase().replace(/\s/g, '');
        
        // Vérifier les correspondances exactes et partielles
        if (DEFAULT_COLORS.some(defaultColor => normalizedColor === defaultColor)) return true;
        if (DEFAULT_COLORS.some(defaultColor => normalizedColor.includes(defaultColor))) return true;
        
        // Vérifier si c'est un gris (r=g=b)
        const rgbMatch = normalizedColor.match(/rgb\((\d+),(\d+),(\d+)\)/);
        if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            // Si c'est un gris (r=g=b) et luminosité > 200, c'est probablement un fond par défaut
            if (r === g && g === b && r > 200) return true;
        }
        
        return false;
    }

    /**
     * Convertit une couleur en version pastel selon le preset
     */
    function convertToPastel(color, presetKey) {
        if (isDefaultColor(color)) {
            return null;
        }

        let rgb = null;

        // Essayer de parser hex
        if (color.startsWith('#')) {
            rgb = hexToRgb(color);
        }
        // Essayer de parser rgb()
        else if (color.startsWith('rgb')) {
            rgb = extractRgb(color);
        }

        if (!rgb) return null;

        // Convertir en HSL
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        // Appliquer la transformation selon le preset
        const preset = PRESETS[presetKey] || PRESETS['pastel-moyen'];
        hsl.s = hsl.s * preset.saturationFactor;
        hsl.l = Math.min(hsl.l + preset.lightnessBoost, 0.9);

        // Reconvertir en RGB
        const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);

        return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    }

    /**
     * Applique les couleurs pastel aux workitems
     */
    function applyPastelColors() {
        if (window.azurePastelDebug) {
            console.log('Azure Pastel Theme: Application des couleurs...');
        }
        let modifiedCount = 0;

        // Sélecteurs robustes pour les cartes de workitems (multiple stratégies)
        const selectors = [
            '.board-tile',
            '.work-item-card',
            '.wit-card',
            '[data-item-id]',
            '[role="gridcell"] > div',  // Accessibilité
            '.member div',              // Structure interne
            '[class*="tile"]',         // Classes contenant "tile"
            '[class*="card"]'          // Classes contenant "card"
        ];

        const workItemCards = document.querySelectorAll(selectors.join(', '));

        workItemCards.forEach(card => {
            try {
                // Récupérer la couleur de fond actuelle
                const computedStyle = window.getComputedStyle(card);
                const bgColor = computedStyle.backgroundColor;

                if (bgColor && !isDefaultColor(bgColor)) {
                    const pastelColor = convertToPastel(bgColor, currentPreset);

                    if (pastelColor) {
                        // Utiliser !important pour éviter les conflits
                        card.style.setProperty('background-color', pastelColor, 'important');
                        card.setAttribute('data-azure-pastel-modified', 'true');
                        modifiedCount++;
                    }
                }
            } catch (e) {
                // Ignorer silencieusement les erreurs sur les éléments individuels
            }
        });

        if (window.azurePastelDebug || modifiedCount > 0) {
            console.log(`Azure Pastel Theme: ${modifiedCount} workitem(s) modifié(s)`);
        }

        // Alerte si aucune couleur n'est détectée après plusieurs tentatives
        if (modifiedCount === 0 && window.azurePastelAttempts >= 3) {
            console.warn('Azure Pastel Theme: Aucune couleur personnalisée détectée après plusieurs tentatives. Vérifiez que vous êtes sur un Board avec des workitems colorés.');
        }
        
        window.azurePastelAttempts = (window.azurePastelAttempts || 0) + 1;
    }

    /**
     * Réinitialise les styles modifiés
     */
    function resetModifiedStyles() {
        const modifiedCards = document.querySelectorAll('[data-azure-pastel-modified="true"]');
        modifiedCards.forEach(card => {
            card.style.removeProperty('background-color');
            card.removeAttribute('data-azure-pastel-modified');
        });
    }

    /**
     * Change le preset actif
     */
    function setPreset(presetKey) {
        if (!PRESETS[presetKey]) {
            console.error(`Azure Pastel Theme: Preset "${presetKey}" inexistant`);
            return;
        }
        
        // Réinitialiser les styles précédents
        resetModifiedStyles();
        
        currentPreset = presetKey;
        GM_setValue('currentPreset', presetKey);
        console.log(`Azure Pastel Theme: Preset changé pour "${PRESETS[presetKey].name}"`);

        // Réappliquer les couleurs
        window.azurePastelAttempts = 0;
        applyPastelColors();
    }

    /**
     * Affiche le preset actuel
     */
    function showCurrentPreset() {
        const preset = PRESETS[currentPreset];
        alert(`Preset actuel: ${preset.name}\nSaturation: ${preset.saturationFactor * 100}%\nLuminosité: +${preset.lightnessBoost * 100}%`);
    }

    // Variable pour contrôler l'intervalle
    let pastelInterval = null;

    // Log de confirmation que tout est chargé
    console.log('🎨 Azure Pastel Theme: Toutes les fonctions définies, enregistrement des menus...');

    // Enregistrer les commandes du menu Tampermonkey
    GM_registerMenuCommand('🎨 Pastel Léger', () => setPreset('pastel-leger'));
    GM_registerMenuCommand('🎨 Pastel Moyen', () => setPreset('pastel-moyen'));
    GM_registerMenuCommand('🎨 Pastel Intense', () => setPreset('pastel-intense'));
    GM_registerMenuCommand('ℹ️ Preset actuel', showCurrentPreset);
    GM_registerMenuCommand('🔄 Réappliquer couleurs', () => {
        window.azurePastelAttempts = 0;
        applyPastelColors();
    });
    GM_registerMenuCommand('🧹 Réinitialiser styles', resetModifiedStyles);
    GM_registerMenuCommand('🐛 Mode debug: ' + (window.azurePastelDebug ? 'ON' : 'OFF'), () => {
        window.azurePastelDebug = !window.azurePastelDebug;
        console.log(`Azure Pastel Theme: Mode debug ${window.azurePastelDebug ? 'activé' : 'désactivé'}`);
        // Recharger la page pour mettre à jour le menu
        location.reload();
    });

    // Observer les changements du DOM (pour les boards dynamiques)
    window.azurePastelObserver = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Vérifier si de nouvelles cartes ont été ajoutées
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.matches && (node.matches('.board-tile') || 
                            node.matches('.work-item-card') || 
                            node.matches('.wit-card') ||
                            node.matches('[data-item-id]') ||
                            node.querySelector('.board-tile, .work-item-card, .wit-card, [data-item-id]'))) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });

        if (shouldUpdate) {
            // Petit délai pour laisser le DOM se stabiliser
            setTimeout(applyPastelColors, 100);
        }
    });

    // Démarrer l'observation
    if (document.body) {
        window.azurePastelObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        // Attendre que body soit disponible
        document.addEventListener('DOMContentLoaded', () => {
            window.azurePastelObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    // Appliquer les couleurs au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyPastelColors);
    } else {
        applyPastelColors();
    }

    // Nettoyage à la désinstallation
    window.addEventListener('beforeunload', function() {
        if (pastelInterval) {
            clearInterval(pastelInterval);
        }
        if (window.azurePastelObserver) {
            window.azurePastelObserver.disconnect();
        }
    });

    // Réappliquer périodiquement (pour les boards qui chargent dynamiquement)
    // Utiliser un intervalle adaptatif : plus fréquent au début, puis plus espacé
    let checkCount = 0;
    const adaptiveInterval = setInterval(() => {
        applyPastelColors();
        checkCount++;
        // Après 10 vérifications, réduire la fréquence
        if (checkCount === 10) {
            clearInterval(adaptiveInterval);
            pastelInterval = setInterval(applyPastelColors, 10000); // Passer à 10 secondes
        }
    }, 2000); // Vérifier toutes les 2 secondes au début

    console.log('✅ Azure Pastel Theme: Script chargé avec succès!');
    console.log(`🎨 Preset actuel: ${PRESETS[currentPreset].name}`);
    console.log('📋 Menu Tampermonkey: Cliquez sur l\'icône 🐒 pour voir les options');

    } catch (error) {
        console.error('Azure Pastel Theme: Erreur critique lors du chargement', error);
    }
})();
