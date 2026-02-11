// ==UserScript==
// @name         Azure DevOps Pastel Colors
// @namespace    http://tampermonkey.net/
// @version      1.7
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

    console.log('🎨 Azure Pastel Theme v1.7: Script démarré');

    window.addEventListener('error', function(e) {
        console.error('Azure Pastel Theme: Erreur détectée', e.message);
    });

    try {
        // Configuration des presets
        const PRESETS = {
            'vif':     { saturationFactor: 0.85, lightnessBoost: 0.10, name: 'Vif' },
            'leger':   { saturationFactor: 0.70, lightnessBoost: 0.15, name: 'Léger' },
            'moyen':   { saturationFactor: 0.50, lightnessBoost: 0.25, name: 'Moyen' },
            'intense': { saturationFactor: 0.35, lightnessBoost: 0.35, name: 'Intense' }
        };

        // Validation du preset
        let currentPreset = GM_getValue('currentPreset', 'leger');
        if (!PRESETS[currentPreset]) {
            console.warn('Preset invalide, utilisation de "leger"');
            currentPreset = 'leger';
            GM_setValue('currentPreset', currentPreset);
        }

        console.log('🎨 Preset actuel:', currentPreset);

        const DEFAULT_COLORS = [
            '#ffffff', '#f5f5f5', '#fafafa', '#f8f8f8',
            '#f0f0f0', '#ebebeb', '#e8e8e8', '#e5e5e5',
            '#e0e0e0', '#ddd', '#cccccc',
            'transparent', 'rgba(0,0,0,0)', 'rgba(255,255,255,0)',
            'inherit', 'initial', 'unset'
        ];

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
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        }

        function rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        function isDefaultColor(color) {
            if (!color || typeof color !== 'string') return true;
            const normalizedColor = color.toLowerCase().replace(/\s/g, '');
            
            if (DEFAULT_COLORS.some(c => normalizedColor === c || normalizedColor.includes(c))) return true;
            
            const rgbMatch = normalizedColor.match(/rgb\((\d+),(\d+),(\d+)\)/);
            if (rgbMatch) {
                const r = parseInt(rgbMatch[1]), g = parseInt(rgbMatch[2]), b = parseInt(rgbMatch[3]);
                if (r === g && g === b && r > 200) return true;
            }
            return false;
        }

        function convertToPastel(rgbColor, presetKey) {
            if (isDefaultColor(rgbColor)) return null;
            
            let rgb = null;
            if (rgbColor.startsWith('#')) {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(rgbColor);
                if (result) rgb = { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) };
            } else if (rgbColor.startsWith('rgb')) {
                const match = rgbColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                if (match) rgb = { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
            }
            
            if (!rgb) return null;
            
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            const preset = PRESETS[presetKey] || PRESETS['leger'];
            hsl.s = hsl.s * preset.saturationFactor;
            hsl.l = Math.min(hsl.l + preset.lightnessBoost, 0.9);
            
            const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
            return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        }

        function applyPastelColors() {
            let modifiedCount = 0;
            const cards = document.querySelectorAll('.wit-card, .board-tile, [data-item-id]');

            cards.forEach(card => {
                if (card.getAttribute('data-azure-pastel-modified') === 'true') return;
                
                try {
                    const bgColor = window.getComputedStyle(card).backgroundColor;
                    
                    if (bgColor && !isDefaultColor(bgColor)) {
                        if (!card.getAttribute('data-azure-original-color')) {
                            card.setAttribute('data-azure-original-color', bgColor);
                        }
                        
                        const originalColor = card.getAttribute('data-azure-original-color');
                        const pastelColor = convertToPastel(originalColor, currentPreset);
                        
                        if (pastelColor) {
                            card.style.setProperty('background-color', pastelColor, 'important');
                            card.setAttribute('data-azure-pastel-modified', 'true');
                            modifiedCount++;
                        }
                    }
                } catch (e) {}
            });

            if (modifiedCount > 0) {
                console.log(`✅ ${modifiedCount} workitem(s) modifié(s)`);
            }
        }

        function resetModifiedStyles() {
            const modifiedCards = document.querySelectorAll('[data-azure-pastel-modified="true"]');
            modifiedCards.forEach(card => {
                const originalColor = card.getAttribute('data-azure-original-color');
                
                if (originalColor) {
                    card.style.setProperty('background-color', originalColor);
                } else {
                    card.style.removeProperty('background-color');
                }
                
                card.removeAttribute('data-azure-pastel-modified');
                card.removeAttribute('data-azure-original-color');
            });
            
            console.log('🧹 Styles réinitialisés');
        }

        function setPreset(presetKey) {
            if (!PRESETS[presetKey]) {
                console.log('Preset invalide:', presetKey);
                return;
            }
            
            resetModifiedStyles();
            currentPreset = presetKey;
            GM_setValue('currentPreset', presetKey);
            console.log(`🎨 Preset changé: ${PRESETS[presetKey].name}`);
            
            setTimeout(applyPastelColors, 100);
        }

        // Créer la dropdown avec styles explicites pour la visibilité
        function createAzureDevOpsDropdown() {
            if (document.getElementById('azure-pastel-tab')) {
                console.log('Dropdown déjà présente');
                return;
            }
            
            const tabsContainer = document.querySelector('.boards-tabbar-tabs.bolt-tabbar-tabs');
            
            if (!tabsContainer) {
                console.log('Conteneur d\'onglets non trouvé');
                return;
            }
            
            console.log('Création de la dropdown...');
            
            const tabElement = document.createElement('div');
            tabElement.id = 'azure-pastel-tab';
            tabElement.style.cssText = `
                display: inline-flex;
                align-items: center;
                margin-left: 8px;
                padding: 8px 12px;
                border-left: 1px solid #e0e0e0;
                font-family: "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;
                font-size: 14px;
                color: #333 !important;
            `;
            
            const label = document.createElement('span');
            label.textContent = '🎨 ';
            label.style.cssText = `
                margin-right: 6px;
                font-weight: 600;
                color: #333 !important;
            `;
            
            const select = document.createElement('select');
            select.id = 'azure-pastel-select';
            // Styles explicites pour forcer la visibilité
            select.style.cssText = `
                padding: 4px 8px;
                border: 1px solid #666;
                border-radius: 2px;
                background-color: #ffffff !important;
                color: #000000 !important;
                font-size: 13px;
                cursor: pointer;
                outline: none;
                min-width: 90px;
                height: 28px;
            `;
            
            // Option désactivée
            const disabledOption = document.createElement('option');
            disabledOption.value = '';
            disabledOption.textContent = '—';
            disabledOption.style.cssText = 'color: #000 !important; background: #fff !important;';
            select.appendChild(disabledOption);
            
            // Options des presets
            Object.entries(PRESETS).forEach(([key, preset]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = preset.name;
                option.style.cssText = 'color: #000 !important; background: #fff !important;';
                select.appendChild(option);
            });
            
            // IMPORTANT: Attendre que les options soient ajoutées avant de setter la valeur
            setTimeout(() => {
                if (PRESETS[currentPreset]) {
                    select.value = currentPreset;
                    console.log('Dropdown initialisée avec:', currentPreset);
                }
            }, 0);
            
            select.addEventListener('change', (e) => {
                const value = e.target.value;
                if (value && PRESETS[value]) {
                    setPreset(value);
                } else if (value === '') {
                    resetModifiedStyles();
                }
            });
            
            tabElement.appendChild(label);
            tabElement.appendChild(select);
            tabsContainer.appendChild(tabElement);
            
            console.log('✅ Dropdown créée avec succès');
        }

        // Menus Tampermonkey
        GM_registerMenuCommand('🎨 Vif', () => setPreset('vif'));
        GM_registerMenuCommand('🎨 Léger', () => setPreset('leger'));
        GM_registerMenuCommand('🎨 Moyen', () => setPreset('moyen'));
        GM_registerMenuCommand('🎨 Intense', () => setPreset('intense'));
        GM_registerMenuCommand('🔄 Réappliquer', applyPastelColors);
        GM_registerMenuCommand('🧹 Réinitialiser', resetModifiedStyles);

        // Initialisation
        setTimeout(() => {
            applyPastelColors();
            createAzureDevOpsDropdown();
        }, 2500);
        
        setTimeout(applyPastelColors, 6000);

    } catch (error) {
        console.error('🚨 Erreur critique:', error);
    }
})();
