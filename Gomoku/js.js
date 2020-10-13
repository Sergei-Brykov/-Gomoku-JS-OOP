let c = console.log

class Dots {
  constructor() {
    this._dots = {}
  }
  add(dot, row, col) {
    if (this._dots[row] === undefined) {
      this._dots[row] = {}
    }
    this._dots[row][col] = dot
  }
  get(row, col) {
    if (this._dots[row] && this._dots[row][col]) {
      return this._dots[row][col]
    } else return undefined
  }
}
class Dot {
  constructor(gamer, elem, row, col, dots) {
    this._gamer = gamer;
    this._elem = elem;
    this._row = row;
    this._col = col;
    this._dots = dots;

    this._neighbors = {};

    this._findNeighbors()
    this._notiflyNeighbors()
    this._reflect()
  }
  getRow() {
    return this._row
  }
  getCol() {
    return this._col
  }
  becomeWiner() {
    this._elem.classList.add('winer')
  }
  getNeighbor(subRow, subCol) {
    if (this._neighbors[subRow] !== undefined) {
      return this._neighbors[subRow][subCol]
    } else return undefined
  }
  addNeighbor(neighbor) {
    let subRow = neighbor.getRow() - this._row
    let subCol = neighbor.getCol() - this._col
    if (this._neighbors[subRow] === undefined) {
      this._neighbors[subRow] = {}
    }
    this._neighbors[subRow][subCol] = neighbor
    
  }
  _findNeighbors() {
    this._considerNeighbors(1, - 1);
    this._considerNeighbors(1, 0);
    this._considerNeighbors(1, 1);
    this._considerNeighbors(-1, -1);
    this._considerNeighbors(-1, 0);
    this._considerNeighbors(-1, 1);
    this._considerNeighbors(0, -1);
    this._considerNeighbors(0, 1);
  }
  _considerNeighbors(subRow, subCol) {
    let neighbor = this._dots.get(this._row + subRow, this._col + subCol)

    if (neighbor && neighbor.belongsTo(this._gamer)) {
      this.addNeighbor(neighbor);
    }
  }
  _notiflyNeighbors() {
    for (const rowKey in this._neighbors) {
      for (const colKey in this._neighbors[rowKey]) {
        this._neighbors[rowKey][colKey].addNeighbor(this)
      }
    }
  }
  _reflect() {
    this._elem.classList.add('gamer');
    this._elem.classList.add(this._gamer);
  }
  belongsTo(gamer) {
    return this._gamer == gamer
  }
}
class HTML {
  createTable(parent, rowNum, colNum) {
    let table = document.createElement('table')
    for (let i = 1; i <= rowNum; i++) {
      let tr = document.createElement('tr')
      for (let j = 1; j <= colNum; j++) {
        let td = document.createElement('td')
        tr.appendChild(td)

      }
      table.appendChild(tr)
    }
    parent.appendChild(table)
  }

  getPrevSiblingNum(elem) {
    let prev = elem.previousSibling;
    let i = 0;

    while (prev) {
      prev = prev.previousSibling;
      i++
    }
    return i
  }
}
class Counter {
  constructor(length) {
    this._length = length;
    this._counter = 0;
  }
  get() {
    this._counter++;
    if (this._counter == this._length) {
      this._counter = 0
    }
    return this._counter;
  }
}

class Queue {
  constructor(gamers) {
    this._gamers = gamers;
    this._counter = new Counter(this._gamers.length)

  }

  getGamers() {
    return this._gamers[this._counter.get()]
  }
  
}

class Field {
  constructor(selector, rowsNum, colsNum, selectorDisplayGamer) {
    this._gameEnd = false;

    this._field = document.querySelector(selector);
    this._displayGamer = document.querySelector(selectorDisplayGamer);
    this._rowsNum = rowsNum;
    this._colsNum = colsNum;

    this._dots = new Dots;
    this._html = new HTML;
    this._queue = new Queue(['player1', 'player2']);


    this._html.createTable(this._field, this._rowsNum, this._colsNum)
    this._run()
  }
  _run() {
    this._field.addEventListener('click', () => {
      let cell = event.target.closest('td:not(.gamer)')
      let gamer = this._queue.getGamers();
      if (!this._gameEnd && cell) {
        let row = this._html.getPrevSiblingNum(cell.parentElement);
        let col = this._html.getPrevSiblingNum(cell);

        
        let dot = new Dot(gamer, cell, row, col, this._dots)
        this._dots.add(dot, row, col);
        

        let winLine = this._checkWin(dot);
        if (winLine){
          this._win(winLine)
        }

      }
      this.changeDisplayGamers(gamer)
    })
  }
  changeDisplayGamers(gamer){
    this._displayGamer.innerHTML = gamer
    this._displayGamer.classList = '';
    this._displayGamer.classList.add(gamer);
  }

  _checkDir(dot, subRow, subCol) {
    let result = [];
    let neighbor = dot;

    while (true) {
      neighbor = neighbor.getNeighbor(subRow, subCol)
      if (neighbor) {
        result.push(neighbor)
      } else return result
    }
  }

  _checkLine(dot, subRow, subCol) {
    let dir1 = this._checkDir(dot, subRow, subCol)
    let dir2 = this._checkDir(dot, -subRow, -subCol)

    return [].concat(dir1, [dot], dir2)
  }

  _checkWin(dot) {
    let dirs = [
      { deltaRow: 0, deltaCol: -1 },
      { deltaRow: -1, deltaCol: -1 },
      { deltaRow: -1, deltaCol: 0 },
      { deltaRow: -1, deltaCol: 1 }
    ]

    for(let i = 0; i < dirs.length; i++){
      let line = this._checkLine(dot, dirs[i].deltaRow, dirs[i].deltaCol)
      if(line.length >= 5){
        return line
      } 
    }
    return false
  }

  _win(winLine){
    this._gameEnd = true;
    this._notiflyWinerCells(winLine)
  }

  _notiflyWinerCells(winLine){
    winLine.forEach((dot) =>{
      dot.becomeWiner()
    });
  }

}

let start = document.getElementById('start')
start.addEventListener('click', startGame)

function startGame(){
  new Field('#game', 19, 19, '#gamers')
  start.removeEventListener('click', startGame)
}