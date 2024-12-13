
    const player = document.getElementById('player');
    const botoes = document.querySelectorAll('.btn-play');
    const busca = document.getElementById('busca-musica');
    const linhas = document.querySelectorAll('#lista-musicas tr');

    
    let playingButton = null;

    // Função para atualizar o ícone do botão
    function updateButtonIcon(button, isPlaying) {
        button.innerHTML = isPlaying 
            ? '<i class="bx bx-pause-circle"></i>'
            : '<i class="bx bx-play-circle"></i>';
    }

    // Controle de reprodução
    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            const arquivo = botao.dataset.arquivo;

            if (playingButton === botao) {
                // Mesmo botão - pausar/continuar
                if (player.paused) {
                    player.play();
                    updateButtonIcon(botao, true);
                } else {
                    player.pause();
                    updateButtonIcon(botao, false);
                }
            } else {
                // Botão diferente - nova música
                if (playingButton) {
                    updateButtonIcon(playingButton, false);
                }
                player.src = `/musicas/${arquivo}`;
                player.play();
                updateButtonIcon(botao, true);
                playingButton = botao;
            }
        });
    });

    // Quando a música terminar
    player.addEventListener('ended', () => {
        if (playingButton) {
            updateButtonIcon(playingButton, false);
            playingButton = null;
        }
    });

    // Filtro de busca
    busca.addEventListener('input', () => {
        const termo = busca.value.toLowerCase();
        
        linhas.forEach(linha => {
            const texto = linha.textContent.toLowerCase();
            linha.style.display = texto.includes(termo) ? '' : 'none';
        });
    });

    // Sistema de deleção
    const modal = document.getElementById('modal-delete');
    const musicaTitulo = document.getElementById('musica-titulo');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnConfirmar = document.getElementById('btn-confirmar');
    let musicaIdParaDeletar = null;
    let linhaDeletar = null;

    // Fechar modal quando clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });

    function fecharModal() {
        modal.classList.remove('active');
        setTimeout(() => {
            musicaIdParaDeletar = null;
            linhaDeletar = null;
        }, 300);
    }

    // Abrir modal de confirmação
    
    function deletarMusica(id) {
        console.log("id", id);
        musicaIdParaDeletar = id;
        linhaDeletar = document.getElementById(`musica-${id}`);
        musicaTitulo.textContent = linhaDeletar.querySelector('td:nth-child(2)').textContent;
        modal.classList.add('active');
    }

    // Fechar modal
    btnCancelar.addEventListener('click', fecharModal);

    // Confirmar deleção
    btnConfirmar.addEventListener('click', async () => {
        if (musicaIdParaDeletar && linhaDeletar) {
            btnConfirmar.disabled = true;
            btnConfirmar.textContent = 'Deletando...';

            try {
                const response = await fetch(`/deletar-musica/${musicaIdParaDeletar}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    // Animação de fade out na linha
                    linhaDeletar.style.transition = 'all 0.3s ease';
                    linhaDeletar.style.opacity = '0';
                    linhaDeletar.style.transform = 'translateX(20px)';
                    
                    setTimeout(() => {
                        linhaDeletar.remove();
                        fecharModal();
                    }, 300);
                } else {
                    const data = await response.json();
                    throw new Error(data.error || 'Erro ao deletar música');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert(error.message || 'Erro ao deletar música');
            } finally {
                btnConfirmar.disabled = false;
                btnConfirmar.textContent = 'Excluir';
            }
        }
    });