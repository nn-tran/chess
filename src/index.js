import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'chess-merida-font/css/chessmerida-webfont.css';

//mailbox from https://www.chessprogramming.org/10x12_Board
const mailbox = [
     -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
     -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
     -1,  0,  1,  2,  3,  4,  5,  6,  7, -1,
     -1,  8,  9, 10, 11, 12, 13, 14, 15, -1,
     -1, 16, 17, 18, 19, 20, 21, 22, 23, -1,
     -1, 24, 25, 26, 27, 28, 29, 30, 31, -1,
     -1, 32, 33, 34, 35, 36, 37, 38, 39, -1,
     -1, 40, 41, 42, 43, 44, 45, 46, 47, -1,
     -1, 48, 49, 50, 51, 52, 53, 54, 55, -1,
     -1, 56, 57, 58, 59, 60, 61, 62, 63, -1,
     -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
     -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
];

const mailbox64 = [
    21, 22, 23, 24, 25, 26, 27, 28,
    31, 32, 33, 34, 35, 36, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48,
    51, 52, 53, 54, 55, 56, 57, 58,
    61, 62, 63, 64, 65, 66, 67, 68,
    71, 72, 73, 74, 75, 76, 77, 78,
    81, 82, 83, 84, 85, 86, 87, 88,
    91, 92, 93, 94, 95, 96, 97, 98
];

const data = {
    '\u2659':{ color: 1, hash: 0, name:  '', slide: false, offset: [ -9, -11 ], move: -10}, /* PAWN */
    '\u2658':{ color: 1, hash: 1, name: 'N', slide: false, offset: [ -21, -19,-12, -8, 8, 12, 19, 21 ], /* KNIGHT */ },
	'\u2657':{ color: 1, hash: 2, name: 'B', slide: true,  offset: [ -11,  -9,  9, 11 ], /* BISHOP */ },
	'\u2656':{ color: 1, hash: 3, name: 'R', slide: true,  offset: [ -10,  -1,  1, 10 ], /* ROOK */ },
	'\u2655':{ color: 1, hash: 4, name: 'Q', slide: true,  offset: [ -11, -10, -9, -1, 1,  9, 10, 11 ], /* QUEEN */ },
	'\u2654':{ color: 1, hash: 5, name: 'K', slide: false, offset: [ -11, -10, -9, -1, 1,  9, 10, 11 ],  /* KING */ },
    //black pieces
    '\u265f':{ color: 2, hash: 6, name:  '', slide: false, offset: [ 9, 11 ], move: 10}, /* PAWN */
    '\u265e':{ color: 2, hash: 7, name: 'N', slide: false, offset: [ -21, -19,-12, -8, 8, 12, 19, 21 ], /* KNIGHT */},
    '\u265d':{ color: 2, hash: 8, name: 'B', slide: true,  offset: [ -11,  -9,  9, 11 ], /* BISHOP */},
    '\u265c':{ color: 2, hash: 9,name: 'R', slide: true,  offset: [ -10,  -1,  1, 10 ], /* ROOK */},
    '\u265b':{ color: 2, hash: 10,name: 'Q', slide: true,  offset: [ -11, -10, -9, -1, 1,  9, 10, 11 ], /* QUEEN */},
    '\u265a':{ color: 2, hash: 11,name: 'K', slide: false, offset: [ -11, -10, -9, -1, 1,  9, 10, 11 ]  /* KING */},
};

//initialize a table of hashes for a modified Zobrist hashing
//https://www.chessprogramming.org/Zobrist_Hashing
function initRNGTable(){
  const table = [];
  for (let i = 0; i < 64; ++i){
    table.push([]);
    for (let j = 0; j < 12; ++j){
      table[i].push(Math.floor(Math.random() * 2**32));
    }
  }
  return table;
}

function Piece(props) {
  let display;
  switch (props.display){
    case '\u2654':
      display = "cm cm-w-king";
      break;
    case '\u2655':
      display = "cm cm-w-queen";
      break;
    case '\u2656':
      display = "cm cm-w-rook";
      break;
    case '\u2657':
      display = "cm cm-w-bishop";
      break;
    case '\u2658':
      display = "cm cm-w-knight";
      break;
    case '\u2659':
      display = "cm cm-w-pawn";
      break;
    case '\u265a':
      display = "cm cm-b-king";
      break;
    case '\u265b':
      display = "cm cm-b-queen";
      break;
    case '\u265c':
      display = "cm cm-b-rook";
      break;
    case '\u265d':
      display = "cm cm-b-bishop";
      break;
    case '\u265e':
      display = "cm cm-b-knight";
      break;
    case '\u265f':
      display = "cm cm-b-pawn";
      break;
    default:
  }
  return (
    <i
      className={display}
      aria-hidden="true"
    />);
}

function Square(props) {
  return (
    <button
      className = "square"
      onClick = {props.onClick}
      style={{backgroundColor: props.color}}
    >
      <Piece display={props.value}/>
    </button>
  );
}

function ReadOnlySquare(props) {
  return (
    <button
      className = "square"
      style = {{backgroundColor: "#fff", fontSize: "12px"}}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seedTable: [initRNGTable(), initRNGTable()],
      hash: [0, 0],
      extraSeed: Array(6),//for hashing other data
      //seed 0-4 is for castling, seed 5 for turn player, seed 6 for en passant
      squares: Array(64).fill(null),
      colors: Array(64).fill(null),
      //generate move per piece requires tracking pieces
      pieces: [48, 49, 50, 51, 52, 53, 54, 55,
               56, 57, 58, 59, 60, 61, 62, 63,//white
                8,  9, 10, 11, 12, 13, 14, 15,
                0,  1,  2,  3,  4,  5,  6,  7],//black

      halfMoveClock: 0,
      legals: Array(64).fill(0),
      canCastle: Array(4).fill(1),//white-long, white-short, black-long, black-short
      history: [[],[]],
      enPassant: -1,
      selected: -1,
      bNext: true,
      promoting: -1,
      promote: null,
      gameOver: 0,
    };


    const board = this.state.squares;
    //white pieces
    board[63] = '\u2656';
    board[62] = '\u2658';
    board[61] = '\u2657';
    board[60] = '\u2654';
    board[59] = '\u2655';
    board[58] = '\u2657';
    board[57] = '\u2658';
    board[56] = '\u2656';
    for (let i = 0; i < 8; ++i){
      board[i+48] = '\u2659';
      this.state.colors[i+48] = 1;
      this.state.colors[i+56] = 1;
    }
    //black pieces
    board[0] = '\u265c';
    board[1] = '\u265e';
    board[2] = '\u265d';
    board[3] = '\u265b';
    board[4] = '\u265a';
    board[5] = '\u265d';
    board[6] = '\u265e';
    board[7] = '\u265c';
    for (let i = 0; i < 8; ++i){
      board[i+8] = '\u265f';
      this.state.colors[i+8] = 2;
      this.state.colors[i] = 2;
    }

    for (let i = 0; i < this.state.extraSeed.length; ++i){
      this.state.extraSeed[i] = Math.floor(Math.random() * 2**32);
    }

    for (let i = 0; i < board.length; ++i){
      if (board[i] !== null){
        const j = data[this.state.squares[i]].hash;
        this.state.hash[0] ^= this.state.seedTable[0][i][j];
        this.state.hash[1] ^= this.state.seedTable[1][i][j];
      }
    }

    this.state.history[0].push(this.state.hash[0]);
    this.state.history[1].push(this.state.hash[1]);
  }

  //does not check if move is legal
  //returns a position object
  executeMove(p, start, final, type){
    const board = this.state.squares.slice();
    const colors = this.state.colors.slice();
    const castle = this.state.canCastle.slice();
    const pieces = this.state.pieces.slice();
    let enPassant = -1;

    if (board[final] !== null){
      pieces[this.state.pieces.indexOf(final)] = -1;//piece is captured.
    }

    pieces[p] = final;
    board[final] = board[start];
    board[start] = null;
    colors[final] = colors[start];
    colors[start] = null;

    if (type < 0) enPassant = -type;

    if (type < 3){
      castle[0] &= (start !== 56) && (start !== 60);//left white rook moved or white king moved
      castle[1] &= (start !== 63) && (start !== 60);//right white rook moved or white king moved
      castle[2] &= (start !==  0) && (start !==  4);//left black rook moved or black king moved
      castle[3] &= (start !==  7) && (start !==  4);//right white rook moved or black king moved

    } else if (type === 3){//en passant capture
      const direction = (final - start) > 0 ? (final - start - 8) : (final - start + 8);
      pieces[this.state.pieces.indexOf(start + direction)] = -1;
      board[start + direction] = null;
      colors[start + direction] = null;
    } else if (type < 8) {//castling, hard coded
      castle[type-4] = 0;//disable the type we just did
      switch(type){
        case 4://0-0-0
          castle[1] = 0;//disable the other way of castling (can't castle long after castling short, and vice versa)
          pieces[8] = 59;
          board[59] = board[56];
          colors[59] = colors[56];
          board[56] = null;
          colors[56] = null;//these 5 lines are just moving the rook
          break;
        case 5://0-0
          castle[0] = 0;
          pieces[15] = 61;
          board[61] = board[63];
          colors[61] = colors[63];
          board[63] = null;
          colors[63] = null;
          break;
        case 6://...0-0-0
          castle[3] = 0;
          pieces[24] = 3;
          board[3] = board[0];
          colors[3] = colors[0];
          board[0] = null;
          colors[0] = null;
          break;
        case 7://...0-0
          castle[2] = 0;
          pieces[31] = 5;
          board[5] = board[7];
          colors[5] = colors[7];
          board[7] = null;
          colors[7] = null;
          break;
        default://do nothing
      }
    } else {//promotion
      this.setState({promoting: final});
    }
    return {
      squares: board,
      colors: colors,
      pieces: pieces,
      canCastle: castle,
      enPassant: enPassant,
    };
  }

  realizeMove(p, start, final, type){
    const lastHash = this.hash(p,  start, final, type);
    this.setState({
          hash: lastHash,
          history: [
            [...this.state.history[0], lastHash[0]],
            [...this.state.history[1], lastHash[1]]
          ]
        });
    return this.executeMove(p,  start, final, type);
  }

  //use 2 32-bit hashes for the board instead of 1 64-bit hash because Javascript Number stops at 53 bit
  hash(p, start, final, type){
    const iterable = this.state.hash;
    const board = this.state.squares;
    for (let i = 0; i < 2; ++i){
      if (board[final] !== null)
        iterable[i] ^= this.state.seedTable[i][final][data[board[final]].hash];//remove captured piece if any
      iterable[i] ^= this.state.seedTable[i][start][data[board[start]].hash];//these lines represent piece moving
      iterable[i] ^= this.state.seedTable[i][final][data[board[start]].hash];
      for (let j = 0; j < this.state.canCastle.length; j++){
        iterable[i] ^= this.state.canCastle[j] && this.state.extraSeed[j];
      }
      iterable[i] ^= this.state.extraSeed[4];
      iterable[i] ^= this.state.extraSeed[5]*this.state.enPassant;
    }
    return iterable;
  }

  //generates pseudo-legal moves (moves that the pieces could make, but not necessarily results in a legal position)
  generateMoves(p){
    const i = this.state.pieces[p];
    let moves = [];
    if (i===-1) return moves;
    const board = this.state.squares;
    const colors = this.state.colors;
    const enemy = colors[i] === 1 ? 2 : 1;
    const pieceID = board[i];
    const piece = data[pieceID];
    if (piece.name){//non-pawns
      for (const offset of piece.offset){
        for (let n = i;;){
          n = mailbox[mailbox64[n] + offset];
          if (n === -1) break; /* outside board */
          if (colors[n] !== null) {
            if (colors[n] === enemy) moves.push([p, i, n, 2]); /* capture from i to n */
          break;
          }
          moves.push([p, i, n, 1]); /* quiet move from i to n */
          if (!piece.slide) break; /* next direction */
        }
      }
    } else {//pawns have custom behaviour
      for (const offset of piece.offset){//capturing diagonally forward
        let n = i;
        n = mailbox[mailbox64[n] + offset];
        if (n !== -1 && colors[n] === enemy){
          if ( (n <= 7 && n >= 0) || (n <= 63 && n >= 56))
          {//pawns reaching last rank must promote
            moves.push([p, i, n, 9]);
          } else moves.push([p, i, n, 2]);
        }
        else if (n !== -1 && this.state.enPassant === n) {//captures en passant
          moves.push([p, i, n, 3]);
        }
      }
      const n = mailbox[mailbox64[i] + piece.move];//moving forward
      if (colors[n] === null){
        if ( (n <= 7 && n >= 0) || (n <= 63 && n >= 56))
        {//pawns reaching last rank must promote
          moves.push([p, i, n, 8]);
        } else {
          moves.push([p, i, n, 1]);
          if ( (n <= 23 && n >= 16 && colors[i] === 2)
            || (n <= 47 && n >= 40 && colors[i] === 1))
          {//if the piece could land on the 3rd/6th rank, it must have started from the origin
            const m = mailbox[mailbox64[n] + piece.move];
            if (colors[m] === null) {
              moves.push([p, i, m, -n]);//type carries information required for en passant
            }
          }
        }
      }
    }
    if (pieceID === '\u2654' ){//castling, hard coded checks
      if (this.state.canCastle[0] && board[57] === null && board[58] === null && board[59] === null){
        moves.push([p,i,i-2,4]);
      }
      if (this.state.canCastle[1] && board[61] === null && board[62] === null){
        moves.push([p,i,i+2,5]);
      }
    } else if (pieceID === '\u265a'){
      if (this.state.canCastle[2] && board[1] === null && board[2] === null && board[3] === null){
        moves.push([p,i,i-2,6]);
      }
      if (this.state.canCastle[3] && board[5] === null && board[6] === null){
        moves.push([p,i,i+2,7]);
      }
    }

    return moves;
  }

  //take moves generated by generateMoves and remove illegal ones
  trimMoves(moves){
    return moves.filter(move => {
      if ((move[0] < 16) !== this.state.bNext) return false;
      switch (move[3]){
        case 4:
          return !(this.inDanger(60, this.state) & 2)
            && !(this.inDanger(59, this.state) & 2)
            && !(this.inDanger(58, this.state) & 2);
        case 5:
          return !(this.inDanger(60, this.state) & 2)
            && !(this.inDanger(61, this.state) & 2)
            && !(this.inDanger(62, this.state) & 2);
        case 6:
          return !(this.inDanger(4, this.state) & 1)
            && !(this.inDanger(3, this.state) & 1)
            && !(this.inDanger(2, this.state) & 1);
        case 7:
          return !(this.inDanger(4, this.state) & 1)
            && !(this.inDanger(5, this.state) & 1)
            && !(this.inDanger(6, this.state) & 1);
        default://do nothing
      }
      let position;
      //promoting is treated as the regular move
      if (move[3] >= 8) position = this.executeMove(move[0], move[1], move[2], move[3]-7);
      else position = this.executeMove(...move);
      const bNext = this.state.bNext;
      const wKing = position.pieces[12];
      const bKing = position.pieces[28];
      if (this.inDanger(wKing, position) & 2 && bNext) return false;
      else if (this.inDanger(bKing, position) & 1 && !bNext) return false;
      else return true;
    });
  }

  //check if square is being attacked
  //0 is not attacked
  //1 is attacked by white
  //2 is attacked by black
  //3 is attacked by both
  inDanger(i, position){
    let result = 0;
    for (const [pieceID, piece] of Object.entries(data)){
      for (const offset of piece.offset){
        //if a piece of the same color can already capture square i, skip this piece
        if (piece.color & result) continue;
        for (let n = i;;){
          n = mailbox[mailbox64[n] - offset];//reversed offset for calculating backwards, only relevant for pawns
          if (n === -1) break; /* outside board */
          if (position.squares[n] === pieceID){
            result |= piece.color;
            break;
          } else if (position.squares[n]) break;//ray cast stops when a piece is found
          if (!piece.slide) break; /* next direction */
        }
      }
    }

    return result;
  }

  //updates squares available to the focused piece
  updateLegals(i){
    const p = this.state.pieces.indexOf(i);
    let legals = Array(64).fill(0);
    if (p>=0) {
      const moves = this.trimMoves(this.generateMoves(p));
      for (const move of moves) {
        legals[move[2]] = move[3];
      }
    }
    this.setState({legals: legals});
  }

  checkEndGame(){
    let l = 0;
    for (let i = 0; i < 32; ++i){
      l += this.trimMoves(this.generateMoves(i)).length;
    }
    if (l === 0 ) {
      this.setState({gameOver: 1});
      return;
    }

    let repeat = 0;
    const hashList = this.state.history;
    const lastHash = this.state.hash;
    for (let i = 0; i < hashList[0].length; ++i){
      if (hashList[0][i] !== lastHash[0] || hashList[1][i] !== lastHash[1]){
        continue;
      } else repeat++;
    }
    if (repeat >= 3 ) {
      this.setState({gameOver: 2});
      return;
    }

    if (this.state.halfMoveClock >= 50) {
      this.setState({gameOver: 3});
      return;
    }

  }

  //just handle clicking a square
  handleClick(i){
    if (this.state.promoting >= 0) return;//promoting, board locked
    if (this.state.gameOver) return;
    const squares = this.state.squares.slice();
    const selected = this.state.selected;
    if (selected === -1 //haven't clicked
       || selected === i //clicked the same square
       || squares[selected] === null //clicked an empty square
       || this.state.legals[i] === 0 //clicked an illegal square
       ) {
      this.updateLegals(i);
      this.setState({selected: i});
    } else {
      const p = this.state.pieces.indexOf(selected);
      const position = this.realizeMove(p, selected, i, this.state.legals[i]);//move from selected to current square
      let halfMove = this.state.halfMoveClock;
      if (this.state.squares[i] === "\u2659" || this.state.squares[i] === "\u265f") halfMove = 0;
      else halfMove++;
      this.setState({
        halfMoveClock: halfMove,
        selected: -1,
        squares: position.squares,
        colors: position.colors,
        pieces: position.pieces,
        canCastle: position.canCastle,
        enPassant: position.enPassant,
        legals: Array(64).fill(0),
        bNext:!this.state.bNext,
      }, this.checkEndGame);
    }
  }

  handleClickPromote(i){
    const promoting = this.state.promoting;
    const board = this.state.squares;
    board[promoting] = i;
    this.setState({
      promoting: -1,
      promote: i,
      squares: board,
    });
  }

  renderSquare(i) {
    const legal = !(this.state.legals[i] === 0);
    //processing for square color
    let color = '';
    if (this.state.selected === i) color = "#2f2";
    if ( ((i&7)+(i>>3)) % 2 === 1){//checkerboard pattern
      if (this.state.selected !== i) color = "#7d8796";
      else color = "#0d0";
      if (legal) color = "#bbbb00";
    } else if (legal) color = "#ffff00";
    const wKing = this.state.pieces[12];
    const bKing = this.state.pieces[28];
    if ((wKing === i && this.inDanger(wKing, this.state) & 2 && this.state.bNext)
      ||(bKing === i && this.inDanger(bKing, this.state) & 1 && !this.state.bNext))
     color = "#f44";
    return (
    <td key={i}>
    <Square
      value={this.state.squares[i]}
      color={color}
      onClick={() => this.handleClick(i)}
    />
    </td>
    );
  }

  renderPromoteSquare(i){
    if (this.state.promoting < 0) return null;//only visible for promotion
    if ((data[i].color === 2) !== this.state.bNext) return null;//show the right color
    return (
    <td key={i}>
    <Square
      value={i}
      onClick={() => this.handleClickPromote(i)}
    />
    </td>
    );
  }

  render() {
    const player = 'Next player: ' + (this.state.bNext ? 'White' : 'Black');
    let gameOverStatus = null;
    if (this.state.gameOver === 1){
      const bNext = this.state.bNext;
      const wKing = this.state.pieces[12];
      const bKing = this.state.pieces[28];
      if (this.inDanger(wKing, this.state) & 2 && bNext) gameOverStatus = 'Black wins';
      else if (this.inDanger(bKing, this.state) & 1 && !bNext) gameOverStatus = 'White wins';
      else gameOverStatus = 'Stalemate';
    } else if (this.state.gameOver === 2) gameOverStatus = 'Draw by 3-fold repetition';
    else if (this.state.gameOver === 3) gameOverStatus = 'Draw by inactivity';

    const squares = [];
    for (let i = 0; i < 8; i++){
      const row = [];
      for (let j = 0; j < 8; j++){
        row.push(this.renderSquare(i*8+j));
      }
      const fullRow =
        <tr className="board-row" key={8-i}>
          <td><ReadOnlySquare value = {8-i} color = {'white'}/></td>
          {row}
          <td><ReadOnlySquare value = {8-i} color = {'white'}/></td>
        </tr>;
      squares.push(fullRow);
    }
    const columnChars = " abcdefgh\t";
    const columns = [];
    for (const c of columnChars){
      const cSquare = <td key = {c}><ReadOnlySquare value = {c} color = {'white'} /></td>;
      columns.push(cSquare);
    }

    const promotePieces = [];
    for (let i = 0; i < 3; ++i){
      const align = <ReadOnlySquare value = {' '} key = {i}/>;
      promotePieces.push(align);
    }
    //promotion order is from most to least common
    //white promoting
    promotePieces.push(this.renderPromoteSquare('\u2655'));
    promotePieces.push(this.renderPromoteSquare('\u2658'));
    promotePieces.push(this.renderPromoteSquare('\u2656'));
    promotePieces.push(this.renderPromoteSquare('\u2657'));
    //black promoting
    promotePieces.push(this.renderPromoteSquare('\u265b'));
    promotePieces.push(this.renderPromoteSquare('\u265e'));
    promotePieces.push(this.renderPromoteSquare('\u265c'));
    promotePieces.push(this.renderPromoteSquare('\u265d'));

    return (
      <div>
        <div className="status">{player}</div>
        <table
          className="board"
          style={{borderCollapse: "collapse"}}
        >
          <tbody>
            <tr>{columns}</tr>
            {squares}
            <tr>{columns}</tr>
          </tbody>
        </table>
        {promotePieces}
        <div className="gameOver">
          {gameOverStatus}
        </div>
      </div>
    );
  }
}


class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
