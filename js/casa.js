'use strict'

/**
 * Representa uma casa do tabuleiro
 * @constructor
 * @param {Number} x - Coordenada x
 * @param {Number} y - Coordenada y
 */
function Casa(x, y, pedra) {
    this.x = x;
    this.y = y;
    this.pedra = pedra;
    this.dom = document.getElementById('casa'+ x + 'x' + y);
    this.trueColor = this.dom.style.backgroundColor;
    this.showingHint = false;
    this.obrigatoria = false;
    this.capturada = false;
    this.setDomClick();
}

/**
 * Método responsável por trocar o tema de uma casa, ou seja, 
 * caso ela possua uma pedra, pedir para a pedra trocar de tema.
 * @method
 */
Casa.prototype.changeTema = function() {
    if(this.pedra) {
        this.pedra.changeTema();
    }
};

/**
 * Devolve true se a casa possuir uma peça, caso contrário, false.
 * @method
 * @return {Boolean} true se a casa estiver ocupada
 */
Casa.prototype.isFilled = function() {
    return this.pedra ? true : false;
};

/**
 * Método responsável por mostrar a casa como uma opção de jogada.
 * Troca a cor de fundo do seu dom.
 * @method
 */
Casa.prototype.showHint = function() {
    this.dom.style.backgroundColor = "rgba(38, 166, 91, 0.5)";
    this.showingHint = true;
};

/**
 * Método responsável por fazer a casa deixar de se mostrar como opção de jogada.
 * Restaura a cor de fundo do seu dom para a padrão.
 * @method
 */
Casa.prototype.stopHint = function() {
    this.turnNormalColor();
    this.showingHint = false;
};

/**
 * Método responsável por tornar a casa uma opção de jogada obrigatória.
 * Troca a cor de fundo do seu dom.
 * @method
 */
Casa.prototype.turnObrigatoria = function() {
    this.dom.style.backgroundColor = "rgba(247, 202, 124, 1)";
    this.obrigatoria = true;
};

/**
 * Método responsável por fazer a casa deixar de se mostrar como uma opção de jogada obrigatória.
 * Restaura a cor de fundo do seu dom para o padrão.
 * @method
 */
Casa.prototype.stopObrigatoria = function() {
    this.turnNormalColor();
    this.obrigatoria = false;
};

/**
 * Método responsável por fazer a casa se marcar como detentora de uma pedra que foi capturada.
 * Troca a cor de fundo do seu dom.
 * @method
 */
Casa.prototype.turnCapturada = function() {
    this.dom.style.backgroundColor = "rgba(207, 0, 15, 0.2)";
    this.capturada = true;
};

/**
 * Método responsável por fazer a casa deixar de se marcar como detentora de uma pedra que foi capturada.
 * Chamado após ter sua pedra removida do tabuleiro.
 * Restaura a cor de fundo do seu dom para o padrão.
 * @method
 */
Casa.prototype.stopCapturada = function() {
    this.turnNormalColor();
    this.capturada = false;
};

/**
 * Método responsável por restaurar a cor de fundo do dom para a padrão.
 * @method
 */
Casa.prototype.turnNormalColor = function() {
    this.dom.style.backgroundColor = this.trueColor;
};

/**
 * Método responsável por adicionar o evento de click na casa
 * @method
 */
Casa.prototype.setDomClick = function() {
    var self = this;
    this.dom.onclick = action;
    this.dom.addEventListener('touchstart', action);

    /**
     * Função responsável por dizer o que será feito após um clique em uma casa.
     * Tomara a decisão em cima de estados e propriedades da casa como "showingHint, obrigatoria, capturada".
     * @type (Function)
     */
    function action() {
        if(estadoAtual === estados.inicio) {
            if(self.pedra) {
                if(self.pedra.player === playerTurn) {
                    if(tabuleiro.haObrigatorias) {
                        if(self.obrigatoria) {
                            tabuleiro.displayHint(self.x, self.y);
                        }
                    } else {
                        tabuleiro.displayHint(self.x, self.y);
                    }
                }
            } 
        } else if(estadoAtual === estados.selecionado) {
            if(self.showingHint) {
                tabuleiro.fazJogada(self);
            } else {
                estadoAtual = estados.inicio;
                tabuleiro.stopHint();
            }
        } else if(estadoAtual === estados.movendo) {
            if(self.showingHint) {
                tabuleiro.fazJogada(self);
            }
        }
    }
};
