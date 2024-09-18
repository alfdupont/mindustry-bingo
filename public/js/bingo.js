let gridState = [];

const cellSizePx = 120;

/**
 * Create a square bingo grid with the given HTML id using random elements from the bingo array
 * @param {string} htmlId - The HTML id of the grid element
 * @param {string} seed - The seed for the random number generator
 * @param gridSize - The size of the grid
 */
function makeGrid(htmlId, seed, gridSize, categories) {
    let gridDiv = document.getElementById(htmlId);
    if (!gridSize) {
        gridSize = bingoGridSize;
    } else {
        gridSize = parseInt(gridSize);
    }
    let shuffledBingo = shuffle(bingo, seed, gridSize, categories);

    let gridItems = shuffledBingo.slice(0, gridSize * gridSize);
    let grid = document.createElement("table");
    gridState = Array(gridSize).fill().map(() => Array(gridSize).fill(0));

    let fragment = document.createDocumentFragment();
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
            row.appendChild(cell);
        }
        fragment.appendChild(row);
    }
    grid.appendChild(fragment);
    let gridWidth = gridSize * cellSizePx;
    let gridHeight = gridSize * cellSizePx;
    grid.style.width = `${gridWidth}px`;
    grid.style.height = `${gridHeight}px`;
    gridDiv.innerHTML = "";
    gridDiv.appendChild(grid);

    // Event delegation for click and contextmenu events
    grid.addEventListener('click', function (e) {
        let cell = e.target.closest('td');
        if (cell) {
            let row = cell.parentElement.rowIndex;
            let col = cell.cellIndex;
            toggleCell(cell, row, col, e.button === 0 ? 1 : 2);
        }
    });

    grid.addEventListener('contextmenu', function (e) {
        let cell = e.target.closest('td');
        if (cell) {
            e.preventDefault();
            let row = cell.parentElement.rowIndex;
            let col = cell.cellIndex;
            toggleCell(cell, row, col, 2);
        }
    });

    // Update the URL with the new seed, gridSize, and categories
    let categoriesParam = categories.join(',');
    window.history.replaceState({}, '', `${window.location.pathname}?seed=${seed}&gridSize=${gridSize}&categories=${categoriesParam}`);
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

    updateCellAppearance(element, gridState[row][col]);
    checkLineCompletion(row, col, player);
}

function checkLineCompletion(row, col, player) {
    let gridSize = gridState.length;
    let playerValue = player === 1 ? 1 : 2;
    let lineComplete = true;

    // Check row
    for (let i = 0; i < gridSize; i++) {
        if (gridState[row][i] !== playerValue && gridState[row][i] !== 3) {
            lineComplete = false;
            break;
        }
    }
    if (lineComplete) {
        animateLineCompletion(row, null);
        return;
    }

    // Check column
    lineComplete = true;
    for (let i = 0; i < gridSize; i++) {
        if (gridState[i][col] !== playerValue && gridState[i][col] !== 3) {
            lineComplete = false;
            break;
        }
    }
    if (lineComplete) {
        animateLineCompletion(null, col);
    }
}

function animateLineCompletion(row, col) {
    let gridSize = gridState.length;
    if (row !== null) {
        for (let i = 0; i < gridSize; i++) {
            let cell = document.querySelector(`#bingo_grid_p1 tr:nth-child(${row + 1}) td:nth-child(${i + 1})`);
            cell.classList.add('line-complete');
            setTimeout(() => cell.classList.remove('line-complete'), 1000);
        }
    } else if (col !== null) {
        for (let i = 0; i < gridSize; i++) {
            let cell = document.querySelector(`#bingo_grid_p1 tr:nth-child(${i + 1}) td:nth-child(${col + 1})`);
            cell.classList.add('line-complete');
            setTimeout(() => cell.classList.remove('line-complete'), 1000);
        }
    }
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
    console.error('No sprite found for description: ' + description)
    return fallbackSprite;
}

function renderCategoriesConfigForm(categories) {
    if (!categories) {
        categories = Object.keys(bingo);
    }
    allCategories = Object.keys(bingo);
    let formDiv = document.getElementById("categories");
    let applyDiv = document.getElementById("apply");
    let form = createCategoriesForm(allCategories, categories);
    let button = createApplyButton();
    applyDiv.appendChild(button);
    formDiv.appendChild(form);
}

function createCategoriesForm(allCategories, categories) {
    let form = document.createElement("form");
    for (const element of allCategories) {
        // Check if the category is selected
        let checked = categories.includes(element);
        let checkbox = createCheckbox(element, checked);
        let label = createLabel(element);
        form.appendChild(checkbox);
        form.appendChild(label);
        form.appendChild(document.createElement("br"));
    }
    return form;
}

function createCheckbox(element, checked) {
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = element;
    checkbox.checked = checked;
    return checkbox;
}

function createLabel(element) {
    let label = document.createElement("label");
    label.htmlFor = element;
    label.appendChild(document.createTextNode(element));
    return label;
}

function createApplyButton() {
    let button = document.createElement("button");
    button.innerHTML = "Apply";
    button.onclick = function () {
        let selectedCategories = Array.from(document.querySelectorAll("#categories input:checked")).map(checkbox => checkbox.id);
        makeGrid("bingo_grid_p1", generateRandomSeed(), bingoGridSize, selectedCategories);
    }
    return button;
}

function renderGridSizeConfig(gridSize) {
    if (gridSize) {
        bingoGridSize = gridSize;
    }
    let formDiv = document.getElementById("grid_size");
    let form = createGridSizeForm();
    formDiv.appendChild(form);
}

function createGridSizeForm() {
    let form = document.createElement("form");
    let label = createGridSizeLabel();
    form.appendChild(label);
    let gridSizeInput = createGridSizeInput();
    form.appendChild(gridSizeInput);
    return form;
}

function createGridSizeLabel() {
    let label = document.createElement("label");
    label.htmlFor = "grid_size";
    label.appendChild(document.createTextNode("Grid size: "));
    return label;
}

function createGridSizeInput() {
    let gridSizeInput = document.createElement("input");
    gridSizeInput.type = "number";
    gridSizeInput.id = "grid_size";
    gridSizeInput.value = bingoGridSize.toString();
    gridSizeInput.min = "3";
    gridSizeInput.max = "6";
    gridSizeInput.onchange = function () {
        let selectedCategories = Array.from(document.querySelectorAll("#categories input:checked")).map(checkbox => checkbox.id);
        bingoGridSize = parseInt(gridSizeInput.value);
        makeGrid("bingo_grid_p1", generateRandomSeed(), bingoGridSize, selectedCategories);
    }
    return gridSizeInput;
}

function renderConfig(gridSize, categories) {
    renderCategoriesConfigForm(categories);
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
    let selectedCategories = Array.from(document.querySelectorAll("#categories input:checked")).map(checkbox => checkbox.id);
    makeGrid(htmlId, generateRandomSeed(), bingoGridSize, selectedCategories);
}

window.onload = function () {
    // Check if there's a seed in the URL
    const urlParams = new URLSearchParams(window.location.search);
    let seed = urlParams.get('seed');
    if (!seed || !/^[a-z0-9]+$/i.test(seed)) {
        // If no valid seed in URL, generate a new one
        seed = generateRandomSeed();
    }

    let gridSize = urlParams.get('gridSize');
    if (!gridSize || isNaN(gridSize) || gridSize < 3 || gridSize > 6) {
        gridSize = bingoGridSize;
    } else {
        gridSize = parseInt(gridSize);
    }

    let categories = urlParams.get('categories');
    if (categories) {
        categories = categories.split(',');
    } else {
        categories = Object.keys(bingo);
    }

    renderConfig(gridSize, categories);
    makeGrid("bingo_grid_p1", seed, gridSize, categories);

    // Add a "Share" button
    let shareButton = document.createElement("button");
    shareButton.innerHTML = "Share";
    shareButton.onclick = function () {
        let shareUrl = `${window.location.origin}${window.location.pathname}?seed=${seed}&gridSize=${bingoGridSize}&categories=${categories.join(',')}`;
        navigator.clipboard.writeText(shareUrl).then(function() {
            alert("Share link copied to clipboard!");
        }, function(err) {
            console.error('Could not copy text: ', err);
            alert("Failed to copy share link. Please try again.");
        });
    }
    document.body.appendChild(shareButton);
}