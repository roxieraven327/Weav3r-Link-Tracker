// ==UserScript==
// @name         TornW3B Dollar Bazaar Click Tracker
// @namespace    weav3r.clicktracker
// @version      1.1
// @description  Adds a fading checkmark next to bazaar names you've clicked (expires after 6 hours).
// @author       Roxie (Chaos Engineering)
// @match        https://weav3r.dev/dollar-bazaars*
// @match        https://weav3r.dev/dollar-bazaars/*
// @downloadURL  https://raw.githubusercontent.com/roxieraven327/Weav3r-Link-Tracker/main/weav3r-link-tracker.user.js
// @updateURL    https://raw.githubusercontent.com/roxieraven327/Weav3r-Link-Tracker/main/weav3r-link-tracker.user.js
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const STORAGE_KEY = "weav3rBazaarClicks";
    const DURATION = 6 * 60 * 60 * 1000;

    let timer = null;

    function getData() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        } catch {
            return {};
        }
    }

    function saveData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function cleanData() {
        const data = getData();
        const now = Date.now();

        for (const id in data) {
            if (now - data[id] > DURATION) {
                delete data[id];
            }
        }

        saveData(data);
        return data;
    }

    function extractID(text) {
        const match = text.match(/\[(\d+)\]/);
        return match ? match[1] : null;
    }

    function scheduleUpdate() {
        clearTimeout(timer);
        timer = setTimeout(updateMarks, 250);
    }

    function updateMarks() {
        const data = cleanData();

        document.querySelectorAll(".weav3r-check").forEach(el => el.remove());

        const links = Array.from(document.querySelectorAll("a"))
            .filter(a => extractID(a.textContent));

        for (const link of links) {
            const id = extractID(link.textContent);
            if (!id || !data[id]) continue;

            const age = Date.now() - data[id];
            const opacity = Math.max(0.25, 1 - age / DURATION);

            const mark = document.createElement("span");
            mark.className = "weav3r-check";
            mark.textContent = " ✓";
            mark.style.cssText = `
                color: #9b5cff;
                font-weight: bold;
                margin-left: 6px;
                opacity: ${opacity};
            `;

            link.appendChild(mark);
        }
    }

    document.addEventListener("click", function (e) {
        const link = e.target.closest("a");
        if (!link) return;

        const id = extractID(link.textContent);
        if (!id) return;

        const data = cleanData();
        data[id] = Date.now();
        saveData(data);

        scheduleUpdate();
    }, true);

    setTimeout(updateMarks, 1000);
    setInterval(updateMarks, 5 * 60 * 1000);
})();
