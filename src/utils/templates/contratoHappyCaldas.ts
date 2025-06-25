
export const templateContratoHappyCaldas = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS
AGENCIAMENTO DE HOSPEDAGEM

De um lado, denominada, CONTRATADA,
Razão social: {{empresa_razao_social}}
Fantasia: {{empresa_nome_fantasia}}
CNPJ: {{empresa_cnpj}}
Endereço: {{empresa_endereco}}, na cidade de {{empresa_cidade}}, estado de {{empresa_estado}}.
Contatos: {{empresa_telefone}} / {{empresa_telefone_secundario}} / Email: {{empresa_email}}

De outro lado, denominada, CONTRATANTE
Proprietário(a): {{proprietario_nome}}
Data Nascimento: {{proprietario_data_nascimento}},
Nacionalidade: {{proprietario_nacionalidade}}, Estado Civil: {{proprietario_estado_civil}},
Profissão: {{proprietario_profissao}},
portador(a) do RG: {{proprietario_rg}} Órgão Expeditor: {{proprietario_orgao_expeditor}}
CPF: {{proprietario_cpf}}, Email de Contato: {{proprietario_email}},
residente e domiciliado à {{proprietario_endereco}}.

Têm entre si ajustado o que segue:

CLÁUSULA PRIMEIRA - DOS SERVIÇOS PRESTADOS – Gerenciamento das hospedagens no
{{condominio_nome}}, Telefone: {{condominio_telefone}}
Endereço: {{condominio_endereco}}

Dados da Unidade Habitacional
U.H: {{apartamento_numero}} Torre: {{apartamento_torre}}
Características do Imóvel: {{apartamento_caracteristicas}}
Capacidade de Hospedagem: {{apartamento_capacidade}} pessoas
Características do Empreendimento: {{condominio_caracteristicas}}

CLÁUSULA SEGUNDA - DURAÇÃO E RESCISÃO CONTRATUAL
Art: 2 – Este contrato terá o prazo de {{contrato_prazo_meses}} meses,
com início em {{contrato_data_inicio}} e término em {{contrato_data_fim}},
renovado automaticamente por iguais períodos.

Art 2.1 – Este presente instrumento pode ser rescindido por qualquer das partes,
em qualquer época, mesmo antes da data do término do contrato, desde que
seja comunicado à outra parte, por escrito no prazo não inferior a 30 (trinta) dias
e/ou até véspera quando não houver reservas efetivas e pagas para o referido imóvel,
independente da data da reserva.

Art 2.2 – No ato da assinatura do contrato, a Contratada fará uma vistoria no imóvel,
relacionando todos os itens que existem no imóvel, móveis, eletrônicos,
eletrodomésticos e utensílios domésticos, e ao término do contrato,
os mesmos deverão estar na mesma quantidade, mesma marca, qualidade ou similar.

CLÁUSULA TERCEIRA - DA UTILIZAÇÃO DO IMÓVEL PELO PROPRIETÁRIO
Art 3 – Quando fizer uso de sua unidade habitacional, por si mesmo,
deverá efetivar o bloqueio de sua unidade com a antecedência mínima de 30 (trinta) dias
ou, até a véspera quando houver disponibilidade da unidade.

Parágrafo Único: Somente o contratante mencionado neste presente instrumento,
poderá efetivar, solicitar bloqueios de datas, ceder, reservar o uso da unidade.

Art: 3.1 – Durante o prazo de vigência deste instrumento contrato de prestação de serviços
de agenciamento de hospedagem, o CONTRATANTE CONCORDA com a EXCLUSIVIDADE com o contratado.

Art: 3.2 – O proprietário deve sempre manter o financiamento, caso haja,
bem como taxas de condomínio/manutenção rigorosamente em dia,
sob pena de não ter o imóvel locado.

Art 3.3 - O contratante está sujeito ao pagamento de multa,
de meio salário mínimo ao dia de infração,
a qualquer uma das regras acima mencionadas.

CLÁUSULA QUARTA - DAS DESPESAS ORIUNDAS DA MANUTENÇÃO DO IMÓVEL
Art 4 – Sempre que houver a necessidade de reparos no imóvel mencionado na CLÁUSULA PRIMEIRA,
a Contratada deverá informar ao contratante os custos,
e o mesmo deverá autorizar a execução da manutenção,
com apresentação das Notas Fiscais, Cupons Fiscais e/ou recibos
que comprovem a execução da manutenção.

Art 4.1 - A contratada fica autorizada a debitar as despesas mencionadas no Art. 4
dos resultados das locações no mês vigente, quando houver resultado positivo.

CLÁUSULA QUINTA – DOS REPASSES DOS RENDIMENTOS
Art 5 - Os repasses das receitas, com os respectivos extratos detalhados
de Histórico de hospedagem oriundas do mês vigente,
serão efetivados até o quinto dia (5º) útil posterior ao mês vigente,
na conta informada no Art 5.3

Art 5.1 – Será debitado o percentual de {{percentual_comissao}}% do valor total de diárias comercializadas.

Art 5.2 - Caso a conta do contratante não tenha CHAVE PIX CADASTRADA,
fica AUTORIZADO o DÉBITO das despesas financeiras cobradas pelo banco emissor
dos serviços oriundos da prestação de contas apresentada.

Parágrafo Único: Caso a modalidade Pix no banco emissor do contratado seja tarifada,
fica desde já autorizado o débito dos repasses,
desde que comprovado em documento oficial emitido pelo banco.

Art: 5.3 As receitas deverão ser realizadas na conta bancária informada abaixo:
Nr/BANCO: {{proprietario_banco}} AGÊNCIA: {{proprietario_agencia}} CONTA: {{proprietario_conta}}
CHAVE PIX: {{proprietario_pix}} Tipo de Conta: {{proprietario_tipo_conta}}
Titular da Conta: {{proprietario_titular_conta}} CPF: {{proprietario_cpf_titular}}

CLÁUSULA SEXTA - DA RESPONSABILIDADE DO CONTRATADO
Art 6 – Fica a Contratada, com as responsabilidades pelos cheques devolvidos
e não pagamentos e garantindo as locações temporárias no período do contrato
representado o(s) Proprietário(s), junto ao judiciário defendendo seus interesses
sempre que estiver ausente das mesmas.

Art 6.1 – A Contratada fica responsável pelo lançamento das reservas
nos aplicativos do próprio condomínio.

Art 6.2 - Fica responsável pela limpeza e manutenção do imóvel.

CLÁUSULA SÉTIMA – NOMEAÇÃO DE PROCURADOR
Art 7 – Fica eleito o representante legal da empresa {{empresa_razao_social}},
{{empresa_responsavel}} portador do CPF: {{empresa_cpf_responsavel}}.

CLÁUSULA OITAVA - DO FÓRUM
Art 8 Fica eleito o fórum de {{empresa_cidade}}, {{empresa_estado}},
com renúncia de qualquer outro para dirimir dúvidas ou questões deste contrato
sem multa ou qualquer ônus para nenhuma das partes.

E por estarem assim ajustados, assinam o presente instrumento em (03) três vias
de igual teor para o mesmo fim.

{{empresa_cidade}}, {{empresa_estado}}, {{data_assinatura}}

_____________________________     ___________________________
{{proprietario_nome}}              {{empresa_razao_social}}
CPF: {{proprietario_cpf}}          {{empresa_responsavel}}

A vistoria foi realizada em _____/_____/______.

{{empresa_cidade}}, ___/____/______

______________________________    ________________________
Proprietário                      Procurador(a)`;
