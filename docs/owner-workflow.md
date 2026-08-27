# Fluxos de Proprietários e Funcionários

Este documento descreve o comportamento esperado do protótipo administrativo em `admin.html`. A informação fica apenas no `localStorage` do navegador atual e serve para demonstração.

## Perfis

- Proprietários: Jorge, Paula, Bárbara e Marlene.
- Dev com acesso de proprietário: André.
- Funcionários: Dulce e Fábio.

O último utilizador escolhido fica memorizado no dispositivo. Na versão final, cada pessoa terá identidade individual, acesso revogável e permissões verificadas no servidor.

## Painel do proprietário

O Painel concentra as ações frequentes:

1. `Criar reserva` abre o formulário de reserva manual.
2. `Iniciar trabalho` abre primeiro a escolha de modalidade, tarefas e detalhe opcional.
3. Hóspede atual, próxima chegada e próxima saída têm atalhos de comunicação adequados aos dados existentes.
4. Pedidos por rever abre `Pedidos do website`.
5. Pagamentos pendentes abre `Reservas` já filtrada por pagamento pendente.
6. O resumo rápido apresenta apenas os indicadores operacionais mais relevantes.

No telefone, os indicadores formam uma faixa horizontal e os quatro destinos mais usados ficam na navegação inferior.

## Painel do funcionário

O funcionário vê informação orientada ao trabalho: tempo do mês, valor/custo associado quando permitido, estado do relógio e reservas operacionais. Não recebe a visão financeira completa do proprietário.

Pode atualizar nas reservas os horários de check-in/check-out, idioma preferido, nacionalidade do hóspede e estado de pagamento quando a permissão o permite. A nacionalidade atualiza o registo partilhado do hóspede e, por isso, também as estatísticas e exportações.

## Calendário

- `Hoje` regressa ao mês e dia atuais.
- Dias passados aparecem atenuados, mas continuam selecionáveis.
- O nome aparece no check-in, durante a estadia e no checkout.
- Marcadores diferentes identificam chegada e saída.
- Selecionar um dia mostra as reservas relevantes e ações de pagamento, mensagem e gestão.
- `Gerir reserva` abre a reserva certa em modo de edição.
- Intervalos usam a regra `[check-in, checkout)`: uma saída e nova entrada podem acontecer no mesmo dia.

Conflitos são avisados ao preparar pedidos, criar reservas ou editar datas. Só perfis autorizados podem confirmar uma sobreposição intencional.

## Pedidos do website

1. Rever dados, origem, idioma, caução, datas, hóspedes, comentários e aviso de conflito.
2. `Preparar reserva` transfere o pedido para o formulário de reserva.
3. Confirmar valores e instruções antes de guardar.
4. A nova reserva fica a aguardar pagamento durante 48 horas.
5. O modelo de pagamento apresenta datas, noites, alojamento, crianças, serviços, descontos, caução e total.
6. Quando o pagamento chega, usar `Pagamento recebido`.

No protótipo, a expiração das 48 horas corre quando o admin é aberto. Na versão final será uma tarefa automática no servidor.

O histórico tratado fica fechado por defeito e cada registo pode ser expandido.

## Reservas

- Pesquisar e filtrar por estado da reserva, estado do pagamento, origem e texto. O pagamento refere-se ao valor global da reserva; a caução recebida é um campo separado de sim/não.
- Criar uma reserva manual ou editar uma existente.
- Registar nome, email, telefone, nacionalidade, NIF, CC/BI/Passaporte, idioma, origem, datas/horas, adultos, crianças/idades, caução, pagamento, desconto, notas e consentimento de marketing.
- Ao criar, Booking.com, Abritel.fr e reservas do proprietário terminam no separador Reservas. Website e contacto privado abrem a mensagem de pagamento ou confirmação adequada ao estado guardado.
- Adicionar hóspedes extra apenas quando necessário; cada ajuste guarda datas, adultos/crianças, idades, desconto, valor e pagamento.
- Cancelar/restaurar com validação de conflito.
- Abrir `Reservas passadas` para estadias concluídas, canceladas ou no-show.

Ao terminar ou cancelar uma edição, o filtro técnico usado para localizar a reserva é removido. Editar uma reserva não abre automaticamente Mensagens; apenas a criação de uma nova reserva pode preparar o passo de comunicação seguinte.

## Preços e descontos

- O preço base define adulto/noite, mínimo de dois adultos, criança/noite e caução.
- Épocas anuais repetem-se sem ano.
- Períodos com datas completas substituem base/época.
- Um preço temporário inferior ao normal aparece como promoção na Homepage e em Reservas.
- Reduções de grupo e códigos aceitam percentagem ou valor fixo.
- Códigos podem não ter limite de datas nem de utilizações.
- Datas introduzidas manualmente usam `dd/mm/aaaa`; o botão de calendário continua disponível.

## Serviços

Bicicletas são o primeiro serviço configurável. Desativar a sua visibilidade remove o controlo de Reservas e a apresentação no Guest Stay. O catálogo aceita novos serviços, mas cada serviço futuro precisa de regras aprovadas para unidade, quantidade, datas e interface pública.

## Despesas

- A lista mostra todos os registos correspondentes aos filtros.
- Filtrar por pesquisa, categoria e mês/ano ou ano completo.
- Expandir para ler notas.
- Adicionar, editar ou remover com botões consistentes.

## Funcionários e O meu trabalho

- A lista principal mostra apenas identidade, função, modo habitual e resumo mensal.
- Histórico de tarefas/custos permanece fechado até ser necessário.
- Sessões podem ser voluntárias ou pagas.
- Tarefas: check-in, checkout, limpeza, burocracia, manutenção/reparações, compras e outro com detalhe opcional.
- Durante um contador ativo, tarefas e modalidade podem ser corrigidas.
- Tempo manual e histórico próprio permitem adicionar, editar e remover.
- Guardar e cancelar aparecem juntos no fim do formulário de edição.

## Mensagens

1. Escolher uma reserva ou `Sem reserva`.
2. Escolher o modelo.
3. Sem reserva, escolher o idioma.
4. O rascunho atualiza automaticamente e continua editável.
5. Copiar mensagem, copiar email, abrir email ou abrir WhatsApp.

Os modelos e traduções estão exclusivamente em `public/locales/messages.json`. A menção da plataforma depende da origem; contacto privado não inventa uma plataforma. Caução e pedido de horário aparecem apenas quando relevantes.

### Marketing

A área de Marketing agrupa contactos com consentimento conhecido no protótipo por idioma, permite copiar CCI, editar modelos de novidades/ofertas e abrir o cliente de email.

Na versão final, todos os opt-ins de reservas e contactos entram automaticamente numa lista privada com prova de consentimento, cancelamento de subscrição e supressão de devoluções/queixas.

## Estatísticas e exportações

Cada secção combina indicadores, tabelas/listas e gráficos apenas quando ajudam a interpretar reservas, hóspedes, receitas, despesas, trabalho e resultado. Períodos e comparações aplicam-se aos dados visíveis; cada secção exporta o seu próprio CSV com os filtros atuais.

## Definições e auditoria

- A auditoria mostra uma linha por ação e apenas os campos realmente alterados.
- Pode ser filtrada por texto, entidade e utilizador.
- Detalhes mantêm ID, pessoa, data/horário e mudanças concisas.
- Exportar/repor dados serve apenas para testar portabilidade do protótipo.
- `Repor dados de demonstração` apaga alterações locais desse navegador.

## Comportamento comum

- Voltar a clicar no separador já aberto repõe filtros e fecha detalhes.
- Todo detalhe longo tem uma ação `Fechar` no fim e regressa ao topo do registo.
- Formulários importantes avisam sobre alterações não guardadas.
- Ações destrutivas pedem confirmação; ações normais evitam diálogos desnecessários.
