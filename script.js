const GameBoard = (() => {
    let _board = [['', '', ''], ['', '', ''], ['', '', '']];

    const getMarkAtLoc = (i, j) => _board[i][j];

    const setMarkAtLoc = (i, j, mark) => _board[i][j] = mark;

    const getBoardSize = () => [_board.length, _board[0].length];

    const isMovesLeft = () => _board.some(row => row.includes(''));

    const checkWinner = () => {
        // find winner through combination
        if (_board[0][0] && (_board[0][0] === _board[1][1]) && (_board[0][0] === _board[2][2])) {
            return _board[0][0];
        }
        if (_board[0][2] && (_board[0][2] === _board[1][1]) && (_board[0][2] === _board[2][0])) {
            return _board[0][2];
        }
        for (let i = 0; i < _board.length; i++) {
            if (_board[i][0] && (_board[i][0] === _board[i][1]) && (_board[i][0] === _board[i][2])) {
                return _board[i][0];
            }
            if (_board[0][i] && (_board[0][i] === _board[1][i]) && (_board[0][i] === _board[2][i])) {
                return _board[0][i];
            }
        }
        // if all space are fill out and no winner then it's a Tie
        return !isMovesLeft() && 'Tie';
    }

    const resetBoard = () => {
        _board = [['', '', ''], ['', '', ''], ['', '', '']];
    }

    return {
        getMarkAtLoc, setMarkAtLoc, getBoardSize, checkWinner, resetBoard, isMovesLeft
    };
})();

const Player = (name, mark, type) => {
    return { name, mark, type };
}

const Computer = (name, mark, type, level) => {
    const prototype = Player(name, mark, type);
    const opponentMark = mark === 'X' ? 'O' : 'X';
    const [row, col] = GameBoard.getBoardSize();
    const _findRandomMove = () => {
        const i = Math.floor(Math.random() * 3);
        const j = Math.floor(Math.random() * 3);
        return [i, j];
    }

    const _evaluate = () => {
        const result = GameBoard.checkWinner();
        if (result === mark) return 10;
        if (result === opponentMark) return -10;
        return 0;
    }

    const _minimax = (depth, isMax) => {
        const score = _evaluate();
        let best;
        if (score === 10 || score === -10) return score;
        if (!GameBoard.isMovesLeft()) return 0;
        if (isMax) {
            best = -1000;
            for (let i = 0; i < row; i++) {
                for (let j = 0; j < col; j++) {
                    if (GameBoard.getMarkAtLoc(i, j) === '') {
                        GameBoard.setMarkAtLoc(i, j, mark);
                        best = Math.max(best, _minimax(depth + 1, !isMax));
                        GameBoard.setMarkAtLoc(i, j, '');
                    }
                }
            }
            return best;
        } else {
            best = 1000;
            for (let i = 0; i < row; i++) {
                for (let j = 0; j < col; j++) {
                    if (GameBoard.getMarkAtLoc(i, j) === '') {
                        GameBoard.setMarkAtLoc(i, j, opponentMark);
                        best = Math.min(best, _minimax(depth + 1, !isMax));
                        GameBoard.setMarkAtLoc(i, j, '');
                    }
                }
            }
            return best;
        }
    }

    const _findBestMove = () => {
        let bestVal = -1000;
        let bestMove = [-1, -1];
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                if (GameBoard.getMarkAtLoc(i, j) === '') {
                    GameBoard.setMarkAtLoc(i, j, mark);
                    const moveVal = _minimax(0, false);
                    GameBoard.setMarkAtLoc(i, j, '');
                    if (moveVal > bestVal) {
                        bestMove = [i, j];
                        bestVal = moveVal;
                    }
                }
            }
        }
        return bestMove;
    }

    const makeMove = () => {
        if (level === 'Easy') return _findRandomMove();
        return _findBestMove();
    }

    return Object.assign({}, prototype, { level, makeMove });
}

const Game = (() => {
    let _players, _playing, _turn;

    const _getPlayerForMark = mark => _players.filter(p => p.mark === mark);

    const _changeTurn = () => _turn = Number(!_turn);

    const getPlayerAtTurn = () => _players[_turn];

    const startGame = (player1, player2) => {
        GameBoard.resetBoard();
        _players = [player1, player2];
        _turn = 0;
        _playing = true;
    }

    const getGameStatus = () => _playing;

    const _checkGameResult = () => {
        const mark = GameBoard.checkWinner();
        if (mark) {
            _playing = false;
            const winner = _getPlayerForMark(mark);
            const result = winner.length > 0 ? winner[0] : mark;
            DisplayController.displayScore(result);
        }
    }

    const evaluateGame = () => {
        _checkGameResult();
        if (getGameStatus()) {
            _changeTurn();
            playTurn();
        }
    }

    const playTurn = () => {
        if (getGameStatus()) {
            let player = getPlayerAtTurn();
            if (player.type === 'Computer') {
                do {
                    [i, j] = player.makeMove();
                    boardMark = GameBoard.getMarkAtLoc(i, j);
                } while (boardMark);
                DisplayController.displayMarkAt(i, j, player.mark);
                evaluateGame();
            }
        }
    }

    return {
        startGame, getGameStatus, evaluateGame, getPlayerAtTurn, playTurn
    }
})();

const DisplayController = ((doc) => {
    const boardEl = doc.querySelector('.gameboard');
    const gameInfo = doc.querySelector('.game-info');
    const playBtn = gameInfo.querySelector('.btn-play');
    const playResult = gameInfo.querySelector('.result');
    const icon = gameInfo.querySelector('.material-icons-outlined');
    const newBtn = gameInfo.querySelector('.btn-new');
    const starting = doc.querySelector('.starting');
    const choices = doc.querySelectorAll('.choice');
    const symbols = doc.querySelectorAll('.symbols');
    const nameEl = doc.querySelector('#name');
    const startBtn = doc.querySelector('.btn-start');
    const errEl = doc.querySelector('.error');
    let opponentConf = {}, chooseMark, player1, player2;

    const _addBoardElClick = () => {
        boardEl.addEventListener('click', (e) => {
            let player = Game.getPlayerAtTurn();
            if (Game.getGameStatus() && player.type === 'Player') {
                const cell = e.target;
                if (!cell.textContent) {
                    [i, j] = (cell.dataset.index.split(''));
                    displayMarkAt(i, j, player.mark);
                    Game.evaluateGame();
                }
            }
        });
    }

    const _addPlayBtnClick = () => {
        playBtn.addEventListener('click', () => {
            gameSetup();
        });
    }

    const _addNewBtnClick = () => {
        newBtn.addEventListener('click', () => {
            welcome();
        });
    }

    const _addStartBtnClick = () => {
        startBtn.addEventListener('click', () => {
            const name = nameEl.value;
            console.log(opponentConf.type);
            if (chooseMark && name && opponentConf.type !== undefined) {
                player1 = Player(name, chooseMark, 'Player');
                if (opponentConf.type === 'Player') {
                    player2 = Player('Player2', chooseMark === 'X' ? 'O' : 'X', opponentConf.type);
                } else {
                    player2 = Computer(`AI-${opponentConf.level}`, chooseMark === 'X' ? 'O' : 'X', opponentConf.type, opponentConf.level);
                }
                gameSetup();
            } else {
                if (!name) errEl.textContent = 'Type your name!';
                if (!chooseMark) errEl.textContent = 'Choose your symbol!';
                if (opponentConf.type === undefined) errEl.textContent = 'Choose your opponent!';
            }
        });
    }

    const _removeChoose = (choices) => {
        choices.forEach(choice => {
            choice.classList.remove('clicked');
        })
    }

    const _addChooseOponent = () => {
        choices.forEach((choice) => {
            choice.addEventListener('click', (e) => {
                _removeChoose(choices);
                Object.assign(opponentConf, e.currentTarget.dataset);
                e.currentTarget.classList.add('clicked');
            })
        });
    }

    const _addChooseMark = () => {
        symbols.forEach((choice) => {
            choice.addEventListener('click', (e) => {
                _removeChoose(symbols);
                chooseMark = e.target.dataset.mark;
                e.currentTarget.classList.add('clicked');
            })
        });
    }

    const _displayBoard = () => {
        boardEl.textContent = '';
        [row, col] = GameBoard.getBoardSize();
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                const cell = document.createElement('div');
                cell.textContent = GameBoard.getMarkAtLoc(i, j);
                cell.dataset.index = i + '' + j;
                boardEl.appendChild(cell);
            }
        }
    }

    const displayScore = (result) => {
        gameInfo.style.display = 'block';
        if (result !== 'Tie') {
            if (result.type === 'Player') {
                icon.textContent = 'face';
            } else {
                icon.textContent = 'smart_toy';
            }
            playResult.textContent = `${result.name} Win!`;
        } else {
            playResult.textContent = result;
        }
    }

    const displayMarkAt = (i, j, mark) => {
        GameBoard.setMarkAtLoc(i, j, mark);
        const cell = boardEl.querySelector(`[data-index="${i}${j}"]`);
        cell.textContent = mark;
    }

    const gameSetup = () => {
        if (player1.mark === 'X') {
            Game.startGame(player1, player2);
        } else {
            Game.startGame(player2, player1);
        }
        starting.style.display = 'none';
        gameInfo.style.display = 'none';
        icon.textContent = '';
        boardEl.classList.add('playing');
        _displayBoard();
        Game.playTurn();
    }

    const welcome = () => {
        boardEl.classList.remove('playing');
        gameInfo.style.display = 'none';
        icon.textContent = '';
        starting.style.display = 'block';
        opponentConf = {};
        chooseMark = '';
        _removeChoose(choices);
        _removeChoose(symbols);
        nameEl.value = '';
        errEl.textContent = '';
    }

    const init = () => {
        _addChooseOponent();
        _addChooseMark();
        _addStartBtnClick();
        _addBoardElClick();
        _addPlayBtnClick();
        _addNewBtnClick();
        welcome();
    }

    return { gameSetup, displayMarkAt, displayScore, welcome, init };
})(document);

DisplayController.init();