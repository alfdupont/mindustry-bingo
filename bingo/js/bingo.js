/**
 * Create a square bingo grid with the given HTML id using random elements from the bingo array
 * @param {string} htmlId - The HTML id of the grid element
 */
function makeGrid(htmlId) {
    let gridDiv = document.getElementById(htmlId);
    let shuffledBingo = shuffle(bingo);
    let gridItems = shuffledBingo.slice(0, bingoGridSize * bingoGridSize);
    let grid = document.createElement("table");
    for (let i = 0; i < bingoGridSize; i++) {
        let row = document.createElement("tr");
        row.className = "bingo-row";
        for (let j = 0; j < bingoGridSize; j++) {
            let item = gridItems[i * bingoGridSize + j];
            let cell = document.createElement("td");
            let spritePath = matchDescriptionToSprite(item.description);
            cell.className = "bingo-cell";
            cell.innerHTML = makeCellHtml(item.description, spritePath);
            const bgColors = getRandomPastelColor();
            cell.style.backgroundColor = bgColors.pastelColor;
            cell.style.setProperty('--cell-hover-color', bgColors.hoverColor);
            cell.addEventListener('click', function () {
                toggleGreyOut(this);
            });
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
    gridDiv.innerHTML = "";
    gridDiv.appendChild(grid);
}

/**
 * Shuffle a bingo definition using the Fisher-Yates algorithm
 * @param {Object} complexGrid - The bingo definition to shuffle
 * @returns {Array} The shuffled array
 */
function shuffle(complexGrid) {
    let grid = [];
    for (let sectionName in complexGrid) {
        grid.push(...complexGrid[sectionName]);
    }
    let array = grid.slice();
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function toggleGreyOut(element) {
    if (element.style.textDecoration === "line-through") {
        element.style.textDecoration = "none";
        const bgColors = getRandomPastelColor();
        element.style.backgroundColor = bgColors.pastelColor;
        element.style.setProperty('--cell-hover-color', bgColors.hoverColor);
        element.style.color = "#0f0f0f";
    } else {
        element.style.textDecoration = "line-through";
        element.style.backgroundColor = "#2e3330";
        element.style.setProperty('--cell-hover-color', "#434644");
        element.style.color = "aquamarine";
    }
}

function makeCellHtml(itemDescription, sprite) {
    return '<div class="sprite"><img src="' + sprite + '" alt=""/></div><div class="desc">' + itemDescription + '</div>';
}

/**
 * Find sprite corresponding to provided description
 * @param {string} description - description of the bingo card
 * @returns {string} - path to the PNG sprite
 */
function matchDescriptionToSprite(description) {
    let modifiedDescription = description.toLowerCase().replace(/[^a-z0-9]/g, '');
    let matches = [];
    for (let spriteName in sprites) {
        let modifiedSpriteName = spriteName.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (modifiedDescription.indexOf(modifiedSpriteName) !== -1) {
            matches.push(spriteName);
        }
    }
    if (matches.length >= 1) {
        // return longest sprite name
        let longestMatch = matches[0];
        for (let i = 1; i < matches.length; i++) {
            if (matches[i].length > longestMatch.length) {
                longestMatch = matches[i];
            }
        }
        return sprites[longestMatch];
    }
    console.log('No sprite found for description: ' + description)
    return fallbackSprite;
}

function getRandomPastelColor() {
    const hue = Math.random() * 60 + 180; // pick a hue between 180 and 240 degrees
    const saturation = '50%'; // set saturation to 50%
    const lightness = Math.random() * 30 + 70 + '%'; // pick a lightness between 70% and 100%
    const alpha = 1; // set alpha to fully opaque

    const pastelColor = `hsla(${hue}, ${saturation}, ${lightness}, ${alpha})`;
    const hoverColor = `hsla(${hue}, ${saturation}, calc(${lightness} - 10%), ${alpha})`;

    return {pastelColor, hoverColor};
}

window.onload = function () {
    makeGrid("bingo_grid_p1");
    makeGrid("bingo_grid_p2");
}