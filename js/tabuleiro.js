'use strict'

/**
 * Representa o tabuleiro.
 * @constructor
 */
function Tabuleiro() {
    this.casas = [];
    this.casaSelecionada = null;
    this.haObrigatorias = false; // boolean que mostra se existem pedras com obrigatoriedade de movimento
    this.casasCapturadas = [];
    this.load();
}

/**
 * Carrega propriedades do tabuleiro, cria casas e pedras.
 * @method
 */
Tabuleiro.prototype.load = function() {
    var branco = true, pedra = null;;
    for(var y = 0; y < 8; y++) {
        for (var x = 0; x < 8; x++) {
            if(y < 3 && !branco) {
                pedra = new Pedra(x, y, topPlayer);
            } else if(y > 4 && !branco) {
                pedra = new Pedra(x, y, botPlayer);
            }
            this.casas.push(new Casa(x, y, pedra));
            pedra = null;
            branco = !branco;
        }
        branco = !branco;
    }
};

/**
 * Troca o tema do tabuleiro.
 * @method
 */
Tabuleiro.prototype.changeTema = function() {
    for (var i = 0; i < this.casas.length; i++) {
        this.casas[i].changeTema();
    }
};

/**
 * Devolve true se a casa da cordenada (x,y) conter uma pedra, false caso contrário.
 * @method
 * @param {Number} x - Coordenada x
 * @param {Number} y - Coodernada y
 * @return {Boolean} true se a casa de coordenda (x,y) conter uma pedra.
 */
Tabuleiro.prototype.isFilled = function(x, y) {
    for (var i = 0; i < this.casas.length; i++) {
        return this.casas[i].isFilled();
    }
    return this.casas[y][x].isFilled();
};

/**
 * Devolve a casa da cordenada (x,y) ou false caso não encontre.
 * @method
 * @param {Number} x - Coordenada x
 * @param {Number} y - Coordenada y
 * @return {Casa|Boolean} Casa encontrada ou false caso não encontrada.
 */
Tabuleiro.prototype.findCasa = function(x, y) {
    for (var i = 0; i < this.casas.length; i++) {
        if(this.casas[i].x === x && this.casas[i].y === y) {
           return this.casas[i]; 
        }
    }
    return false;
};

/**
 * Para de mostrar dicas "casas em verde" no tabuleiro.
 * @method
 */
Tabuleiro.prototype.stopHint = function() {
    this.casaSelecionada = null;
    for (var i = 0; i < this.casas.length; i++) {
        if(this.casas[i].showingHint) {
            this.casas[i].stopHint();
        }
    }
};

/**
 * Método responsável por fazer a jogada referente a casa selecionada "this.casaSelecionada".
 * @method
 * @param {Casa} casa - Objeto que representa a casa de destino
 */
Tabuleiro.prototype.fazJogada = function(casa) {
    var self = this;
    
    var dx = casa.x > this.casaSelecionada.x ? 1 : -1;
    var dy = casa.y > this.casaSelecionada.y ? 1 : -1;
    
    var capturou = fezCaptura(casa, dx, dy); // descobre se teve captura na jogada

    this.movePedra(casa); // move pedra
    this.stopHint(); // para de mostrar dica
    
    var maisCapturas = this.checaCapturas(casa); // verifica se é possível fazer mais capturas
    
    if(!capturou || !maisCapturas) {
        // se não teve captura ou não existem mais capturas
        playerTurn === botPlayer ? playerTurn = topPlayer : playerTurn = botPlayer; // passa a vez
        this.removeCasasCapturadas(); // remove do tabuleiro as casas marcadas como capturadas
        this.stopObrigatorias(); // para de mostrar casas marcadas como obrigatórias
        estadoAtual = estados.inicio; // volta para inicio da proxima jogada
        
        // trata casos de empate
        if(casa.pedra.dama && !capturou) {
            casosEmpate.lancesDamas++;
        } else {
            casosEmpate.lancesDamas = 0;
        }

        casa.pedra.viraDama(); // verifica se a pedra movimentada virou dama e vira caso positivo
        messages({
            color:  playerTurn === botPlayer ? temaAtual.botPlayer.color : temaAtual.topPlayer.color,
            txt: "Vez do " + temaAtual.prefix + " " + (playerTurn === botPlayer ? temaAtual.botPlayer.name : temaAtual.topPlayer.name)
        });
    } else {
        this.casaSelecionada = casa;
        this.displayHint(casa.x, casa.y);
        estadoAtual = estados.movendo;
        this.stopObrigatorias();
    }

    this.checaVitoria();
    this.checaEmpate();

    // procura casas obrigatorias para a proxima jogada
    this.haObrigatorias = this.checaObrigatorias();

    /* 
     * Função responsável por verificar se no último movimento teve captura de peças.
     * @param {Casa} casa - Casa de destino
     * @param {Number} dx - Direção do eixo x, -1: esquerda 1: direita
     * @param {Number} dy - Direção do eixo y, -1: cima : 1: baixo
     */
    function fezCaptura(casa, dx, dy) {
        var x = self.casaSelecionada.x + dx, y = self.casaSelecionada.y + dy;
        var casaAtual = self.findCasa(x, y);
        var capturou = false;
        while(Math.abs(x - casa.x) > 0) {
            casaAtual = self.findCasa(x, y);
            if(casaAtual.pedra !== null) {
                self.casasCapturadas.push(casaAtual);
                casaAtual.turnCapturada();
                capturou = true;
                break;
            }
            x += dx;
            y += dy;
        }
        return capturou;
    }
};

/**
 * Método responsável por mover a pedra da casa selecionada "this.casaSelecionada.pedra"
 * @method
 * @param {Casa} casa - Destino da pedra da casa selecionada
 */
Tabuleiro.prototype.movePedra = function(casa) {
    this.casaSelecionada.pedra.move(casa.x, casa.y);
    casa.pedra = this.casaSelecionada.pedra;
    this.casaSelecionada.pedra = null;
};

/**
 * Devolve true se a casa da coordenada (x,y) estiver na lista de casas capturadas "this.casasCapturadas".
 * @method
 * @param {Number} x - Coordenada x
 * @param {Number} y - Coordenada y
 * @return {Boolean} true se a coordenada está na lista de capturadas.
 */
Tabuleiro.prototype.isCasaCapturada = function(x, y) {
    for (var i = 0; i < this.casasCapturadas.length; i++) {
        if(this.casasCapturadas[i].x === x && this.casasCapturadas[i].y === y) {
            return true;
        }
    }
    return false;
};

/**
 * Método responsável por remover do tabuleiro as casas armazenadas no atributo de casas capturadas "this.casasCapturadas".
 * @method
 */
Tabuleiro.prototype.removeCasasCapturadas = function() {
    for (var i = 0; i < this.casasCapturadas.length; i++) {
        this.removePedra(this.casasCapturadas[i].x, this.casasCapturadas[i].y);
        this.casasCapturadas[i].stopCapturada();
    }
    this.casasCapturadas = [];
};

/**
 * Método responsável por verificar se existe um jogador vencedor
 * Caso vitória, declara a vitória do jogador vencedor.
 * @method
 */
Tabuleiro.prototype.checaVitoria = function() {
    if(contagemPedras.botPlayer === 0) {
        messages({
            color: temaAtual.topPlayer.color,
            txt: 'O ' + temaAtual.prefix + ' ' + temaAtual.topPlayer.name + ' venceu!'
        });
        estadoAtual = estados.vitoria;
    } else if(contagemPedras.topPlayer === 0) {
        messages({
            color: temaAtual.botPlayer.color,
            txt: 'O ' + temaAtual.prefix + ' ' + temaAtual.botPlayer.name + ' venceu!'
        });
        estadoAtual = estados.vitoria;
    }
};

/**
 * Método responsável por verificar os requisitos de empate, declara empate caso algum requisito seja cumprido.
 * @method
 */
Tabuleiro.prototype.checaEmpate = function() {
    if(casosEmpate.lancesDamas === 20) {
        empata('20 lances sucessivos de damas sem captura');
        return;
    }
    var pecas = this.getPecas();
    if(pecas.damasTop === 2 && pecas.damasBot == 2 && ((pecas.pedrasTop + pecas.pedrasBot) === 0)) {
        empata('2 damas contra 2 damas');
    } else if(((pecas.damasTop === 2 && pecas.damasBot === 1) || (pecas.damasBot === 2 && pecas.damasTop === 1)) && ((pecas.pedrasTop + pecas.pedrasBot) === 0)) {
        empata('2 damas contra 1 dama');
    } else if((pecas.damasTop === 2 && pecas.damasBot === 1 && pecas.pedrasBop === 1 && pecas.pedrasTop === 0) || (pecas.damasBot === 2 && pecas.damasTop === 1 && pecas.pedrasTop === 1 && pecas.pedrasBot === 0)) {
        empata('2 damas contra 1 dama e 1 pedra');
    } else if(pecas.damasTop === 1 && pecas.damasBot === 1 && ((pecas.pedrasTop + pecas.pedrasBot === 0) || pecas.pedrasTop + pecas.pedrasBot === 1)) {
        casosEmpate.damaVsDamaOuUmaPedra++;
        if(casosEmpate.damaVsDamaOuUmaPedra === 5) {
            empata('5 lances de 1 dama contra 1 dama ou 1 dama contra 1 dama e 1 pedra');
        }
    }
};

/**
 * Devolve um objeto com as quantidades e tipos de peças existentes no tabuleiro.
 * @method
 * @return {Object} Obejto contendo informações sobre os números das peças existentes no tabuleiro.
 */
Tabuleiro.prototype.getPecas = function() {
    var pecas = {
        damasTop: 0,
        pedrasTop: 0,
        damasBot: 0,
        pedrasBot: 0
    };

    for (var i = 0; i < this.casas.length; i++) {
        if(this.casas[i].isFilled()) {
            if(this.casas[i].pedra.player === topPlayer) {
                this.casas[i].pedra.dama ? pecas.damasTop++ : pecas.pedrasTop++;
            } else {
                this.casas[i].pedra.dama ? pecas.damasBot++ : pecas.pedrasBot++;
            }
        }
    }
    return pecas;
};

/**
 * Método responsável por verificar se existe alguma casa que deve ser movimentada 
 * pelo jogador atual, caso a condição seja satisfeita, torna a peça obrigatória.
 * @method
 * @return {Boolean} true se existe alguma peça obrigatória.
 */
Tabuleiro.prototype.checaObrigatorias = function() {
    var haObrigatorias = false;
    for (var i = 0; i < this.casas.length; i++) {
        var casaAtual = this.casas[i];
        if(casaAtual.isFilled()) {
            if(casaAtual.pedra.player === playerTurn) {
                if(casaAtual.pedra.dama) {
                    if(this.checaCapturasDama(casaAtual)) {
                        casaAtual.turnObrigatoria();
                        haObrigatorias = true;
                    }
                } else {
                    if(this.checaCapturasPedra(casaAtual)) {
                        casaAtual.turnObrigatoria();
                        haObrigatorias = true;
                    }
                }
            }
        }
    }
    return haObrigatorias;
};

/**
 * Método responsável por tornar as casas obrigatórias de um turno passado em uma casa normal.
 * @method
 */
Tabuleiro.prototype.stopObrigatorias = function() {
    if(this.haObrigatorias) {
        for (var i = 0; i < this.casas.length; i++) {
            if(this.casas[i].obrigatoria) {
                this.casas[i].stopObrigatoria();
            }
        }
    }
};

/**
 * Remove uma pedra da casa de coordenada (x,y).
 * @method
 * @param {Number} x - Coordenada x.
 * @param {Number} y - Coordenada y.
 */
Tabuleiro.prototype.removePedra = function(x, y) {
    var casa = this.findCasa(x, y);
    if(casa.pedra.player === botPlayer) {
        contagemPedras.botPlayer--;
    } else {
        contagemPedras.topPlayer--;
    }
    casa.pedra.dom.parentNode.removeChild(casa.pedra.dom);
    casa.pedra = null;
};

/**
 * Método responsável por procurar capturas possíveis a partir de uma casa que contenha uma peça.
 * @method
 * @param {Casa} casaAtual - Objeto que representa a casa que se quer checar.
 * @return {Boolean} true caso existam capturas possíveis, caso contrário, false.
 */
Tabuleiro.prototype.checaCapturas = function(casaAtual) {
    if(casaAtual.pedra.dama) {
        return this.checaCapturasDama(casaAtual);
    } else {
        return this.checaCapturasPedra(casaAtual);
    }
};


/**
 * Método responsável por procurar capturas possíveis a partir de uma casa que contém uma dama.
 * Retorna true caso existam capturas possíveis, caso contrário, false.
 * @method
 * @param {Casa} casaAtual - Objeto que representa a casa que se quer checar.
 */
Tabuleiro.prototype.checaCapturasDama = function(casaAtual) {
    var self = this;
    var ec = searchCaptura(-1, -1);  // procura por possiveis capturas na diagonal esquerda/cima
    var eb = searchCaptura(-1, 1); // procura por possiveis capturas na diagonal esquerda/baixo
    var dc = searchCaptura(1, -1); // procura por possiveis capturas na diagonal direita/cima
    var db = searchCaptura(1, 1); // procura por possiveis capturas na diagonal direita/baixo

    return ec || eb || dc || db; // true caso exista captura para qualquer lado

    function searchCaptura(dx, dy) {
        var lx = casaAtual.x + dx, ly = casaAtual.y + dy;
        var inimigo = false;
        var casa = self.findCasa(lx, ly);
        while(casa !== false) {
            if(casa.pedra !== null) {
                if(casa.pedra.player === casaAtual.pedra.player) {
                    return false;
                } else {
                    if(inimigo) {
                        return false;
                    } else {
                        inimigo = true;
                    }
                }
            } else {
                if(inimigo) {
                    return true;
                }
            }
            if(self.isCasaCapturada(lx, ly)) { // pedras que ja foram capturadas não devem ser levadas em consideração
                break;
            }
            lx += dx;
            ly += dy;
            casa = self.findCasa(lx, ly);
        }
        return false;
    }
};

/**
 * Método responsável por procurar capturas possíveis a partir de uma casa que contém uma pedra.
 * @method
 * @param {Casa} casaAtual - Objeto que representa a casa que se quer checar.
 * @return {Boolean} true caso existam capturas possíveis, caso contrário, false.
 */
Tabuleiro.prototype.checaCapturasPedra = function(casaAtual) {
    var self = this;
    var vizinhos = {
        ec: {casa: self.findCasa(casaAtual.x - 1, casaAtual.y - 1), dx: -1, dy: -1},
        dc: {casa: self.findCasa(casaAtual.x + 1, casaAtual.y - 1), dx: 1, dy: -1},
        eb: {casa: self.findCasa(casaAtual.x - 1, casaAtual.y + 1), dx: -1, dy: 1},
        db: {casa: self.findCasa(casaAtual.x + 1, casaAtual.y + 1), dx: 1, dy: 1}
    }
    var vizinho;
    for (vizinho in vizinhos) {
        if (vizinhos.hasOwnProperty(vizinho)) {
            if(vizinhos[vizinho].casa === false || this.isCasaCapturada(vizinhos[vizinho].casa.x, vizinhos[vizinho].casa.y)) {
                continue;
            }
            if(vizinhos[vizinho].casa.pedra !== null) {
                if(vizinhos[vizinho].casa.pedra.player !== casaAtual.pedra.player) {
                    var dx = vizinhos[vizinho].dx;
                    var dy = vizinhos[vizinho].dy;
                    var proximo = this.findCasa(vizinhos[vizinho].casa.x + dx, vizinhos[vizinho].casa.y + dy);
                    if(proximo.pedra === null) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
};


/**
 * Método responsável por mostrar as opções de jogadas possíveis dado uma coordenada (x,y).
 * @method
 * @param {Number} x - Coordenada x.
 * @param {Number} y - Coordenada y.
 */
Tabuleiro.prototype.displayHint = function(x, y) {
    var self = this;
    var casaAtual = this.findCasa(x, y);
    var hints = 0;

    if(casaAtual.pedra.dama) {
        hints += this.displayHintDama(casaAtual);
    } else {
        hints += this.displayHintPedra(casaAtual);
    }
    if(hints === 0) {
        this.stopHint();
        estadoAtual = estados.inicio;
    } else {
        this.casaSelecionada = this.findCasa(x, y);
        estadoAtual = estados.selecionado;
    }
};

/**
 * Método responsável por mostrar as opções de jogadas possíveis dado uma casa que possua uma dama.
 * @method
 * @param {Casa} casaAtual - Objeto que representa uma casa que contém uma dama.
 * @return {Number} Inteiro dizendo quantas casas foram mostradas como opção.
 */
Tabuleiro.prototype.displayHintDama = function(casaAtual) {
    var hints = 0;
    var self = this;
    var casasPossiveis = { ec: [], dc: [], eb: [], db: [] };
    var casasCapturas = { ec: [],  dc: [], eb: [], db: [] };

    handleDama(casaAtual, -1, -1, "ec"); // esquerda e cima
    handleDama(casaAtual, 1, -1, "dc"); // direita e cima
    handleDama(casaAtual, -1, 1, "eb"); // esquerda e baixo
    handleDama(casaAtual, 1, 1, "db"); // direita e baixo
    var temCaptura = false;

    var posicao;
    for (posicao in casasCapturas) {
        if (casasCapturas.hasOwnProperty(posicao)) {
            if(casasCapturas[posicao].length > 0) {
                temCaptura = true;
                for (var i = 0; i < casasCapturas[posicao].length; i++) {
                    casasCapturas[posicao][i].showHint();
                    hints++;
                }
            }
        }
    }
    if(!temCaptura) {
        for (posicao in casasPossiveis) {
            if (casasPossiveis.hasOwnProperty(posicao)) {
                for (var i = 0; i < casasPossiveis[posicao].length; i++) {
                    casasPossiveis[posicao][i].showHint();
                    hints++;
                }
            }
        }
    }

    return hints;

    function handleDama(casaAtual, dx, dy, posicao) {
        var pecaInimiga = false;
        var lx = casaAtual.x + dx, ly = casaAtual.y + dy;
        var casa = self.findCasa(lx, ly);
        while (casa !== false) {
            if(!casa.isFilled()) {
                if(pecaInimiga) {
                    casasCapturas[posicao].push(casa);
                } else {
                    if(casasCapturas[posicao].length > 0) {
                        casasCapturas[posicao].push(casa);
                    } else {
                        casasPossiveis[posicao].push(casa);
                    }
                }
            } else if(casaAtual.pedra.player === casa.pedra.player) {
                break;
            } else {
                if(pecaInimiga) {
                    break;
                } else {
                    pecaInimiga = true;
                }
            }
            if(self.isCasaCapturada(lx, ly)) {
                break;
            }
            lx += dx;
            ly += dy;
            casa = self.findCasa(lx, ly);
        }
    }
};

/**
 * Método responsável por mostrar as opções de jogadas possíveis dado uma casa que possua uma pedra.
 * @method
 * @param {Casa} casaAtual - Objeto que representa uma casa que contém uma pedra.
 * @return {Number} Inteiro dizendo quantas casas foram mostradas como opção.
 */
Tabuleiro.prototype.displayHintPedra = function(casaAtual) {
    var self = this;
    var hints = 0;
    var vizinhos = {
        ec: {casa: self.findCasa(casaAtual.x - 1, casaAtual.y - 1), dx: -1, dy: -1},
        dc: {casa: self.findCasa(casaAtual.x + 1, casaAtual.y - 1), dx: 1, dy: -1},
        eb: {casa: self.findCasa(casaAtual.x - 1, casaAtual.y + 1), dx: -1, dy: 1},
        db: {casa: self.findCasa(casaAtual.x + 1, casaAtual.y + 1), dx: 1, dy: 1}
    }
    var casasPossiveis = [], casasCapturas = [];
    var vizinho;
    for (vizinho in vizinhos) {
        if (vizinhos.hasOwnProperty(vizinho)) {
            if(vizinhos[vizinho].casa === false) {
                continue;
            }
            if(vizinhos[vizinho].casa.isFilled()) {
                if(this.isCasaCapturada(vizinhos[vizinho].casa.x, vizinhos[vizinho].casa.y)) {
                    continue;
                }
                if(vizinhos[vizinho].casa.pedra.player !== casaAtual.pedra.player) {
                    var casa = vizinhos[vizinho].casa;
                    var dx = vizinhos[vizinho].dx;
                    var dy = vizinhos[vizinho].dy;
                    var proximo = this.findCasa(casa.x + dx, casa.y + dy);
                    if(proximo.pedra === null) {
                        casasCapturas.push(proximo);
                    }
                }
            } else {
                if(playerTurn === topPlayer) {
                    if(vizinho == "eb" || vizinho == "db") {
                        casasPossiveis.push(vizinhos[vizinho].casa);
                    }
                } else {
                    if(vizinho == "ec" || vizinho == "dc") {
                        casasPossiveis.push(vizinhos[vizinho].casa);
                    }
                }
            }
        }
    }
    var temCaptura = false;
    for (var i = 0; i < casasCapturas.length; i++) {
        temCaptura = true;
        casasCapturas[i].showHint();
        hints++;
    }
    if(!temCaptura) {
        for (var i = 0; i < casasPossiveis.length; i++) {
            casasPossiveis[i].showHint();
            hints++;
        }
    }
    return hints;
};
