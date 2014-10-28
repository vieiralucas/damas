'use strict'

/** Objeto que contém as informações necessárias para os temas  */
var temas = {
    classico: {
        id: 0,
        prefix: 'jogador', // palavra de "tratamento" com o jogador
        botPlayer: { // player de baixo
            name: 'Vermelho',
            color: '#CF000F',
            pedraSrc: 'assets/pedra_vermelha.png',
            damaSrc: 'assets/pedra_vermelha_dama.png'
        },
        topPlayer: { // player de cima
            name: 'Verde',
            color: '#2ECC71',
            pedraSrc: 'assets/pedra_verde.png',
            damaSrc: 'assets/pedra_verde_dama.png'
        }
    }
};

/** Objeto que armazena o tema atual */
var temaAtual = temas.classico;
