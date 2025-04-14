import opponentBoardMock from "../mock/opponentBoard.js";
import Board from "../models/board.js";
import { smartBotAttack } from "../robot/intelligentAttack.js";
import { randomizeOpponentShips } from "../robot/randomShipPlacement.js";

const playerBoard = new Board();
let opponentBoard = new Board();

// Função para verificar se todos os navios foram afundados
function checkAllShipsSunk(board) {
    return board.ships.every(ship => 
        ship.positions.every(([row, col]) => board.hits[row][col])
    );
}

const getBoard = (_, res) => {
    try {
        const grid = playerBoard.getGrid();
        const ships = playerBoard.getShips();
        
        // Retorna o tabuleiro com status 200 (sucesso)
        res.status(200).json({
            message: "Tabuleiro obtido com sucesso!",
            grid,
            ships
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erro ao obter o tabuleiro!",
            error: error.message
        });
    }
};

const resetBoard = (_, res) => {
    try {
        playerBoard.resetBoard();
        opponentBoard.resetBoard();
        
        res.status(200).json({
            message: "Tabuleiro resetado com sucesso!",
            grid: playerBoard.getGrid()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erro ao resetar o tabuleiro!",
            error: error.message
        });
    }
};

const addShip = (req, res) => {
    const { type, row, column, direction } = req.body;
    
    if (!type || row === undefined || column === undefined || !direction) {
        return res.status(400).json({ message: "Todos os campos (type, row, column, direction) são obrigatórios!" });
    }

    try {
        playerBoard.addShip({ type, row, column, direction });
        
        res.status(201).json({
            message: "Navio adicionado com sucesso!",
            grid: playerBoard.getGrid(),
            ships: playerBoard.getShips()
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Erro ao adicionar o navio.",
            error: error.message
        });
    }
};

// Função para inicializar o tabuleiro do oponente com navios posicionados aleatoriamente
function initializeOpponentBoardRandomly() {
    return randomizeOpponentShips(opponentBoard);
}

// 🚨 REMOVER FUNÇÃO DEPOIS QUE IMPLEMENTAR A IA 🚨
function initializeOpponentBoardWithMock() {
    try {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (opponentBoardMock.grid[i][j] !== null) {
                    opponentBoard.grid[i][j] = opponentBoardMock.grid[i][j];
                }
            }
        }
        
        opponentBoardMock.ships.forEach(ship => {
            opponentBoard.ships.push({
                type: ship.type,
                positions: [...ship.positions]
            });
        });
        
        console.log("Tabuleiro do oponente carregado com sucesso a partir do mock!");
        return { success: true, message: "Tabuleiro do oponente inicializado com sucesso!" };
    } catch (error) {
        console.error("Erro ao inicializar tabuleiro do oponente:", error);
        return { success: false, message: error.message };
    }
}

const attack = (req, res) => { 
    const { row, column } = req.body;

    if (row === undefined || column === undefined) {
        return res.status(400).json({
            message: "As coordenadas do ataque (row, column) são obrigatórias!"
        });
    }

    try {
        // Verifica se o jogo já terminou
        if (playerBoard.gameOver || opponentBoard.gameOver) {
            return res.status(400).json({
                message: "O jogo já terminou! Inicie um novo jogo."
            });
        }

        const playerResult = opponentBoard.placeBomb(row, column);
        
        // Verifica se o jogador ganhou
        const playerWon = checkAllShipsSunk(opponentBoard);
        if (playerWon) {
            opponentBoard.gameOver = true;
            playerBoard.gameOver = true;
        }
        
        // Array para armazenar os ataques do bot
        let botAttacks = [];
        let botContinueAttacking = true;
        let botWon = false;
        
        // Bot só ataca se o jogador não tiver ganhado ainda
        if (!playerWon) {
            // Bot continua atacando enquanto acertar e não tiver destruído o navio
            while (botContinueAttacking) {
                const [botRow, botCol] = smartBotAttack(playerBoard);
                const botResult = playerBoard.placeBomb(botRow, botCol);
                
                botAttacks.push({
                    row: botRow,
                    column: botCol,
                    ...botResult
                });
                
                // Verifica se o bot deve continuar atacando (acertou, mas não destruiu)
                botContinueAttacking = botResult.hit && !botResult.destroyed;
                
                console.log(`Bot atacou (${botRow}, ${botCol}): ${botResult.hit ? 'ACERTOU' : 'ERROU'}`);
                if (botResult.destroyed) {
                    console.log(`Bot DESTRUIU um ${botResult.shipType}!`);
                }

                // Verifica se o bot ganhou
                botWon = checkAllShipsSunk(playerBoard);
                if (botWon) {
                    opponentBoard.gameOver = true;
                    playerBoard.gameOver = true;
                    break; // Interrompe os ataques do bot, pois ele já venceu
                }
            }
        }

        res.status(200).json({
            playerAttack: {
                row, column,
                ...playerResult
            },
            botAttacks: botAttacks,
            gameState: {
                isGameOver: playerWon || botWon,
                winner: playerWon ? 'player' : (botWon ? 'bot' : null),
                message: playerWon ? 'Você venceu! Todos os navios inimigos foram destruídos!' : 
                        (botWon ? 'Você perdeu! Todos os seus navios foram destruídos!' : null)
            }
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Erro ao realizar o ataque.",
            error: error.message
        });
    }
};

const startGame = (_, res) => {
    try {
        opponentBoard.resetBoard();
        
        // Resetar o estado de gameOver explicitamente
        playerBoard.gameOver = false;
        opponentBoard.gameOver = false;
        
        // Usar posicionamento aleatório em vez do mock
        const opponentResult = initializeOpponentBoardRandomly();
        
        if (!opponentResult.success) {
            return res.status(500).json({
                message: "Erro ao inicializar o jogo",
                error: opponentResult.message
            });
        }
        
        res.status(200).json({
            message: "Novo jogo iniciado com sucesso!",
            playerGrid: playerBoard.getGrid()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erro ao iniciar novo jogo!",
            error: error.message
        });
    }
};

const getGameState = (_, res) => {
    try {
        // Verificar se algum jogador venceu
        const playerWon = checkAllShipsSunk(opponentBoard);
        const botWon = checkAllShipsSunk(playerBoard);
        const isGameOver = playerWon || botWon;

        res.status(200).json({
            playerStatus: {
                fireHits: opponentBoard.hitsTotal,
                fireMisses: opponentBoard.missesTotal,
                totalAttacks: opponentBoard.getAttackTotal(),
                score: opponentBoard.getScore(),
                gridHits: opponentBoard.hits
            },
            opponentStatus: {
                fireHits: playerBoard.hitsTotal,
                fireMisses: playerBoard.missesTotal,
                totalAttacks: playerBoard.getAttackTotal(),
                score: playerBoard.getScore(),
                gridHits: playerBoard.hits
            },
            gameState: {
                isGameOver: isGameOver,
                winner: playerWon ? 'player' : (botWon ? 'bot' : null),
                message: playerWon ? 'Você venceu! Todos os navios inimigos foram destruídos!' : 
                        (botWon ? 'Você perdeu! Todos os seus navios foram destruídos!' : null)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erro ao obter o estado do jogo!",
            error: error.message
        });
    }
};

export { addShip, attack, getBoard, getGameState, resetBoard, startGame };