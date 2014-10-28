'use strict'

/* VARIAVEIS GLOBAIS UTILIZADAS PARA CONTROLE DE ESTADOS, TURNOS, TEMAS E ETC */ 

/** O jogador de baixo sempre sera o que começa jogando */
var topPlayer = 0, botPlayer = 1, playerTurn = botPlayer;

/** Objeto que controla o número de peças dos jogadores */
var contagemPedras = {
    botPlayer: 12,
    topPlayer: 12
};

/** Objeto que define valores para estados, para poder comparar com estadoAtual */
var estados = {
    inicio: 0,
    selecionado: 1,
    movendo: 2,
    vitoria : 3,
    empatado: 4
}

/** Representa o estado atual da partida */
var estadoAtual; 

/** Objeto que representa o elemento que contém as mensagens */
var message;

/** Objetos com informações sobre os players ("cores e etc") */
//var botPlayerInf, topPlayerInf;

/** Objeto que contabiliza jogadas que podem resultar em empate */
var casosEmpate = {
    lancesDamas: 0, // empate caso 20
    damaVsDamaOuUmaPedra: 0 // empate caso 5
}

/** Variável que guarda o motivo do empate atual */
var empateMsg; 

/** Tabuleiro responsável por controlar o jogo inteiro */
var tabuleiro;

/**
 * Função que é responsável por iniciar as variáveis globais de controle.
 * @type (Function)
 */
function init() {
    message = document.querySelector('.message');
    estadoAtual = estados.inicio // Seta estado para inicial.
    createDOM(); // Chama função que monta o dom com as casas e pedras.    
    tabuleiro = new Tabuleiro(); // Instância tabuleiro.
}

/**
 * Função que é responsável por criar o dom adicionando as casas e pedras.
 * @type (Function)
 */
function createDOM() {
    var tabuleiro = document.querySelector('.tabuleiro'); // query pelo tabuleiro
    var branco = true; // variável que diz se a casa é branca
    for(var i = 0; i < 8; i++) { // percorre oito linhas
        var linha = document.createElement('div'); // cria linha
        linha.className = "linha";
        tabuleiro.appendChild(linha); // adiciona linha no tabuleiro
        for(var j = 0; j < 8; j++) { // percorre 8 colunas
            var casa = document.createElement('div'); // cria coluna
            casa.className = 'casa';
            casa.id = 'casa' + String(j) + 'x' + String(i); // cria um id baseado nas coordenadas (x,y), para ser facil recuperar o elemento posteriormente
            
            if(branco) {
                casa.className += ' casa-branca';
            } else {
                casa.className += ' casa-cinza';
            }
            
            var pedra = null;
            if(i < 3 && !branco) { // se a linha for uma das 3 superiores e a casa não for branca adiciona uma pedra
                pedra = document.createElement('img');
                pedra.className = 'pedra';
                pedra.src = temaAtual.topPlayer.pedraSrc;
            } else if(i > 4 && !branco) { // se a linha for uma das 3 inferiores e a casa não for branca adiciona uma pedra
                pedra = document.createElement('img');
                pedra.className = 'pedra';
                pedra.src = temaAtual.botPlayer.pedraSrc;
            }
            if(pedra) {
                casa.appendChild(pedra); // adiciona pedra à casa caso pedra tenha sido criada
            }
            linha.appendChild(casa); // adiciona casa a linha
            branco = !branco; // inverte a cor da casa
        }
        branco = !branco; // a cada linha a cor deve começar trocada
    }

    // mostra primeira mensagem
    messages({
        color:  playerTurn === botPlayer ? temaAtual.botPlayer.color : temaAtual.topPlayer.color,
        txt: "Vez do " + temaAtual.prefix + " " + (playerTurn === botPlayer ? temaAtual.botPlayer.name : temaAtual.topPlayer.name),
    });
    
}

/**
 * Função responsável por mostrar mensagens (vez de jogador, vitória de jogador ou empate)
 * @params {Object} msg - Um objeto contendo uma cor (opcional, default: #000) e uma mensagem (propriedade "txt")
 * @type (Funcion)
 */
function messages(msg) {
    message.style.color = msg.color || "#000";
    message.innerHTML = msg.txt;
}

/**
 * Função chamada quando um tema é selecionado.
 * Responsável por definir as propriedades do novo tema (nome de jogadores, cores e etc).
 * Chama mudança de tema pelo tabuleiro que vai atingir as pedras.
 */
function changeTema() {
    var option = Number(this.options[this.selectedIndex].value);

    var tema;
    for (tema in temas) {
        if (temas.hasOwnProperty(tema)) {
            if(temas[tema].id === option) {
                temaAtual = temas[tema];
            }
        }
    }

    tabuleiro.changeTema(option); // chama mudança no tabuleiro para atingir as pedras

    if(estadoAtual === estados.vitoria) { // se o jogo estiver finalizado
        // troca mensagem de vitória de acordo com o tema
        var vencedor = contagemPedras.botPlayer === 0 ? temaAtual.topPlayer : temaAtual.botPlayer;
        messages({
            color: vencedor.color,
            txt: 'O ' + vencedor.prefix + ' ' + vencedor.name + ' venceu!'
        });
    } else if(estadoAtual !== estados.empatado) { // se o jogo está em andamento
        // troca mensagem de detentor da vez de acordo com o tema
        messages({
            color:  playerTurn === botPlayer ? temaAtual.botPlayer.color : temaAtual.topPlayer.color,
            txt: "Vez do " + temaAtual.prefix + " " + (playerTurn === botPlayer ? temaAtual.botPlayer.name : temaAtual.topPlayer.name),
        })
    }
}

/**
 * Função chamada quando acontece um empate.
 * Responsável por anunciar o empate e mostrar o motivo.
 * @param {String} motivo - Motivo do empate.
 * @type (Function)
 */
function empata(motivo) {
    empateMsg = 'Empatou: ' + motivo
    messages({
        color: '#F7CA18',
        txt: empateMsg
    })
    estadoAtual = estados.empatado;
}


/**
 * Função chamada quando o botão de restart é acionado
 * Responsável por reiniciar o dom e as variáveis globais.
 * @type (Function)
 */
function restart() {
    var oldTabuleiro = document.querySelector('.tabuleiro');
    oldTabuleiro.innerHTML = "";
    playerTurn = botPlayer;
    contagemPedras.botPlayer = 12;
    contagemPedras.topPlayer = 12;
    createDOM();
    tabuleiro = new Tabuleiro();
    estadoAtual = estados.inicio;
    var caso;
    for (caso in casosEmpate) {
        if (casosEmpate.hasOwnProperty(caso)) {
            casosEmpate[caso] = 0;
        }
    }
}

// Chamado quando a página carrega
window.onload = function() {
    init();
    var recomecar = document.getElementById('recomecar');
    recomecar.onclick = restart;
    var selectTema = document.getElementById('select-temas');
    selectTema.onchange = changeTema;
}
