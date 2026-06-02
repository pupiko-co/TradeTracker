/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/FuturesPosition.ts"
/*!********************************!*\
  !*** ./src/FuturesPosition.ts ***!
  \********************************/
(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.FuturesPosition = void 0;\nconst TradePosition_1 = __webpack_require__(/*! ./TradePosition */ \"./src/TradePosition.ts\");\n/**\n * Konkrétní třída pro futures (páková) pozice.\n * Obchodník nevlastní aktivum přímo – skládá marži a ovládá větší pozici pákou.\n * Specifickým rizikem je likvidace: pokud cena dosáhne liquidationPrice,\n * broker automaticky uzavírá pozici.\n */\nclass FuturesPosition extends TradePosition_1.TradePosition {\n    constructor(symbol, entryPrice, quantity, direction, leverage, marginUsed) {\n        // Zavolá konstruktor rodičovské třídy TradePosition\n        super(symbol, entryPrice, quantity, direction);\n        // Validace páky a marže\n        if (leverage < 1) {\n            throw new Error(`Páka musí být minimálně 1× (zadáno: ${leverage}).`);\n        }\n        if (marginUsed <= 0) {\n            throw new Error(\"Výše marže musí být kladné číslo.\");\n        }\n        this.leverage = leverage;\n        this.marginUsed = marginUsed;\n        // Výpočet likvidační ceny\n        // LONG: likvidace když cena klesne o (vstup / páka × 0.9)\n        // SHORT: likvidace když cena vzroste o (vstup / páka × 0.9)\n        const liqFactor = (1 / leverage) * 0.9;\n        this.liquidationPrice =\n            direction === TradePosition_1.Direction.LONG\n                ? parseFloat((entryPrice * (1 - liqFactor)).toFixed(2))\n                : parseFloat((entryPrice * (1 + liqFactor)).toFixed(2));\n    }\n    /**\n     * Výpočet P&L pro futures pozici S PÁKOU.\n     * Vzorec: (aktuální cena - vstupní cena) × objem × páka × směr\n     * Páka zesiluje jak zisky, tak ztráty.\n     */\n    getPnL(currentPrice) {\n        if (currentPrice <= 0)\n            throw new Error(\"Aktuální cena musí být kladná.\");\n        const multiplier = this.direction === TradePosition_1.Direction.LONG ? 1 : -1;\n        return (currentPrice - this.entryPrice) * this.quantity * this.leverage * multiplier;\n    }\n    /**\n     * Vyhodnotí riziko likvidace podle vzdálenosti aktuální ceny od likvidační úrovně.\n     * @returns \"LOW\" | \"MEDIUM\" | \"HIGH\"\n     */\n    getLiquidationRisk(currentPrice) {\n        const distancePct = (Math.abs(currentPrice - this.liquidationPrice) / currentPrice) * 100;\n        if (distancePct > 15)\n            return \"LOW\";\n        if (distancePct > 5)\n            return \"MEDIUM\";\n        return \"HIGH ⚠️\";\n    }\n    // Getter pro páku\n    getLeverage() {\n        return this.leverage;\n    }\n    // Getter pro použitou marži\n    getMarginUsed() {\n        return this.marginUsed;\n    }\n    // Getter pro likvidační cenu\n    getLiquidationPrice() {\n        return this.liquidationPrice;\n    }\n    // Přepis getSummary() - přidává páku, marži a likvidační cenu\n    getSummary() {\n        return (super.getSummary() +\n            ` | Páka: ${this.leverage}× | Marže: $${this.marginUsed} | Likvidace: ${this.liquidationPrice}`);\n    }\n}\nexports.FuturesPosition = FuturesPosition;\n\n\n//# sourceURL=webpack://tradetracker/./src/FuturesPosition.ts?\n}");

/***/ },

/***/ "./src/SpotPosition.ts"
/*!*****************************!*\
  !*** ./src/SpotPosition.ts ***!
  \*****************************/
(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.SpotPosition = void 0;\nconst TradePosition_1 = __webpack_require__(/*! ./TradePosition */ \"./src/TradePosition.ts\");\n/**\n * Konkrétní třída pro spotové (přímé) obchodní pozice.\n * Obchodník vlastní aktivum přímo – maximální ztráta je omezena investicí.\n * Rozšiřuje bázovou třídu o stop-loss, take-profit a výpočet Risk:Reward.\n */\nclass SpotPosition extends TradePosition_1.TradePosition {\n    constructor(symbol, entryPrice, quantity, direction, stopLoss, takeProfit) {\n        // Zavolá konstruktor rodičovské třídy TradePosition\n        super(symbol, entryPrice, quantity, direction);\n        // Validace stop-loss a take-profit\n        if (stopLoss <= 0) {\n            throw new Error(\"Stop-loss musí být kladné číslo.\");\n        }\n        if (takeProfit <= 0) {\n            throw new Error(\"Take-profit musí být kladné číslo.\");\n        }\n        if (direction === TradePosition_1.Direction.LONG && stopLoss >= entryPrice) {\n            throw new Error(\"Pro LONG pozici musí být stop-loss pod vstupní cenou.\");\n        }\n        if (direction === TradePosition_1.Direction.LONG && takeProfit <= entryPrice) {\n            throw new Error(\"Pro LONG pozici musí být take-profit nad vstupní cenou.\");\n        }\n        if (direction === TradePosition_1.Direction.SHORT && stopLoss <= entryPrice) {\n            throw new Error(\"Pro SHORT pozici musí být stop-loss nad vstupní cenou.\");\n        }\n        if (direction === TradePosition_1.Direction.SHORT && takeProfit >= entryPrice) {\n            throw new Error(\"Pro SHORT pozici musí být take-profit pod vstupní cenou.\");\n        }\n        this.stopLoss = stopLoss;\n        this.takeProfit = takeProfit;\n    }\n    /**\n     * Výpočet P&L pro spotovou pozici.\n     * Vzorec: (aktuální cena - vstupní cena) × objem × směr\n     */\n    getPnL(currentPrice) {\n        if (currentPrice <= 0)\n            throw new Error(\"Aktuální cena musí být kladná.\");\n        const multiplier = this.direction === TradePosition_1.Direction.LONG ? 1 : -1;\n        return (currentPrice - this.entryPrice) * this.quantity * multiplier;\n    }\n    /**\n     * Vrátí poměr riziko:odměna (Risk:Reward ratio).\n     * Hodnota 2 znamená že potenciální zisk je 2× větší než riziko.\n     */\n    getRiskReward() {\n        const risk = Math.abs(this.entryPrice - this.stopLoss);\n        const reward = Math.abs(this.takeProfit - this.entryPrice);\n        if (risk === 0)\n            return Infinity;\n        return parseFloat((reward / risk).toFixed(2));\n    }\n    // Getter pro stop-loss\n    getStopLoss() {\n        return this.stopLoss;\n    }\n    // Getter pro take-profit\n    getTakeProfit() {\n        return this.takeProfit;\n    }\n    // Přepis getSummary() - přidává SL, TP a R:R poměr\n    getSummary() {\n        return (super.getSummary() +\n            ` | SL: ${this.stopLoss} | TP: ${this.takeProfit} | R:R = 1:${this.getRiskReward()}`);\n    }\n}\nexports.SpotPosition = SpotPosition;\n\n\n//# sourceURL=webpack://tradetracker/./src/SpotPosition.ts?\n}");

/***/ },

/***/ "./src/TradePosition.ts"
/*!******************************!*\
  !*** ./src/TradePosition.ts ***!
  \******************************/
(__unused_webpack_module, exports) {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.TradePosition = exports.Direction = void 0;\n// Výčtový typ pro směr obchodu\n// LONG = spekulace na růst ceny, SHORT = spekulace na pokles\nvar Direction;\n(function (Direction) {\n    Direction[\"LONG\"] = \"LONG\";\n    Direction[\"SHORT\"] = \"SHORT\";\n})(Direction || (exports.Direction = Direction = {}));\n/**\n * Abstraktní bázová třída pro všechny typy obchodních pozic.\n * Definuje společné vlastnosti a předepisuje abstraktní metodu getPnL(),\n * kterou musí každý potomek implementovat vlastní logikou.\n */\nclass TradePosition {\n    constructor(symbol, entryPrice, quantity, direction) {\n        // Validace dat - objekt nelze vytvořit s chybnými hodnotami\n        if (!symbol || symbol.trim() === \"\") {\n            throw new Error(\"Symbol nesmí být prázdný řetězec.\");\n        }\n        if (entryPrice <= 0) {\n            throw new Error(`Vstupní cena musí být kladné číslo (zadáno: ${entryPrice}).`);\n        }\n        if (quantity <= 0) {\n            throw new Error(`Objem pozice musí být kladné číslo (zadáno: ${quantity}).`);\n        }\n        this.symbol = symbol.trim().toUpperCase();\n        this.entryPrice = entryPrice;\n        this.quantity = quantity;\n        this.direction = direction;\n        this.openedAt = new Date();\n    }\n    // Vrátí celkovou hodnotu pozice při vstupu\n    getPositionValue() {\n        return this.entryPrice * this.quantity;\n    }\n    // Getter pro datum otevření pozice\n    getOpenedAt() {\n        return this.openedAt;\n    }\n    // Základní textový souhrn pozice\n    getSummary() {\n        return `[${this.symbol}] ${this.direction} | Vstup: ${this.entryPrice} | Objem: ${this.quantity}`;\n    }\n}\nexports.TradePosition = TradePosition;\n\n\n//# sourceURL=webpack://tradetracker/./src/TradePosition.ts?\n}");

/***/ },

/***/ "./src/app.ts"
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst TradePosition_1 = __webpack_require__(/*! ./TradePosition */ \"./src/TradePosition.ts\");\nconst SpotPosition_1 = __webpack_require__(/*! ./SpotPosition */ \"./src/SpotPosition.ts\");\nconst FuturesPosition_1 = __webpack_require__(/*! ./FuturesPosition */ \"./src/FuturesPosition.ts\");\n// Pole všech pozic v portfoliu\nlet portfolio = [];\n// === POMOCNÉ FUNKCE ===\n// Aktualizuje souhrnné karty nahoře\nfunction updateSummary() {\n    let totalValue = 0;\n    let totalPnL = 0;\n    for (const item of portfolio) {\n        totalValue += item.position.getPositionValue();\n        totalPnL += item.position.getPnL(item.currentPrice);\n    }\n    document.getElementById(\"total-count\").textContent = String(portfolio.length);\n    document.getElementById(\"total-value\").textContent = `$${totalValue.toFixed(2)}`;\n    const pnlEl = document.getElementById(\"total-pnl\");\n    pnlEl.textContent = `${totalPnL >= 0 ? \"+\" : \"\"}$${totalPnL.toFixed(2)}`;\n    pnlEl.className = \"summary-value \" + (totalPnL >= 0 ? \"pnl-positive\" : \"pnl-negative\");\n}\n// Překreslí celou tabulku pozic\nfunction renderTable() {\n    const tbody = document.getElementById(\"positions-tbody\");\n    tbody.innerHTML = \"\";\n    if (portfolio.length === 0) {\n        tbody.innerHTML = `<tr id=\"empty-row\"><td colspan=\"9\" class=\"empty\">Zatím žádné pozice. Přidej první!</td></tr>`;\n        return;\n    }\n    for (let i = 0; i < portfolio.length; i++) {\n        const { position, currentPrice } = portfolio[i];\n        const pnl = position.getPnL(currentPrice);\n        const pnlStr = `${pnl >= 0 ? \"+\" : \"\"}$${pnl.toFixed(2)}`;\n        const pnlClass = pnl >= 0 ? \"pnl-positive\" : \"pnl-negative\";\n        const isSpot = position instanceof SpotPosition_1.SpotPosition;\n        const typeBadge = isSpot\n            ? `<span class=\"badge badge-spot\">SPOT</span>`\n            : `<span class=\"badge badge-futures\">FUTURES</span>`;\n        const dirClass = position[\"direction\"] === TradePosition_1.Direction.LONG ? \"badge-long\" : \"badge-short\";\n        const dirBadge = `<span class=\"badge ${dirClass}\">${position[\"direction\"]}</span>`;\n        // Extra info podle typu\n        let info = \"\";\n        if (position instanceof SpotPosition_1.SpotPosition) {\n            info = `R:R 1:${position.getRiskReward()}`;\n        }\n        else if (position instanceof FuturesPosition_1.FuturesPosition) {\n            const risk = position.getLiquidationRisk(currentPrice);\n            const riskClass = risk.startsWith(\"LOW\") ? \"risk-low\" : risk.startsWith(\"MED\") ? \"risk-medium\" : \"risk-high\";\n            info = `Páka: ${position.getLeverage()}× | Liq: ${position.getLiquidationPrice()} | Riziko: <span class=\"${riskClass}\">${risk}</span>`;\n        }\n        const tr = document.createElement(\"tr\");\n        tr.innerHTML = `\r\n      <td data-label=\"Typ\">${typeBadge}</td>\r\n      <td data-label=\"Symbol\"><strong>${position.symbol}</strong></td>\r\n      <td data-label=\"Směr\">${dirBadge}</td>\r\n      <td data-label=\"Vstup\">$${position[\"entryPrice\"]}</td>\r\n      <td data-label=\"Objem\">${position[\"quantity\"]}</td>\r\n      <td data-label=\"Akt. cena\">$${currentPrice}</td>\r\n      <td data-label=\"P&L\" class=\"${pnlClass}\">${pnlStr}</td>\r\n      <td data-label=\"Info\">${info}</td>\r\n      <td data-label=\"Akce\"><button class=\"delete-btn\" data-index=\"${i}\">Smazat</button></td>\r\n    `;\n        tbody.appendChild(tr);\n    }\n    // Přidání event listenerů na tlačítka smazat\n    document.querySelectorAll(\".delete-btn\").forEach((btn) => {\n        btn.addEventListener(\"click\", (e) => {\n            const index = parseInt(e.target.dataset.index);\n            portfolio.splice(index, 1);\n            renderTable();\n            updateSummary();\n        });\n    });\n}\n// === PŘEPÍNÁNÍ POLÍ FORMULÁŘE ===\nconst typeSelect = document.getElementById(\"type\");\ntypeSelect.addEventListener(\"change\", () => {\n    const isSpot = typeSelect.value === \"spot\";\n    document.getElementById(\"spot-fields\").classList.toggle(\"hidden\", !isSpot);\n    document.getElementById(\"futures-fields\").classList.toggle(\"hidden\", isSpot);\n});\n// === PŘIDÁNÍ POZICE ===\ndocument.getElementById(\"add-btn\").addEventListener(\"click\", () => {\n    const errorEl = document.getElementById(\"error-msg\");\n    errorEl.classList.add(\"hidden\");\n    errorEl.textContent = \"\";\n    const type = document.getElementById(\"type\").value;\n    const symbol = document.getElementById(\"symbol\").value;\n    const dirVal = document.getElementById(\"direction\").value;\n    const entryPrice = parseFloat(document.getElementById(\"entryPrice\").value);\n    const quantity = parseFloat(document.getElementById(\"quantity\").value);\n    const currentPrice = parseFloat(document.getElementById(\"currentPrice\").value);\n    const direction = dirVal === \"LONG\" ? TradePosition_1.Direction.LONG : TradePosition_1.Direction.SHORT;\n    try {\n        let position;\n        if (type === \"spot\") {\n            const stopLoss = parseFloat(document.getElementById(\"stopLoss\").value);\n            const takeProfit = parseFloat(document.getElementById(\"takeProfit\").value);\n            position = new SpotPosition_1.SpotPosition(symbol, entryPrice, quantity, direction, stopLoss, takeProfit);\n        }\n        else {\n            const leverage = parseFloat(document.getElementById(\"leverage\").value);\n            const marginUsed = parseFloat(document.getElementById(\"marginUsed\").value);\n            position = new FuturesPosition_1.FuturesPosition(symbol, entryPrice, quantity, direction, leverage, marginUsed);\n        }\n        if (isNaN(currentPrice) || currentPrice <= 0) {\n            throw new Error(\"Aktuální cena musí být kladné číslo.\");\n        }\n        portfolio.push({ position, currentPrice });\n        renderTable();\n        updateSummary();\n        // Reset formuláře\n        document.getElementById(\"symbol\").value = \"\";\n        document.getElementById(\"entryPrice\").value = \"\";\n        document.getElementById(\"quantity\").value = \"\";\n        document.getElementById(\"currentPrice\").value = \"\";\n        document.getElementById(\"stopLoss\").value = \"\";\n        document.getElementById(\"takeProfit\").value = \"\";\n        document.getElementById(\"leverage\").value = \"\";\n        document.getElementById(\"marginUsed\").value = \"\";\n    }\n    catch (e) {\n        errorEl.textContent = e.message;\n        errorEl.classList.remove(\"hidden\");\n    }\n});\n// === INICIALIZACE ===\nrenderTable();\nupdateSummary();\n\n\n//# sourceURL=webpack://tradetracker/./src/app.ts?\n}");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/app.ts");
/******/ 	
/******/ })()
;