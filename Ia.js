class IA {
    constructor(tabuleiro, nivel = 'facil') {
      this.tabuleiro = tabuleiro;
      this.nivel = nivel;
      this.ultimoAcerto = null; // Armazena a última coordenada que acertou um navio
      this.direcoes = [
        [0, 1],  // Direita
        [1, 0],  // Baixo
        [0, -1], // Esquerda
        [-1, 0]  // Cima
      ];
    }
  
    // Nível Fácil: Escolhe coordenadas aleatórias para atacar
    atacarFacil() {
      let x, y;
      do {
        x = Math.floor(Math.random() * this.tabuleiro.tamanho);
        y = Math.floor(Math.random() * this.tabuleiro.tamanho);
      } while (this.tabuleiro.grid[x][y] !== 0); // Evita repetir ataques
  
      return [x, y];
    }
  
    // Nível Médio: Se acertar um navio, tenta atacar posições próximas
    atacarMedio() {
      if (this.ultimoAcerto) {
        // Tenta atacar nas direções adjacentes ao último acerto
        for (const [dx, dy] of this.direcoes) {
          const x = this.ultimoAcerto[0] + dx;
          const y = this.ultimoAcerto[1] + dy;
  
          if (
            x >= 0 && x < this.tabuleiro.tamanho &&
            y >= 0 && y < this.tabuleiro.tamanho &&
            this.tabuleiro.grid[x][y] === 0
          ) {
            return [x, y];
          }
        }
      }
  
      // Se não houver último acerto ou não encontrar posições válidas, ataca aleatoriamente
      return this.atacarFacil();
    }
  
    // Nível Difícil: Algoritmo otimizado para encontrar navios
    atacarDificil() {
      if (this.ultimoAcerto) {
        // Tenta encontrar o padrão do navio
        for (const [dx, dy] of this.direcoes) {
          let x = this.ultimoAcerto[0] + dx;
          let y = this.ultimoAcerto[1] + dy;
  
          // Segue na direção até encontrar água ou o fim do tabuleiro
          while (
            x >= 0 && x < this.tabuleiro.tamanho &&
            y >= 0 && y < this.tabuleiro.tamanho
          ) {
            if (this.tabuleiro.grid[x][y] === 0) {
              return [x, y];
            } else if (this.tabuleiro.grid[x][y] === 1) {
              x += dx;
              y += dy;
            } else {
              break; // Já atacou aqui ou é água
            }
          }
        }
      }
  
      // Se não houver último acerto ou não encontrar posições válidas, ataca aleatoriamente
      return this.atacarFacil();
    }
  
    // Método principal para escolher o ataque com base no nível
    escolherAtaque() {
      switch (this.nivel) {
        case 'facil':
          return this.atacarFacil();
        case 'medio':
          return this.atacarMedio();
        case 'dificil':
          return this.atacarDificil();
        default:
          throw new Error('Nível de dificuldade inválido');
      }
    }
  
    // Método para atualizar o último acerto (chamado após um ataque bem-sucedido)
    atualizarUltimoAcerto(x, y) {
      this.ultimoAcerto = [x, y];
    }
  }
  
  // Exemplo de uso
  const tabuleiro = {
    tamanho: 10,
    grid: Array.from({ length: 10 }, () => Array(10).fill(0))
  };
  
  const ia = new IA(tabuleiro, 'dificil');
  
  // Simulação de ataques
  for (let i = 0; i < 10; i++) {
    const [x, y] = ia.escolherAtaque();
    console.log(`IA atacou em: [${x}, ${y}]`);
  
    // Simula um acerto (para teste)
    if (Math.random() < 0.3) { // 30% de chance de acertar
      tabuleiro.grid[x][y] = 1;
      ia.atualizarUltimoAcerto(x, y);
      console.log('Acertou um navio!');
    } else {
      tabuleiro.grid[x][y] = 3; // Água
      console.log('Água!');
    }
  }