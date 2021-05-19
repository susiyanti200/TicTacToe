const GameBoard = (() => {
    let _board = [['', '', ''], ['', '', ''], ['', '', '']];

    const getMarkAtLoc = (i, j) => _board[i][j];

    const setMarkAtLoc = (i, j, mark) => _board[i][j] = mark;

    const getBoardSize = () => [_board.length, _board[0].length];

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
        return !_board.some(row => row.includes('')) && 'Tie';
    }

    const resetBoard = () => {
        _board = [['', '', ''], ['', '', ''], ['', '', '']];
    }

    return {
        getMarkAtLoc, setMarkAtLoc, getBoardSize, checkWinner, resetBoard
    };
})();

const Player = (name, mark, type) => {
    return { name, mark, type };
}

const Computer = (name, mark, type, level) => {
    const prototype = Player(name, mark, type);

    const findRandomMove = () => {
        const i = Math.floor(Math.random() * 3);
        const j = Math.floor(Math.random() * 3);
        return [i, j];
    }

    const makeMove = () => {
        return findRandomMove();
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
            const result = winner.length > 0 ? `${winner[0].name} Win` : mark;
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

    const player1 = Player('Player1', 'x', 'Human');
    const comp1 = Computer('Computer1', 'o', 'Computer', 'Easy');

    const _addBoardElClick = () => {
        boardEl.addEventListener('click', (e) => {
            let player = Game.getPlayerAtTurn();
            if (Game.getGameStatus() && player.type === 'Human') {
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
        boardEl.classList.remove('playing');
        gameInfo.style.display = 'block';
        playResult.textContent = result;
        _addPlayBtnClick();
    }

    const displayMarkAt = (i, j, mark) => {
        GameBoard.setMarkAtLoc(i, j, mark);
        const cell = boardEl.querySelector(`[data-index="${i}${j}"]`);
        cell.textContent = mark;
    }

    const gameSetup = () => {
        Game.startGame(player1, comp1);
        boardEl.classList.add('playing');
        gameInfo.style.display = 'none';
        _displayBoard();
        _addBoardElClick();
        Game.playTurn();
    }

    return { gameSetup, displayMarkAt, displayScore };
})(document);

DisplayController.gameSetup();