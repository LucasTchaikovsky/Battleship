function criarTabuleiro(tamanho) {
    return Array.from({ length: tamanho }, () => Array(tamanho).fill(0));
}

function posicionarNavio(tabuleiro, navio) {
    const [x, y] = navio.posicao;
    for (let i = 0; i < navio.tamanho; i++) {
        if (navio.orientacao === 'horizontal') {
            tabuleiro[x][y + i] = 1;
        } else {
            tabuleiro[x + i][y] = 1;
        }
    }
}

function renderizarTabuleiro(tabuleiro, elemento) {
    elemento.innerHTML = '';
    for (let i = 0; i < tabuleiro.length; i++) {
        for (let j = 0; j < tabuleiro[i].length; j++) {
            const celula = document.createElement('div');
            celula.classList.add('celula');
            celula.dataset.x = i;
            celula.dataset.y = j;
            elemento.appendChild(celula);
        }
    }
}