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

const Player = (name, mark) => {
    return { name, mark };
}

const Game = (() => {
    let _players, _playing, _turn;

    const _getPlayerForMark = mark => _players.filter(p => p.mark === mark);

    const startGame = (player1, player2) => {
        _players = [player1, player2];
        _turn = 0;
        _playing = true;
    }

    const getGameStatus = () => _playing;

    const placeMark = (i, j) => {
        let mark = _players[_turn].mark;
        GameBoard.setMarkAtLoc(i, j, mark);
        _turn = Number(!_turn);
        return mark;
    }

    const evaluateGame = () => {
        const mark = GameBoard.checkWinner();
        if (mark) {
            const winner = _getPlayerForMark(mark);
            const result = winner.length > 0 ? `${winner[0].name} Win` : mark;
            _playing = false;
            GameBoard.resetBoard();
            return result;
        }
        return mark;
    }

    return {
        startGame, getGameStatus, placeMark, evaluateGame
    }
})();

const DisplayController = ((doc) => {
    const boardEl = doc.querySelector('.gameboard');
    const gameInfo = doc.querySelector('.game-info');
    const playBtn = gameInfo.querySelector('.btn-play');
    const playResult = gameInfo.querySelector('.result');

    const player1 = Player('Player1', 'x');
    const player2 = Player('Player2', 'o');

    const _addBoardElClick = () => {
        boardEl.addEventListener('click', (e) => {
            if (Game.getGameStatus()) {
                const cell = e.target;
                if (!cell.textContent) {
                    [i, j] = (cell.dataset.index.split(''));
                    const mark = Game.placeMark(i, j);
                    cell.textContent = mark;
                    const result = Game.evaluateGame();
                    if (result) {
                        _displayScore(result);
                    }
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

    const _displayScore = (result) => {
        boardEl.classList.remove('playing');
        gameInfo.style.display = 'block';
        playResult.textContent = result;
        _addPlayBtnClick();
    }

    const gameSetup = () => {
        Game.startGame(player1, player2);
        boardEl.classList.add('playing');
        gameInfo.style.display = 'none';
        _displayBoard();
        _addBoardElClick();
    }

    return { gameSetup };
})(document);

DisplayController.gameSetup();