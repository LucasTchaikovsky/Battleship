document.addEventListener('DOMContentLoaded', () => {
    const tamanhoTabuleiro = 10;
    const tabuleiroJogador = criarTabuleiro(tamanhoTabuleiro);
    const tabuleiroIA = criarTabuleiro(tamanhoTabuleiro);

    const elementoJogador = document.getElementById('tabuleiro-jogador');
    const elementoIA = document.getElementById('tabuleiro-ia');
    const mensagem = document.getElementById('mensagem');

    const ia = new IA(tabuleiroJogador, 'medio');

    // Posiciona navios do jogador e da IA
    posicionarNavio(tabuleiroJogador, { tamanho: 3, posicao: [2, 2], orientacao: 'horizontal' });
    posicionarNavio(tabuleiroIA, { tamanho: 3, posicao: [4, 4], orientacao: 'vertical' });

    renderizarTabuleiro(tabuleiroJogador, elementoJogador);
    renderizarTabuleiro(tabuleiroIA, elementoIA);

    elementoIA.addEventListener('click', (event) => {
        const celula = event.target;
        const x = parseInt(celula.dataset.x);
        const y = parseInt(celula.dataset.y);

        if (tabuleiroIA[x][y] === 1) {
            celula.classList.add('acerto');
            mensagem.textContent = 'Acertou um navio!';
            tabuleiroIA[x][y] = 2;
        } else {
            celula.classList.add('erro');
            mensagem.textContent = 'Água!';
            tabuleiroIA[x][y] = 3;
        }

        // Turno da IA
        const [iaX, iaY] = ia.escolherAtaque();
        if (tabuleiroJogador[iaX][iaY] === 1) {
            document.querySelector(`#tabuleiro-jogador .celula[data-x="${iaX}"][data-y="${iaY}"]`).classList.add('acerto');
            ia.atualizarUltimoAcerto(iaX, iaY);
            mensagem.textContent += ' IA acertou seu navio!';
            tabuleiroJogador[iaX][iaY] = 2;
        } else {
            document.querySelector(`#tabuleiro-jogador .celula[data-x="${iaX}"][data-y="${iaY}"]`).classList.add('erro');
            mensagem.textContent += ' IA errou!';
            tabuleiroJogador[iaX][iaY] = 3;
        }
    });
});