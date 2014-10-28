'use strict'

/**
 * Representa uma pedra ou dama
 * @constructor
 * @param {Number} x - Coodernada x
 * @param {Number} y - Coodernada y
 * @param {Number} player - Número que representa qual jogador possui a pedra
 */
function Pedra(x, y, player) {
    this.player = player;
    this.x = x;
    this.y = y;
    this.dom = document.querySelector('#casa' + x + 'x' + y + ' > img');
    this.dama = false;
}

/**
 * Modifica o tema da pedra
 * @method
 */
Pedra.prototype.changeTema = function() {
    if(this.player === botPlayer) {
        if(this.dama) {
            this.dom.src = temaAtual.botPlayer.damaSrc;
        } else {
            this.dom.src = temaAtual.botPlayer.pedraSrc;
        }
    } else {
        if(this.dama) {
            this.dom.src = temaAtual.topPlayer.damaSrc;
        } else {
            this.dom.src = temaAtual.topPlayer.pedraSrc;
        }
    }
};

/**
 * Verifica se a pedra pode se tornar uma dama e se torna caso possível
 * @method
 */
Pedra.prototype.viraDama = function() {
    if((this.y === 0 && this.player === botPlayer) || (this.y === 7 && this.player === topPlayer)) {
        this.dama = true;
        if(this.player === botPlayer) {
            this.dom.src = temaAtual.botPlayer.damaSrc;
        } else {
            this.dom.src = temaAtual.topPlayer.damaSrc;
        }
    }
};

/**
 * Move a pedra de casa
 * @method
 */
Pedra.prototype.move = function(x, y) {
    this.x = x;
    this.y = y;
    var newParent = document.querySelector('#casa' + x + 'x' + y);
    newParent.appendChild(this.dom);
    this.dom = document.querySelector('#casa' + x + 'x' + y + ' > img');
};
