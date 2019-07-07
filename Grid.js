class Grid {
    static element = document.getElementById('grid');
    static height = 0;
    static width = 0;
    static bombs = 0;
    static cells = 0;
    static revealedCells = [];
    static toReveal = [];
    static bombIcon = createElement('I', null, ['fas', 'fa-bomb']);

    static config() {
        this.height = Number(document.querySelector('input[name="gridSize"]:checked').dataset.height);
        this.width = Number(document.querySelector('input[name="gridSize"]:checked').dataset.width);
        this.bombs = Number(document.querySelector('input[name="gridSize"]:checked').dataset.bombs);
        this.cells = this.height * this.width;
    }

    static draw() {
        Grid.config();
        let grid = this.element;
        let width = this.width;
        let height = this.height;

        grid.innerHTML = "";

        for (let i = 0; i < height; i++) {
            let row = createElement('TR', 'row' + (i + 1));
            grid.appendChild(row);
            for (let j = 0; j < width; j++) {
                let cell = createElement('TD', 'cell' + (i * width + j + 1), ['cell', 'hidden']);
                row.appendChild(cell);
            }
        }

        document.querySelectorAll('.hidden')
            .forEach(cell => cell.addEventListener('click', eventGameStart));

        function eventGameStart() {
            document.querySelectorAll('.hidden')
                .forEach(cell => cell.removeEventListener('click', eventGameStart));

            Grid.fill(this);
        }
    }

    static fill(clickedCell) {
        let width = this.width;
        let height = this.height;
        let bombs = this.bombs;

        let clickedCell_id = Number(clickedCell.id.slice(4));

        let gridArray = [];
        for (let i = 0; i < height; i++) {
            gridArray[i] = [];
            for (let j = 0; j < width; j++) {
                gridArray[i].push(0);
            }
        }

        let k = 0;
        while (k < bombs) {
            let randRow = Math.floor(Math.random() * height);
            let randCell = Math.floor(Math.random() * width);
            if (gridArray[randRow][randCell] !== -1
                && !cellIsAroundClick(randRow * 16 + randCell + 1, clickedCell_id)) {
                gridArray[randRow][randCell] = -1;
                k++;
            }
        }

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                let cell = document.getElementById('cell' + (i * height + j + 1));
                if (gridArray[i][j] != -1) {
                    let count = 0;
                    if (gridArray[i][j - 1] == -1) count++;
                    if (gridArray[i][j + 1] == -1) count++;
                    if (i > 0 && gridArray[i - 1][j - 1] == -1) count++;
                    if (i > 0 && gridArray[i - 1][j] == -1) count++;
                    if (i > 0 && gridArray[i - 1][j + 1] == -1) count++;
                    if (i < height - 1 && gridArray[i + 1][j - 1] == -1) count++;
                    if (i < height - 1 && gridArray[i + 1][j] == -1) count++;
                    if (i < height - 1 && gridArray[i + 1][j + 1] == -1) count++;
                    gridArray[i][j] = count;
                    cell.innerHTML = count;
                    if (count == 0) cell.style.color = 'white';
                } else {
                    cell.innerHTML = "<i class='fas fa-bomb'></i>";
                }
            }
        }

        function cellIsAroundClick(randCell_id, clickedCell_id) {
            if (clickedCell_id == randCell_id) return true;
            if (clickedCell_id + 1 == randCell_id) return true;
            if (clickedCell_id - 1 == randCell_id) return true;
            if (clickedCell_id + width == randCell_id) return true;
            if (clickedCell_id + width + 1 == randCell_id) return true;
            if (clickedCell_id + width - 1 == randCell_id) return true;
            if (clickedCell_id - width == randCell_id) return true;
            if (clickedCell_id - width + 1 == randCell_id) return true;
            if (clickedCell_id - width - 1 == randCell_id) return true;
            return false;
        }

        Grid.reveal(clickedCell);
        Grid.setEvents();
    }

    static getSurroundingHiddenCells(cell) {
        let width = this.width;
        let height = this.height;
        let surroundingCells = [];
        let id = Number(cell.getAttribute('id').slice(4));

        // CASES AU-DESSUS
        if (id > width) {
            if ((id - 1) % height !== 0) {
                surroundingCells.push(
                    document.getElementById("cell" + (id - width - 1))
                );
            }
            surroundingCells.push(document.getElementById("cell" + (id - width)));
            if (id % height !== 0) {
                surroundingCells.push(
                    document.getElementById("cell" + (id - width + 1))
                );
            }
        }

        // CASES EN-DESSOUS
        if (id < width * height - width) {
            if ((id - 1) % height !== 0) {
                surroundingCells.push(
                    document.getElementById("cell" + (id + width - 1))
                );
            }
            surroundingCells.push(document.getElementById("cell" + (id + width)));
            if (id % height !== 0) {
                surroundingCells.push(
                    document.getElementById("cell" + (id + width + 1))
                );
            }
        }

        // CASE DEVANT
        if (id < width * height - 1 && id % height !== 0) {
            surroundingCells.push(document.getElementById("cell" + (id + 1)));
        }

        // CASE DERRIERE
        if (id > 1 && (id - 1) % height !== 0) {
            surroundingCells.push(document.getElementById("cell" + (id - 1)));
        }

        return surroundingCells.filter(cell => hasClass(cell, 'hidden'));
    }

    static reveal(cell) {
        if (cell.children.length) Grid.lose(cell);

        if (cell.innerText == '0') Grid.getSurroundingHiddenCells(cell).forEach(c => {
            if (Grid.toReveal.indexOf(c) == -1 && Grid.revealedCells.indexOf(c) == -1) Grid.toReveal.push(c);
        });

        if (hasClass(cell, 'hidden')) {
            cell.classList.remove('hidden');
            Grid.revealedCells.push(cell);
        } else {
            let bombsAround = cell.innerText;
            let cellsAround = Grid.getSurroundingHiddenCells(cell);
            let flagsAround = cellsAround.filter(cell => hasClass(cell, 'flagged')).length;
            if (flagsAround == bombsAround) {
                cellsAround.filter(cell => !hasClass(cell, 'flagged')).forEach(cell => Grid.toReveal.push(cell));
            }
        }

        if (Grid.toReveal.length) Grid.reveal(Grid.toReveal.splice(0, 1)[0]);

        if (Grid.height * Grid.width - Grid.bombs == Grid.revealedCells.length) Grid.win();
    }

    static setEvents() {
        // CLICK EVENT
        function clickHandler() {
            if (hasClass(this, "hidden") && !hasClass(this, "flagged")) Grid.reveal(this);
        }

        // RIGHT CLICK EVENT
        function rightClickHandler(e) {
            e.preventDefault();
            if (hasClass(this, "hidden")) {
                if (hasClass(this, "flagged")) {
                    this.classList.add('questioned');
                    this.classList.remove('flagged');
                } else if (hasClass(this, "questioned")) {
                    this.classList.remove('questioned');
                } else {
                    this.classList.add('flagged');
                }
            } else {
                this.addEventListener("mousedown", doubleRightClickHandler);
                this.addEventListener("mouseup", removeHandlers);
            }
        }

        // DOUBLE RIGHT CLICK EVENT
        function doubleRightClickHandler(e) {
            Grid.reveal(this);
        }

        function removeHandlers() {
            this.removeEventListener("mousedown", doubleRightClickHandler);
            this.removeEventListener("mouseup", removeHandlers);
        }

        document
            .querySelectorAll(".cell")
            .forEach(cell => cell.addEventListener("click", clickHandler));
        document
            .querySelectorAll(".cell")
            .forEach(cell => cell.addEventListener("contextmenu", rightClickHandler));

    }

    static lose(doomCell) {
        doomCell.children[0].style.transform = "scale(350)";
        doomCell.children[0].style.zIndex = "99";
        document.querySelectorAll("td").forEach(function (cell) {
            cell.classList.remove('hidden');
            cell.style.color = "firebrick";
        });
        setTimeout(function () {
            Grid.draw();
        }, 3000);
    }

    static win() {
        alert('Gratz !');
    }
}

function createElement(tag = 'DIV', id = null, classes = []) {
    let element = document.createElement(tag);
    if (id) {
        let attribute_id = document.createAttribute("id");
        attribute_id.value = id;
        element.setAttributeNode(attribute_id);
    }
    if (classes) {
        classes.forEach(_class => {
            element.classList.add(_class);
        });
    }
    return element;
}

function hasClass(element, className) {
    return (
        (" " + element.className + " ").indexOf(" " + className + " ") > -1
    );
}