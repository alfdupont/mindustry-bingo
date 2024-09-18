let gridState = [];

/**
 * Create a square bingo grid with the given HTML id using random elements from the bingo array
 * @param {string} htmlId - The HTML id of the grid element
 * @param {string} seed - The seed for the random number generator
 * @param gridSize - The size of the grid
 */
function makeGrid(htmlId, seed, gridSize) {
    let gridDiv = document.getElementById(htmlId);
    if (!gridSize) {
        gridSize = bingoGridSize;
    } else {
        gridSize = parseInt(gridSize);
    }
    let shuffledBingo = shuffle(bingo, seed, gridSize);

    let gridItems = shuffledBingo.slice(0, gridSize * gridSize);
    let grid = document.createElement("table");
    gridState = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    for (let i = 0; i < gridSize; i++) {
        let row = document.createElement("tr");
        row.className = "bingo-row";
        for (let j = 0; j < gridSize; j++) {
            let item = gridItems[i * gridSize + j];
            let cell = document.createElement("td");
            let spritePath = matchDescriptionToSprite(item.description);
            cell.className = "bingo-cell";
            cell.innerHTML = makeCellHtml(item.description, spritePath);
            updateCellAppearance(cell, gridState[i][j]);
            cell.addEventListener('click', function (e) {
                console.log("click");
                console.log(e.button);
                toggleCell(this, i, j, e.button === 0 ? 1 : 2);
            });
            cell.addEventListener('contextmenu', function (e) {
                console.log("contextmenu");
                console.log(e.button);
                e.preventDefault();
                toggleCell(this, i, j, 2);
            });
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
    let gWidth = gridSize * 120;
    let gHeight = gridSize * 120;
    grid.style.width = `${gWidth}px`;
    grid.style.height = `${gHeight}px`;
    gridDiv.innerHTML = "";
    gridDiv.appendChild(grid);
    // Update the URL with the new seed
    window.history.replaceState({}, '', `${window.location.pathname}?seed=${seed}&gridSize=${gridSize}`);
}

/**
 * Shuffle a bingo definition using the Fisher-Yates algorithm
 * @param {Object} complexGrid - The bingo definition to shuffle
 * @param {string} seed - The seed for the random number generator
 * @param {number} gridSize - The size of the grid
 * @returns {Array} The shuffled array
 */
function shuffle(complexGrid, seed, gridSize) {
    let grid = [];
    
    // get configuration
    let config = document.querySelector("form");
    let checkedCategories = Array.from(config.elements)
        .filter(element => element.checked)
        .map(element => element.id);
    for (let sectionName in complexGrid) {
        if (!checkedCategories.includes(sectionName)) {
            continue;
        }
        grid.push(...complexGrid[sectionName]);
    }

    let errorDiv = document.getElementById("error");
    if (grid.length < gridSize * gridSize) {
        console.error("Not enough items to fill the grid. Please select more categories.");
        // display error in pop up
        errorDiv.innerHTML = "Not enough items to fill the grid. Please select more categories.";
        errorDiv.style.display = "block";
        return [];
    }
    errorDiv.innerHTML = "";
    
    // Use the seed to create a random number generator
    let rng = xmur3(seed);
    
    let array = grid.slice();
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(rng() / 4294967296 * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function toggleCell(element, row, col, player) {
    let currentState = gridState[row][col];
    console.log("toggleCell", row, col, player, currentState);
    if (player === 1) {
        if (currentState === 0 || currentState === 2) {
            gridState[row][col] += 1;
        } else {
            gridState[row][col] -= 1;
        }
    } else if (player === 2) {
        if (currentState === 0 || currentState === 1) {
            gridState[row][col] += 2;
        } else {
            gridState[row][col] -= 2;
        }
    }

    console.log("gridState", gridState[row][col]);
    updateCellAppearance(element, gridState[row][col]);
}

function updateCellAppearance(element, state) {
    element.classList.remove('no-player', 'player1', 'player2', 'both-players');
    switch (state) {
        case 0:
            element.classList.add('no-player');
            break;
        case 1:
            element.classList.add('player1');
            break;
        case 2:
            element.classList.add('player2');
            break;
        case 3:
            element.classList.add('both-players');
            break;
    }
}

function makeCellHtml(itemDescription, sprite) {
    return `
        <div class="sprite">
            <img src="${sprite}" alt="" />
            <span class="custom-tooltip">${itemDescription}</span>
        </div>
    `;
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

function renderCategoriesConfigForm() {
    let categories = Object.keys(bingo);
    let formDiv = document.getElementById("categories");
    let applyDiv = document.getElementById("apply");
    // Create a form
    let form = document.createElement("form");
    for (const element of categories) {
        // Create a checkbox for each category
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = element;
        checkbox.checked = true;
        // add a label to the checkbox
        let label = document.createElement("label");
        label.htmlFor = element;
        label.appendChild(document.createTextNode(element));
        form.appendChild(checkbox);
        form.appendChild(label);
        // break a line
        form.appendChild(document.createElement("br"));
    }
    // Create a button to generate the bingo cards
    let button = document.createElement("button");
    button.innerHTML = "Apply";
    button.onclick = function () {
        makeGrid("bingo_grid_p1", generateRandomSeed(), bingoGridSize);
    }
    applyDiv.appendChild(button);
    formDiv.appendChild(form);
}

function renderGridSizeConfig(gridSize) {
    if (gridSize) {
        bingoGridSize = gridSize;
    }
    let formDiv = document.getElementById("grid_size");
    let form = document.createElement("form");
    let label = document.createElement("label");
    label.htmlFor = "grid_size";
    label.appendChild(document.createTextNode("Grid size: "));
    form.appendChild(label);
    let gridSizeInput = document.createElement("input");
    gridSizeInput.type = "number";
    gridSizeInput.id = "grid_size";
    gridSizeInput.value = bingoGridSize.toString();
    gridSizeInput.min = "3";
    gridSizeInput.max = "6";
    gridSizeInput.onchange = function () {
        bingoGridSize = parseInt(gridSizeInput.value);
        makeGrid("bingo_grid_p1", generateRandomSeed(), bingoGridSize);
    }
    form.appendChild(gridSizeInput);
    formDiv.appendChild(form);
}

function renderConfig(gridSize) {
    renderCategoriesConfigForm();
    renderGridSizeConfig(gridSize);
}

// generate a random seed
function generateRandomSeed() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// xmur3 hash function
function xmur3(str) {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
        h = h << 13 | h >>> 19;
    return function() {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}

function regenerateGrid(htmlId) {
    makeGrid(htmlId, generateRandomSeed(), bingoGridSize);
}

window.onload = function () {
    // Check if there's a seed in the URL
    const urlParams = new URLSearchParams(window.location.search);
    let seed = urlParams.get('seed');
    if (!seed) {
        // If no seed in URL, generate a new one
        seed = generateRandomSeed();
    }
    let gridSize = urlParams.get('gridSize');
    renderConfig(gridSize);
    makeGrid("bingo_grid_p1", seed, gridSize);

    // Add a "Share" button
    let shareButton = document.createElement("button");
    shareButton.innerHTML = "Share";
    shareButton.onclick = function () {
        let shareUrl = `${window.location.origin}${window.location.pathname}?seed=${seed}&gridSize=${bingoGridSize}`;
        navigator.clipboard.writeText(shareUrl).then(function() {
            alert("Share link copied to clipboard!");
        }, function(err) {
            console.error('Could not copy text: ', err);
        });
    }
    document.body.appendChild(shareButton);
}