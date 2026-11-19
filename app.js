/* ===================================================================
   Investigação de Ocorrências SSMA — Usina Santa Adélia
   Protótipo v2 (dados no navegador; camada de dados isolada em DB.*)
   =================================================================== */
'use strict';
const CONFIG = {
  classAcidente: ['ASA – Primeiros socorros','ASA – Tratamento médico','ASA – Trabalho restrito','ACA – Com afastamento','Fatal','Acidente ambiental – Baixa proporção','Acidente ambiental – Média proporção','Acidente ambiental – Grande proporção'],
  classIncidente: ['Incidente – Baixo potencial','Incidente – Médio potencial','Incidente – Alto potencial'],
  papeis: ['Gerente da área','Gerente de SSMA','Coordenador da área','Supervisor/Líder da área','Técnico de Segurança','Supervisor de Segurança','Envolvido/Acidentado','Representante CIPA','Testemunha','Medicina do Trabalho','Manutenção/Engenharia','Outro'],
  /* NP.AD.00.03.0002 rev. 05 — 7.2: responsável e prazo da análise por classificação */
  np:{
    'Fatal':{resp:'Gerente da área',dias:15},'Acidente ambiental – Grande proporção':{resp:'Gerente da área',dias:15},
    'ACA – Com afastamento':{resp:'Supervisor/Líder da área',dias:7},'ASA – Primeiros socorros':{resp:'Supervisor/Líder da área',dias:7},'ASA – Tratamento médico':{resp:'Supervisor/Líder da área',dias:7},'ASA – Trabalho restrito':{resp:'Supervisor/Líder da área',dias:7},
    'Acidente ambiental – Média proporção':{resp:'Supervisor/Líder da área',dias:7},'Acidente ambiental – Baixa proporção':{resp:'Supervisor/Líder da área',dias:7},
    'Incidente – Alto potencial':{resp:'Supervisor/Líder da área',dias:7}
  },
  /* 7.3.2 CIPA em toda análise · 6.6.5 Segurança participa · 6.5.5 Gerente de SSMA em fatalidade e ambiental de grande proporção */
  comiteMinimo: (cls)=>{
    const r=[(CONFIG.np[cls]||{}).resp||'Supervisor/Líder da área','Representante CIPA','Técnico de Segurança'];
    if(/Fatal|Grande proporção/.test(cls))r.push('Gerente de SSMA');return r;
  },
  tipoLesao: ['Amputação','Contusão','Corto-contuso','Entorse','Escoriação','Fratura','Irritação','Lácero-contuso','Queimadura química','Queimadura térmica','Trauma','Outra lesão pessoal','N/A'],
  parteCorpo: ['Braço','Cabeça','Face','Joelho','Mão','Olhos','Pé','Perna','Tornozelo','Tronco','Outro','N/A'],
  turnos: ['A','B','C','ADM'],
  fontes: ['Entrevista – envolvido','Entrevista – testemunha','Entrevista – liderança','Observação no local','Documento (AST/IT/FOP/checklist)','Registro fotográfico','Sistema/telemetria','A confirmar'],
  tipoCausa: ['FP1 – Falta de habilidade','FP2 – Falta de conhecimento','FP3 – Capacidade física inadequada','FP4 – Condição psicológica','FP5 – Motivação inadequada','FT1 – Liderança inadequada','FT2 – Engenharia inadequada','FT3 – Agentes externos','FT4 – Ferramentas e equipamentos inadequados','FT5 – Padrões de trabalho inadequados','FT6 – Deficiência nas aquisições','FT7 – Manutenção deficiente','FT8 – Uso e descarte'],
  elementos: ['01.1 – Papel da liderança nos aspectos de SSMA','01.2 – Papel do profissional de SSMA','02.1 – Desdobramento da política de SSMA','02.2 – Promoção e avaliação de desempenho em SSMA','02.3 – Comitês de SSMA','02.4 – Requisitos legais e voluntários','03.1 – Ger. de riscos – higiene e saúde','03.2 – Ger. de riscos – segurança do trabalho','03.3 – Ger. de riscos – segurança de processo','03.4 – Ger. de riscos – meio ambiente','03.5 – Ger. de riscos em aquisições','04.1 – Controle de padrões e procedimentos','04.2 – Medições, coleta e análise de amostras','04.3 – EPIs e EPCs','04.6 – Trabalho em serviços energizados','04.9 – Controle de acesso e circulação','04.10 – Uso de veículos automotivos','04.11 – Ferramentas manuais e equipamentos portáteis','04.12 – Permissão de trabalho','04.13 – Trabalho a quente','04.14 – Bloqueio de energias','04.20 – Trabalho em altura','04.21 – Espaço confinado','04.22 – Movimentação de cargas','04.23 – Proteção contra quedas no mesmo nível','05.1 – Informação de produto','05.2 – Informação de processo','05.3 – Informação de equipamentos e instalações','06.1 – Motivação em SSMA','06.2 – Desenvolvimento comportamental','06.4 – Disciplina operacional','06.5 – Cultura em SSMA','07.1 – Qualificação','07.2 – Habilitação'],
  niveis: ['1 – Eliminação','2 – Substituição','3 – Engenharia','4 – Administrativo (procedimento, sinalização, treinamento)','5 – EPI'],
  status: ['Não iniciada','Em andamento','Concluída','Concluída e eficaz','Cancelada'],
  eventos: ["Queda do mesmo nível","Queda de altura/de veículo","Torção ao pisar/descer","Esforço excessivo/movimento","Bater contra objeto/estrutura","Atingido por objeto/peça","Prensamento","Corte/perfuração","Golpe de ferramenta","Projeção de partícula/corpo estranho","Contato com fluido/superfície quente","Contato com chama/fogo","Contato com produto químico","Choque/arco elétrico","Picada/ataque de animal","Colisão de veículo/máquina","Tombamento de veículo/máquina","Atropelamento","Perda de controle/saída de pista","Falha mecânica de veículo (roda/eixo/engate/freio)","Contato com rede elétrica","Movimentação/queda de carga transportada","Incêndio","Rompimento/vazamento","Quebra/falha de equipamento ou estrutura","Acidente de trajeto","Ergonômico/postura","Outro"],
  atividades: ["Transporte de cana","Colheita mecanizada","Transbordo","Enlonamento/desenlonamento","Engate/desengate de carretas","Transporte de máquinas (prancha)","Fertirrigação/vinhaça/irrigação","Plantio/tratos culturais/trabalho rural manual","Operação de trator/preparo de solo","Combate a incêndio/brigada","Manutenção automotiva/agrícola","Manutenção mecânica industrial","Manutenção elétrica","Operação industrial","Laboratório","Limpeza/conservação","Restaurante/cozinha","Administrativo/escritório","Movimentação manual de materiais","Armazém/empilhadeira","Acesso e descida de máquina/veículo","Deslocamento a pé","Condução de veículo leve/ônibus","Obras/serviços gerais","Transporte de insumos/resíduos (torta, vinhaça, combustível)","Regulagem/engate de implemento","Outro"],
  agentes: ["Caminhão canavieiro/rodotrem","Trator/transbordo","Colhedora","Veículo leve","Ônibus","Caminhão (prancha, bombeiro, oficina, basculante, munck)","Implemento/máquina agrícola","Empilhadeira/ponte rolante","Ferramenta manual","Ferramenta elétrica/máquina portátil","Escada/plataforma/acesso elevado","Piso/terreno","Equipamento industrial","Painel/rede elétrica","Produto químico","Vapor/água quente/superfície quente","Fogo/chama","Material/carga/peça","Animal/inseto","Adutora/tubulação","Estrutura/mobiliário","Facão/lâmina","Vegetação/árvore/cana","Outro"],
  juizo: ['falta de atenção','desatenção','desatento','descuido','negligên','imprudên','imperícia','não teve cuidado','não prestou atenção','deveria','ato inseguro','condição insegura','falha operacional','falha humana','disciplina operacional','culpa','possível','possivelmente','provavelmente','acredita-se','talvez','comportamento inadequado','displicên','distraído','excesso de confiança'],
  categorias: ['método','método de trabalho','mão de obra','máquina','material','meio ambiente','medição','epi','epis','gestão','falha operacional','falha humana','liderança','treinamento','comportamento'],
  disciplinar: ['medida disciplinar','medida administrativa','advertência','suspensão','punição','desligamento'],
  matriz:{
    prob:[
      {n:1,t:'Improvável',d:['Nunca aconteceu até a data','Falha de vários sistemas de proteção','Múltiplas falhas humanas em condições adequadas, com treinamento e procedimento']},
      {n:2,t:'Remota',d:['Dupla falha humana em condições adequadas, com treinamento e procedimento','Falha dupla de equipamentos','Ruptura de equipamentos e acessórios sujeitos a condições e inspeções adequadas']},
      {n:3,t:'Ocasional',d:['Única falha humana em condições adequadas, com treinamento e procedimento','Única falha de componente','Ruptura de equipamentos e acessórios não degradados, mas com inspeções deficientes']},
      {n:4,t:'Provável',d:['Única falha humana por inexistência de treinamento e procedimento, em presença de condições de trabalho adequadas','Histórico de ocorrências ou situação semelhante em plantas similares','Ruptura de equipamentos e acessórios degradados e com inspeções deficientes']},
      {n:5,t:'Frequente',d:['Única falha humana, atividade frequente por inexistência de treinamento e procedimento, em presença de condições de trabalho adequadas','Muitas ocorrências ou situação semelhante em plantas similares','']}],
    dims:['Pessoas','Meio ambiente','Perdas','Qualidade'],
    grav:[
      {n:1,t:'Leve',d:['Nenhum ferimento ou acidente first aid','Sem emissão ou descarga para o meio ambiente','Nenhuma','Nenhuma retenção']},
      {n:2,t:'Baixa',d:['Acidente first aid ou sem afastamento – tratamento médico','Pequena ocorrência ambiental','Até R$ 25 mil','Violação de variáveis críticas, sem perda de especificação do produto final']},
      {n:3,t:'Moderada',d:['Acidente com afastamento ou doença ocupacional','Ocorrência na área da empresa, reversível com ações mitigadoras','De R$ 25 mil até R$ 250 mil','Falha no processo operacional com necessidade de reprocesso']},
      {n:4,t:'Crítica',d:['Vítimas com lesões incapacitantes permanentes ou algumas vítimas fatais','Paralisa o tratamento de efluentes ou grande ocorrência em meio frágil ou comunidade sensível','De R$ 250 mil até R$ 1 milhão','Material fora de especificação para vários clientes, com algumas reclamações']},
      {n:5,t:'Catastrófica',d:['Várias vítimas fatais','Grande dano ambiental com impacto em área > 1.000 m²','Maior que R$ 1 milhão','Material fora de especificação para vários clientes, com várias reclamações e perda de produção']}],
    nivel:v=>v<=4?'Baixo':v<=12?'Médio':'Alto',
    aceit:{Baixo:'Os riscos devem ser gerenciados na busca pela Perda Zero.',Médio:'Medidas de controle para redução de risco devem ser adotadas ao menor nível razoavelmente alcançável.',Alto:'Medidas de controle ao menor nível razoavelmente alcançável; o critério de aceitabilidade deve ser endossado pela gerência da unidade.'}
  }
};
const STATUS = {
  elaboracao:{t:'Em elaboração',c:'st-elaboracao'},
  devolvida:{t:'Devolvida para ajustes',c:'st-devolvida'},
  aprovacao:{t:'Em aprovação',c:'st-aprovacao'},
  assinatura:{t:'Aguardando assinatura do comitê',c:'st-assinatura'},
  concluida:{t:'Concluída',c:'st-concluida'}
};
/* Usuários do protótipo (no sistema final vêm do login do Portal) */
const USERS = {
  tecnico:{nome:'Técnico de Segurança JB',ini:'TS',perfil:'Técnico de Segurança',unidade:'JB'},
  supervisor:{nome:'Supervisor de Segurança JB',ini:'SS',perfil:'Supervisor de Segurança',unidade:'JB'},
  admin:{nome:'Tifani Kichelewski',ini:'TK',perfil:'Administradora SSMA',unidade:null}
};

/* ---------- utilitários ---------- */
const $=s=>document.querySelector(s);
const uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const opts=(arr,v,ph='Selecione')=>`<option value="">${ph}</option>`+arr.map(o=>`<option ${o===v?'selected':''}>${esc(o)}</option>`).join('');
const brDate=d=>{if(!d)return '';const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(d);return m?`${m[3]}/${m[2]}/${m[1]}`:d};
const addDays=(d,n)=>{if(!d)return '';const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const nowStr=()=>{const d=new Date();return `${brDate(today())} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`};
const daysBetween=(a,b)=>Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5);
function getPath(o,p){return p.split('.').reduce((a,k)=>a==null?a:a[k],o)}
function setPath(o,p,v){const ks=p.split('.');let a=o;for(let i=0;i<ks.length-1;i++){if(a[ks[i]]==null)a[ks[i]]={};a=a[ks[i]]}a[ks.at(-1)]=v}
function tempoEntre(d1,d2){
  if(!d1||!d2)return '';const a=new Date(d1+'T12:00:00'),b=new Date(d2+'T12:00:00');if(b<a)return '';
  let m=(b.getFullYear()-a.getFullYear())*12+(b.getMonth()-a.getMonth());let d=b.getDate()-a.getDate();if(d<0){m--;d+=new Date(b.getFullYear(),b.getMonth(),0).getDate()}
  const y=Math.floor(m/12);m%=12;const p=[];if(y)p.push(y+(y>1?' anos':' ano'));if(m)p.push(m+(m>1?' meses':' mês'));if(d||!p.length)p.push(d+(d!==1?' dias':' dia'));
  return p.length>1?p.slice(0,-1).join(', ')+' e '+p.at(-1):p[0];
}
function safraDe(d){if(!d)return '';const y=+d.slice(0,4),m=+d.slice(5,7);const s=m>=4?y:y-1;return `${String(s).slice(2)}/${String(s+1).slice(2)}`}
function toast(msg,err){const t=document.createElement('div');t.className='toast'+(err?' err':'');t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),err?6000:3200)}
function hits(txt,list){const s=(txt||'').toLowerCase();return list.filter(w=>s.includes(w))}
function juizoMsg(txt){const h=hits(txt,CONFIG.juizo);return h.length?`<span class="a">“${esc(h.join('”, “'))}” é julgamento ou hipótese. Descreva o que foi observado.</span>`:''}
function catMsg(txt){const s=(txt||'').trim().toLowerCase();const h=CONFIG.categorias.filter(w=>s===w||(s.length<30&&s.includes(w)));return h.length?`<span class="a">Parece uma categoria, não um fato. Cada nó da árvore deve ser um fato concreto.</span>`:''}
function discMsg(txt){return hits(txt,CONFIG.disciplinar).length?`<span class="a">Medida disciplinar não atua na causa. Registre em Regras que Salvam Vidas.</span>`:''}
/* ===================== CAMADA DE DADOS =====================
   No protótipo: localStorage. No sistema final: trocar estas funções
   por chamadas ao Supabase (tabelas investigacoes, historico, config). */
const DBKEY='inv-ssma-v2';
let DB=null;
const DBX={
  load(){try{DB=JSON.parse(localStorage.getItem(DBKEY))}catch(e){DB=null}
    if(!DB||!DB.investigacoes){DB=seed();this.save()}
    DB.config=Object.assign({prazos:{},calcUrl:''},DB.config||{});if(!DB.config.npAplicado){Object.entries(CONFIG.np).forEach(([k,v])=>{if(!DB.config.prazos[k])DB.config.prazos[k]=String(v.dias)});DB.config.npAplicado=true}DB.investigacoes.forEach(i=>{if(typeof syncClass==='function')syncClass(i)});DB.perfil=DB.perfil||'admin';DB.unidade=DB.unidade||'JB';},
  save(){try{localStorage.setItem(DBKEY,JSON.stringify(DB))}catch(e){try{const c=JSON.parse(JSON.stringify(DB));c.investigacoes.forEach(i=>i.fotos=[]);localStorage.setItem(DBKEY,JSON.stringify(c));toast('Fotos não couberam no armazenamento do navegador; os demais dados foram salvos.',true)}catch(e2){}}},
  get(id){return DB.investigacoes.find(i=>i.id===id)},
  reset(){DB=seed();this.save()}
};
let BASE=[];
if(!window.MODO_PROD)fetch('base_historica.json').then(r=>r.json()).then(d=>{BASE=d;if(typeof render==='function')render()}).catch(()=>{BASE=[]});

/* ---------- modelo ---------- */
function novaInv(unidade){
  return {id:'',status:'elaboracao',criadoPor:DB?USERS[DB.perfil].nome:'',criadoEm:today(),concluidaEm:'',pdf:null,devolucao:'',historico:[],
    ocorrencia:{tipo:'Acidente',perda:['Pessoal'],classificacao:'',titulo:'',unidade:unidade||'JB',setor:'',local:'',data:'',hora:'',turno:'',descricao:'',comunicado:'',ocoSenior:'',
      evento:'',atividade:'',agente:'',potencial:{gravidade:'',probabilidade:'',dimensao:'',justificativa:''}},
    envolvido:{nome:'',matricula:'',idade:'',cargo:'',admissao:'',experiencia:'',empresa:'Usina Santa Adélia',tipoLesao:'',parteCorpo:'',cat:''},
    responsavel:{nome:'',cargo:''},validacaoGerente:{nome:'',data:''},senior:'',
    comite:[],fatos:[],fotos:[],arvore:{rootId:null,nodes:[],edges:[]},causas:{},acoes:[],custos:{total:'',pdf:'',obs:''},licoes:[''],ia:null};
}
function proximoId(u,data){
  const s=safraDe(data||today()).replace('/','');const pre=`INV-${u}-${s}-`;
  const n=DB.investigacoes.filter(i=>i.id.startsWith(pre)).map(i=>+i.id.slice(pre.length)).reduce((a,b)=>Math.max(a,b),0)+1;
  return pre+String(n).padStart(3,'0');
}
function hist(inv,acao,obs){inv.historico.unshift({quando:nowStr(),quem:USERS[DB.perfil].nome,acao,obs:obs||''})}

/* ---------- dados de exemplo ---------- */
function mkTree(inv,list,edges,raizes,causas){
  const N={};list.forEach(i=>{N[i]=uid();inv.arvore.nodes.push({id:N[i],fatoId:inv.fatos[i-1].id,raiz:raizes.includes(i)})});
  inv.arvore.rootId=N[list[0]];edges.forEach(([a,b])=>inv.arvore.edges.push({from:N[a],to:N[b]}));
  Object.entries(causas||{}).forEach(([i,c])=>inv.causas[N[i]]={tipo:c[0],elemento:c[1]});return N;
}
const F=(arr)=>arr.map(([texto,fonte])=>({id:uid(),texto,fonte}));
const ACAO=(texto,causas,nivel,responsavel,prazo,status,padrao,ef)=>({id:uid(),texto,causas,nivel:CONFIG.niveis[nivel],responsavel,prazo,status,padrao:padrao||'',ef:ef||{como:'',evidencia:'',resultado:''}});
function seed(){
  const db={investigacoes:[],config:{prazos:Object.fromEntries(Object.entries(CONFIG.np).map(([k,v])=>[k,String(v.dias)])),calcUrl:'',npAplicado:true},perfil:'admin',unidade:'JB'};
  const H=(acao,quem,quando,obs)=>({acao,quem,quando,obs:obs||''});
  /* 1 — enlonamento (em elaboração) */
  let a=novaInv('JB');a.id='INV-JB-2627-031';a.criadoPor=USERS.tecnico.nome;a.criadoEm='2026-10-21';
  Object.assign(a.ocorrencia,{classificacao:'ASA – Primeiros socorros',titulo:'Queda ao solo durante o enlonamento da carreta',setor:'CTT – Transporte de Cana Picada',local:'Agrícola › Frentes de colheita › Frente 2',data:'2026-10-21',hora:'12:56',turno:'A',
    descricao:'Ao puxar a fita utilizada no enlonamento da carreta, a fita se rompeu e o colaborador caiu ao solo (queda do mesmo nível), batendo a região lombar.',comunicado:'COM-2026-0412',
    evento:'Queda do mesmo nível',atividade:'Enlonamento/desenlonamento',agente:'Caminhão canavieiro/rodotrem',potencial:{gravidade:'3',probabilidade:'4',dimensao:'Pessoas',justificativa:''}});
  a.envolvido={nome:'Antônio Ferreira Lima',matricula:'20000001',idade:'66',cargo:'Motorista III',admissao:'2026-03-09',experiencia:'45 anos',empresa:'Usina Santa Adélia',tipoLesao:'Contusão',parteCorpo:'Tronco'};
  a.comite=[{matricula:'20000010',nome:'Supervisor Agrícola (exemplo)',cargo:'Supervisor Agrícola',papel:'Supervisor/Líder da área'},{matricula:'20000012',nome:'Técnico de Segurança JB',cargo:'Técnico de Segurança do Trabalho',papel:'Técnico de Segurança'},{matricula:'20000001',nome:'Antônio Ferreira Lima',cargo:'Motorista III',papel:'Envolvido/Acidentado'}];
  a.responsavel={nome:'Supervisor Agrícola (exemplo)',cargo:'Supervisor Agrícola'};
  a.fatos=F([['O colaborador saiu com o conjunto carregado da Frente 2, a cerca de 1 km da rodovia.','Entrevista – envolvido'],['Após percorrer cerca de 800 m, o colaborador parou para enlonar a carga.','Entrevista – envolvido'],['A carga ainda estava acima das bordas da carreta no momento do enlonamento.','Observação no local'],['A lona ficou presa na carga.','Entrevista – envolvido'],['O colaborador puxou a fita com força para liberar a lona.','Entrevista – envolvido'],['A fita da lona tinha emendas e nós.','Registro fotográfico'],['O checklist diário do caminhão não foi preenchido no dia.','Documento (AST/IT/FOP/checklist)'],['Fita danificada costuma ser amarrada para continuar a operação, sem comunicar à manutenção.','Entrevista – liderança'],['A fita encostou e atritou na estrutura da carreta.','Observação no local'],['A fita se rompeu.','Entrevista – envolvido'],['O colaborador perdeu o equilíbrio.','Entrevista – envolvido'],['Queda ao solo com contusão na região lombar.','Entrevista – envolvido'],['O enlonamento é manual: o motorista precisa puxar a fita (FOP de enlonamento).','Documento (AST/IT/FOP/checklist)'],['O colaborador não prestou atenção à condição da fita.','Entrevista – liderança']]);
  let N=mkTree(a,[12,11,10,5,9,6,4,13,3,2,8,7],[[11,12],[10,11],[5,10],[9,10],[6,10],[4,5],[13,5],[3,4],[2,3],[8,6],[7,6]],[13,3,8,7],{13:['FT2 – Engenharia inadequada','03.2 – Ger. de riscos – segurança do trabalho'],3:['FT5 – Padrões de trabalho inadequados','04.1 – Controle de padrões e procedimentos'],8:['FT1 – Liderança inadequada','06.4 – Disciplina operacional'],7:['','']});
  a.acoes=[ACAO('Inspecionar as fitas de todos os conjuntos rodotrem e substituir as danificadas.',[N[8]],3,'Supervisor Agrícola','2026-10-30','Concluída'),
    ACAO('Estudar sistema de enlonamento pneumático em conjunto piloto, eliminando a necessidade de puxar a fita.',[N[13]],0,'Supervisor Agrícola / Manutenção','2027-04-01','Em andamento'),
    ACAO('Definir ponto fixo de enlonamento após o carregamento, para a carga se acomodar.',[N[3]],3,'Coordenador Agrícola','2026-12-15','Não iniciada'),
    ACAO('Realizar DSSMA com os motoristas do CTT sobre o acidente e as lições aprendidas.',[],3,'Supervisor Agrícola','2026-11-10','Concluída','dssma'),
    ACAO('Realizar ação de abrangência, avaliando condições semelhantes nos demais processos e unidades.',[],3,'Técnico de Segurança JB','2027-01-30','Em andamento','abrangencia'),
    ACAO('Verificar a eficácia das ações implementadas.',[],3,'Supervisor Agrícola','2027-07-30','Não iniciada','eficacia')];
  a.custos={total:'989,69',pdf:'',obs:''};a.licoes=['Realizar o checklist antes de iniciar a atividade e comunicar fita danificada.','Enquanto houver tração manual da fita, o risco de queda continua: priorizar controle de engenharia.'];
  a.historico=[H('Investigação criada a partir do comunicado COM-2026-0412',USERS.tecnico.nome,'21/10/2026 13:30')];
  db.investigacoes.push(a);

  /* 2 — Grunner x poste (em aprovação) */
  let b=novaInv('JB');b.id='INV-JB-2627-034';b.status='aprovacao';b.criadoPor=USERS.tecnico.nome;b.criadoEm='2026-11-01';
  Object.assign(b.ocorrencia,{tipo:'Incidente',perda:['Material'],titulo:'Colisão do transbordo Grunner com poste da rede elétrica',setor:'CTT',local:'Agrícola › Frentes de colheita › Frente 1 – Faz. Ciro Sitta',data:'2026-11-01',hora:'13:50',turno:'B',
    descricao:'Durante manobra em marcha à ré, a traseira do transbordo Grunner frota 100629, carregado, atingiu um poste da rede elétrica de 13,8 kV, que caiu.',comunicado:'COM-2026-0431',
    evento:'Contato com rede elétrica',atividade:'Transbordo',agente:'Trator/transbordo',potencial:{gravidade:'4',probabilidade:'4',dimensao:'Pessoas',justificativa:'Contato com rede de 13,8 kV energizada poderia causar eletrocussão do operador ou de quem se aproximasse. Há histórico de colhedoras e transbordos atingindo a rede em JB e PB nas safras 24/25 e 25/26.'}});
  b.envolvido={nome:'Carlos Henrique Prado',matricula:'20000020',idade:'48',cargo:'Operador de Máquinas Agrícolas II',admissao:'2026-03-09',experiencia:'15 anos e 8 meses',empresa:'Usina Santa Adélia',tipoLesao:'N/A',parteCorpo:'N/A'};
  b.comite=[{matricula:'20000030',nome:'Gerente de Processo Agrícola',cargo:'Gerente',papel:'Gerente da área'},{matricula:'20000010',nome:'Supervisor Agrícola (exemplo)',cargo:'Supervisor Agrícola',papel:'Supervisor/Líder da área'},{matricula:'20000012',nome:'Técnico de Segurança JB',cargo:'Técnico de Segurança do Trabalho',papel:'Técnico de Segurança'},{matricula:'20000040',nome:'Representante CIPA',cargo:'Cipeiro',papel:'Representante CIPA'},{matricula:'20000020',nome:'Carlos Henrique Prado',cargo:'Operador de Máquinas Agrícolas II',papel:'Envolvido/Acidentado'}];
  b.responsavel={nome:'Supervisor Agrícola (exemplo)',cargo:'Supervisor Agrícola'};
  b.fatos=F([['O poste da rede de 13,8 kV caiu.','Observação no local'],['A traseira do Grunner carregado atingiu o poste.','Observação no local'],['O operador fez marcha à ré de cerca de 7 m no carreador.','Entrevista – envolvido'],['A manobra foi feita no carreador, fora do virador fixo previsto na IT.AG.00.17.0002 (7.3.3.1).','Documento (AST/IT/FOP/checklist)'],['A câmera traseira estava ofuscada pelo sol e o retrovisor não mostrava o poste.','Entrevista – envolvido'],['A cerca eletrônica do Grunner estava inoperante.','Sistema/telemetria'],['O poste no carreador não tinha coroamento nem aceiro.','Observação no local'],['Não foi feito o checklist de pré-entrada na área do fornecedor.','Documento (AST/IT/FOP/checklist)'],['Existia trajeto alternativo de cerca de 400 m, não utilizado por ser mais demorado.','Entrevista – envolvido']]);
  N=mkTree(b,[1,2,3,5,6,7,4,8,9],[[2,1],[3,2],[5,2],[6,2],[7,2],[4,3],[9,3],[8,7]],[6,8,4],{6:['FT7 – Manutenção deficiente','04.10 – Uso de veículos automotivos'],8:['FT5 – Padrões de trabalho inadequados','03.2 – Ger. de riscos – segurança do trabalho'],4:['FT1 – Liderança inadequada','06.4 – Disciplina operacional']});
  b.acoes=[ACAO('Manter o bordo e verificar a cerca eletrônica em todos os equipamentos que possuem o dispositivo.',[N[6]],2,'Manutenção Automotiva','2026-12-05','Em andamento'),
    ACAO('Tornar obrigatório o checklist de pré-entrada pelo coordenador nas frentes sem líder, com rotograma, viradores e riscos.',[N[8]],3,'Coordenação Agrícola','2026-12-15','Em andamento'),
    ACAO('Revisar a IT.AG.00.17.0002 e a AST proibindo marcha à ré próxima a redes elétricas e definindo distâncias mínimas.',[N[4]],3,'Supervisor Agrícola','2026-12-15','Não iniciada'),
    ACAO('Realizar DSSMA com operadores de transbordo sobre o incidente e as lições aprendidas.',[],3,'Supervisor Agrícola','2026-11-20','Não iniciada','dssma'),
    ACAO('Verificar condições semelhantes de postes sem coroamento nas áreas de fornecedores de JB e PB.',[],3,'Técnico de Segurança JB','2027-01-15','Não iniciada','abrangencia'),
    ACAO('Verificar a eficácia das ações implementadas.',[],3,'Supervisor Agrícola','2027-05-30','Não iniciada','eficacia')];
  b.custos={total:'1.489,83',pdf:'',obs:'Aguardando retorno da concessionária sobre o reparo do poste.'};b.licoes=['Checklist de pré-entrada identifica rede elétrica, aceiros e viradores antes da colheita.','Sem visibilidade, interromper a manobra em ré e usar sinaleiro.'];
  b.historico=[H('Enviada para aprovação',USERS.tecnico.nome,'12/11/2026 16:05'),H('Investigação criada a partir do comunicado COM-2026-0431',USERS.tecnico.nome,'01/11/2026 15:10')];
  db.investigacoes.push(b);

  /* 3 — desacoplamento (concluída) */
  let c=novaInv('JB');c.id='INV-JB-2627-027';c.status='concluida';c.concluidaEm='2026-10-06';c.criadoPor=USERS.tecnico.nome;c.criadoEm='2026-09-26';
  Object.assign(c.ocorrencia,{tipo:'Incidente',perda:['Material'],titulo:'Desacoplamento da segunda carreta na rodovia',setor:'CTT – Transporte de cana picada',local:'Rodovia Nemésio Cadetti – Faz. Paraguaçu',data:'2026-09-26',hora:'13:20',turno:'B',
    descricao:'Durante o transporte de cana, o pino da boca de lobo levantou e a segunda carreta desacoplou, rompendo corrente, instalação elétrica e sistema de ar, com travamento das rodas.',comunicado:'COM-2026-0377',
    evento:'Falha mecânica de veículo (roda/eixo/engate/freio)',atividade:'Transporte de cana',agente:'Caminhão canavieiro/rodotrem',potencial:{gravidade:'4',probabilidade:'3',dimensao:'Pessoas',justificativa:'Desacoplamento em rodovia poderia atingir outros veículos.'}});
  c.envolvido={nome:'José Roberto Matos',matricula:'20000050',idade:'61',cargo:'Motorista III',admissao:'2026-03-09',experiencia:'3 anos e 7 meses',empresa:'Usina Santa Adélia',tipoLesao:'N/A',parteCorpo:'N/A'};
  c.comite=[{matricula:'20000030',nome:'Gerente de Processo Agrícola',cargo:'Gerente',papel:'Gerente da área'},{matricula:'20000010',nome:'Supervisor Agrícola (exemplo)',cargo:'Supervisor Agrícola',papel:'Supervisor/Líder da área'},{matricula:'20000012',nome:'Técnico de Segurança JB',cargo:'Técnico de Segurança do Trabalho',papel:'Técnico de Segurança'},{matricula:'20000040',nome:'Representante CIPA',cargo:'Cipeiro',papel:'Representante CIPA'}];
  c.responsavel={nome:'Supervisor Agrícola (exemplo)',cargo:'Supervisor Agrícola'};c.validacaoGerente={nome:'Gerente de Processo Agrícola',data:'2026-10-03'};
  c.fatos=F([['A segunda carreta desacoplou do conjunto durante o retorno pelo trevo.','Entrevista – envolvido'],['O pino da boca de lobo levantou durante o deslocamento.','Observação no local'],['A trava do pino não estava na posição correta.','Registro fotográfico'],['A diferença visual entre a posição correta e a incorreta da trava é sutil.','Registro fotográfico'],['A FOP de engate não descreve a conferência da trava do pino.','Documento (AST/IT/FOP/checklist)'],['O travamento do engate é manual, com conferência visual.','Documento (AST/IT/FOP/checklist)']]);
  N=mkTree(c,[1,2,3,4,5,6],[[2,1],[3,2],[4,3],[5,3],[6,3]],[4,5,6],{4:['FT2 – Engenharia inadequada','05.3 – Informação de equipamentos e instalações'],5:['FT5 – Padrões de trabalho inadequados','04.1 – Controle de padrões e procedimentos'],6:['FT2 – Engenharia inadequada','03.2 – Ger. de riscos – segurança do trabalho']});
  c.acoes=[ACAO('Revisar AST AGR 17, IT.AG.00.10.0001 e FOP com fotos da posição correta e incorreta da trava.',[N[5]],3,'Supervisor Agrícola','2026-11-30','Concluída','',{como:'Acompanhamento de 20 engates no pátio: todos conferidos conforme a nova FOP.',evidencia:'https://sharepoint/…/eficacia-fop-engate',resultado:'Eficaz'}),
    ACAO('Avaliar com a Manutenção trava adicional ou indicador visual de travamento da boca de lobo.',[N[4],N[6]],2,'Manutenção Automotiva','2027-01-30','Em andamento'),
    ACAO('Realizar DSSMA com os condutores sobre o travamento da trava.',[],3,'Supervisor Agrícola','2026-10-20','Concluída','dssma'),
    ACAO('Verificar engates de todos os conjuntos de JB e PB.',[],3,'Técnico de Segurança JB','2026-12-15','Em andamento','abrangencia'),
    ACAO('Verificar a eficácia das ações implementadas.',[],3,'Supervisor Agrícola','2027-04-30','Não iniciada','eficacia')];
  c.custos={total:'3.120,00',pdf:'',obs:''};c.licoes=['A trava do pino deve ser conferida antes de iniciar o deslocamento.','Etapas críticas do engate precisam constar no procedimento com critério claro de conferência.'];
  c.pdf={nome:'INV-JB-2627-027 - relatório assinado pelo comitê.pdf',data:'06/10/2026',por:USERS.tecnico.nome};
  c.historico=[H('Concluída com o PDF assinado anexado',USERS.tecnico.nome,'06/10/2026 17:40'),H('Aprovada',USERS.supervisor.nome,'03/10/2026 09:12'),H('Enviada para aprovação',USERS.tecnico.nome,'02/10/2026 18:20'),H('Investigação criada',USERS.tecnico.nome,'26/09/2026 16:00')];
  db.investigacoes.push(c);

  /* 4 — roda solta do semirreboque (nova, reincide sobre a 027) */
  let d=novaInv('JB');d.id='INV-JB-2627-038';d.criadoPor=USERS.tecnico.nome;d.criadoEm='2026-11-10';
  Object.assign(d.ocorrencia,{tipo:'Incidente',perda:['Material'],titulo:'Roda do semirreboque se soltou no trajeto carregado',setor:'CTT – Transporte de cana picada',local:'Agrícola › Estradão São Domingos',data:'2026-11-10',hora:'09:40',turno:'A',
    descricao:'Ao chegar à balança de cana, o motorista constatou que uma das rodas do semirreboque havia se soltado durante o trajeto carregado.',comunicado:'COM-2026-0455',
    evento:'Falha mecânica de veículo (roda/eixo/engate/freio)',atividade:'Transporte de cana',agente:'Caminhão canavieiro/rodotrem'});
  d.historico=[H('Investigação criada a partir do comunicado COM-2026-0455',USERS.tecnico.nome,'10/11/2026 11:15')];
  db.investigacoes.push(d);

  /* 5 — PB aguardando assinatura */
  let e=novaInv('PB');e.id='INV-PB-2627-019';e.status='assinatura';e.criadoPor='Técnico de Segurança PB';e.criadoEm='2026-10-15';
  Object.assign(e.ocorrencia,{classificacao:'ASA – Trabalho restrito',titulo:'Torção do pé durante o enlonamento da trela',setor:'CTT',local:'Agrícola › Pátio de cana',data:'2026-10-15',hora:'10:30',turno:'A',
    descricao:'Durante o tensionamento da corda no enlonamento da trela, a corda escapou e o motorista caiu, torcendo o pé direito.',comunicado:'COM-2026-0420',
    evento:'Queda do mesmo nível',atividade:'Enlonamento/desenlonamento',agente:'Caminhão canavieiro/rodotrem',potencial:{gravidade:'3',probabilidade:'4',dimensao:'Pessoas',justificativa:'Queda no enlonamento já causou fraturas (histórico 2022 a 2025).'}});
  e.envolvido={nome:'Paulo César Duarte',matricula:'60000010',idade:'52',cargo:'Motorista III',admissao:'2019-04-01',experiencia:'20 anos',empresa:'Usina Santa Adélia',tipoLesao:'Entorse',parteCorpo:'Pé'};
  e.historico=[H('Aprovada',`Supervisor de Segurança PB`,'28/10/2026 10:02'),H('Enviada para aprovação','Técnico de Segurança PB','24/10/2026 17:30'),H('Investigação criada','Técnico de Segurança PB','15/10/2026 14:00')];
  db.investigacoes.push(e);
  return db;
}

/* ---------- regras ---------- */
let S=null; // investigação aberta
const fatoById=id=>S.fatos.find(f=>f.id===id);
const nodeById=id=>S.arvore.nodes.find(n=>n.id===id);
const nodeText=n=>fatoById(n?.fatoId)?.texto||'(fato removido)';
const ants=id=>S.arvore.edges.filter(e=>e.to===id).map(e=>e.from);
const cons=id=>S.arvore.edges.filter(e=>e.from===id).map(e=>e.to);
function reaches(a,b){const st=[a],seen=new Set();while(st.length){const x=st.pop();if(x===b)return true;if(seen.has(x))continue;seen.add(x);cons(x).forEach(c=>st.push(c))}return false}
function prune(){const A=S.arvore;if(!A.rootId)return;const keep=new Set();const st=[A.rootId];while(st.length){const x=st.pop();if(keep.has(x))continue;keep.add(x);ants(x).forEach(a=>st.push(a))}
  A.nodes=A.nodes.filter(n=>keep.has(n.id));A.edges=A.edges.filter(e=>keep.has(e.from)&&keep.has(e.to));Object.keys(S.causas).forEach(k=>{if(!keep.has(k))delete S.causas[k]})}
const raizes=()=>S.arvore.nodes.filter(n=>n.raiz);
const folhas=()=>S.arvore.nodes.filter(n=>ants(n.id).length===0);
function causaLabel(id){const i=raizes().findIndex(n=>n.id===id);return i<0?'?':'C'+(i+1)}
function potencialDe(inv){const p=inv.ocorrencia.potencial||{};const g=+p.gravidade,pr=+p.probabilidade;if(!g||!pr)return null;const v=g*pr;const nivel=CONFIG.matriz.nivel(v);return {g,p:pr,v,nivel,cls:nivel==='Baixo'?'b':nivel==='Médio'?'m':'a',gt:CONFIG.matriz.grav[g-1].t,pt:CONFIG.matriz.prob[pr-1].t}}
function normInv(inv){if(!inv.ocorrencia.ocoSenior)inv.ocorrencia.ocoSenior=(typeof SENIOR_VINCULO!=='undefined'&&SENIOR_VINCULO[inv.id])||'';inv.responsavel=inv.responsavel||{nome:'',cargo:''};inv.validacaoGerente=inv.validacaoGerente||{nome:'',data:''};inv.senior=inv.senior||'';inv.envolvido.cat=inv.envolvido.cat||'';inv.acoes.forEach(a=>{a.ef=a.ef||{como:'',evidencia:'',resultado:''};if(a.ef.resultado==='Não eficaz')a.ef.resultado='Ineficaz'})}
const nomeTokens=inv=>{const STOP=['de','da','do','dos','das','e','exemplo'];return (inv.envolvido?.nome||'').toLowerCase().split(/\s+/).filter(t=>t.length>3&&!STOP.includes(t))};
const analiseObrigatoria=inv=>{const o=inv.ocorrencia;return o.tipo==='Acidente'||o.classificacao==='Incidente – Alto potencial'};
function syncClass(inv){normInv(inv);const o=inv.ocorrencia;if(o.tipo!=='Incidente')return;const P=potencialDe(inv);o.classificacao=P?`Incidente – ${P.nivel} potencial`:''}
function prazoDe(inv){const o=inv.ocorrencia;if(!analiseObrigatoria(inv))return '';const dias=+DB.config.prazos[o.classificacao];if(!o.data||!dias)return '';return addDays(o.data,dias)}
function situacaoPrazo(inv){const p=prazoDe(inv);if(!p)return null;
  if(inv.status==='concluida'){return inv.concluidaEm&&inv.concluidaEm>p?{t:'Concluída fora do prazo',c:'w'}:{t:'No prazo',c:'o'}}
  const d=daysBetween(today(),p);if(d<0)return {t:`Vencido há ${-d} dia${d===-1?'':'s'}`,c:'e'};if(d<=2)return {t:d===0?'Vence hoje':`Vence em ${d} dia${d===1?'':'s'}`,c:'w'};return {t:`${d} dias restantes`,c:''}}

/* casos semelhantes (base histórica + outras investigações) */
function semelhantes(inv){
  const o=inv.ocorrencia;if(!o.evento&&!o.atividade)return [];
  const sc=(e,a,g)=>(e&&e===o.evento&&a===o.atividade?3:0)||(e===o.evento&&g&&g===o.agente?2:0)||(a===o.atividade&&g&&g===o.agente?1:0);
  const out=[];
  BASE.forEach(r=>{const s=sc(r.e,r.a,r.g);if(s>=2)out.push({s,fonte:'Base histórica',id:r.id,u:r.u,d:r.d,t:r.t,c:r.c,ds:r.ds,cr:r.cr,ac:r.ac,f:r.f,o:r.o})});
  DB.investigacoes.forEach(x=>{if(x.id===inv.id)return;const q=x.ocorrencia;const s=sc(q.evento,q.atividade,q.agente);if(s>=2)out.push({s,fonte:'Sistema',id:x.id,u:q.unidade,d:q.data,t:q.tipo,c:q.classificacao,ds:q.descricao,cr:'',ac:x.acoes.filter(a=>!a.padrao).map(a=>a.texto).join(' | '),inv:x.id})});
  return out.sort((a,b)=>b.s-a.s||(b.d||'').localeCompare(a.d||''));
}
/* reincidência após a conclusão (eficácia) */
function reincidencias(inv){
  if(inv.status!=='concluida'||!inv.concluidaEm)return [];const o=inv.ocorrencia;if(!o.evento||!o.atividade)return [];
  return DB.investigacoes.filter(x=>x.id!==inv.id&&x.ocorrencia.evento===o.evento&&x.ocorrencia.atividade===o.atividade&&x.ocorrencia.data>inv.concluidaEm);
}

/* ---------- permissões ---------- */
const perfil=()=>DB.perfil;
const mesmaUnidade=inv=>!USERS[perfil()].unidade||USERS[perfil()].unidade===inv.ocorrencia.unidade;
const P={
  editar:inv=>['elaboracao','devolvida'].includes(inv.status)&&mesmaUnidade(inv),
  enviar:inv=>P.editar(inv),
  aprovar:inv=>inv.status==='aprovacao'&&(perfil()==='admin'||(perfil()==='supervisor'&&mesmaUnidade(inv))),
  anexarPdf:inv=>inv.status==='assinatura'&&mesmaUnidade(inv),
  acompanharAcoes:inv=>['assinatura','concluida'].includes(inv.status)&&mesmaUnidade(inv),
  reabrir:inv=>inv.status==='concluida'&&perfil()==='admin',
  criar:()=>true,
  config:()=>perfil()==='admin'
};

/* ===================== SÊNIOR (tabela ocorrencias_senior do Supabase) =====================
   No sistema final esta lista vem do Supabase (robô diário das 7h40), só para a Segurança.
   No protótipo: registros FICTÍCIOS no mesmo formato da tabela. */
let SENIOR_CARGA='2026-11-19 07:40';
let SENIOR=[
 {num_ocorrencia:9310,tipo_ocorrencia:'Acidente',data_ocorrencia:'2026-11-18',hora_ocorrencia:'09:20',local_ocorrencia:'Caminhões (JB)',descricao_ocorrencia:'Durante a troca da lona de freio da carreta, a talhadeira escapou e atingiu o dorso da mão esquerda do mecânico.',especie_acidente:'Acidente Típico',tipo_acidente:'Atingido por...',agente_causador:'Ferramenta manual',tipo_esocial:'Típico',gravidade_saude:'Leve',matricula_acidentado:'20000101',nome_acidentado:'Rogério Alves Nunes',cargo:'Mecânico Automotivo II',data_admissao:'2019-02-11',data_nascimento:'1988-07-03',unidade:'Jaboticabal',gerencia:'Gerência Automotiva',supervisao:'Supervisão Manutenção Automotiva - JB',parte_do_corpo:'Mão Esquerda',natureza_lesao:'Corte',descricao_lesao:null,usava_epi:'S',jornada_ate_acidente:'02:20',cat:'68/2026',qtd_cat:1,inicio_afastamento:null,fim_afastamento:null,dias_afastado:null,afastamento_em_aberto:null,passou_para_inss:null,classificacao_sugerida:'ASA'},
 {num_ocorrencia:9308,tipo_ocorrencia:'Acidente',data_ocorrencia:'2026-11-16',hora_ocorrencia:'15:40',local_ocorrencia:'Fábrica de Açúcar (JB)',descricao_ocorrencia:'Durante deslocamento a pé para acionar a centrífuga, a colaboradora sentiu dor no joelho direito após mudar de direção.',especie_acidente:'Acidente Típico',tipo_acidente:'ENTORSE',agente_causador:'Piso / solo / chão',tipo_esocial:'Típico',gravidade_saude:'Moderada',matricula_acidentado:'20000102',nome_acidentado:'Márcia Regina Toledo',cargo:'Operador Industrial II',data_admissao:'2015-04-06',data_nascimento:'1979-11-21',unidade:'Jaboticabal',gerencia:'Gerência Industrial - JB',supervisao:'Supervisão Processos Industriais - JB',parte_do_corpo:'Joelho Direito',natureza_lesao:'Entorse',descricao_lesao:null,usava_epi:'S',jornada_ate_acidente:'07:40',cat:'67/2026',qtd_cat:1,inicio_afastamento:'2026-11-17',fim_afastamento:null,dias_afastado:3,afastamento_em_aberto:'Sim',passou_para_inss:'Não',classificacao_sugerida:'ACA'},
 {num_ocorrencia:9305,tipo_ocorrencia:'Acidente',data_ocorrencia:'2026-11-12',hora_ocorrencia:'06:50',local_ocorrencia:'Coordenação Automotiva (PB)',descricao_ocorrencia:'Ao seguir de casa para a usina de motocicleta, o colaborador derrapou na rotatória e caiu.',especie_acidente:'Acidente de Trajeto',tipo_acidente:'QUEDA DE VEÍCULO EM MOVIMENTO',agente_causador:'Motocicleta',tipo_esocial:'Trajeto',gravidade_saude:'Leve',matricula_acidentado:'60000103',nome_acidentado:'Fábio Luiz Camargo',cargo:'Eletricista Automotivo I',data_admissao:'2025-03-10',data_nascimento:'2003-05-14',unidade:'Pereira Barreto',gerencia:'Gerência Automotiva',supervisao:'Supervisão Manutenção Automotiva - PB',parte_do_corpo:'Joelho Esquerdo',natureza_lesao:'Escoriação',descricao_lesao:null,usava_epi:'A',jornada_ate_acidente:'00:00',cat:'65/2026',qtd_cat:1,inicio_afastamento:null,fim_afastamento:null,dias_afastado:null,afastamento_em_aberto:null,passou_para_inss:null,classificacao_sugerida:'Trajeto (não conta – NP 3.2)'},
 {num_ocorrencia:9302,tipo_ocorrencia:'Acidente',data_ocorrencia:'2026-11-10',hora_ocorrencia:'14:10',local_ocorrencia:'Irrigação (PB)',descricao_ocorrencia:'Ao montar a tubulação de irrigação, o colaborador foi picado por uma abelha no pescoço.',especie_acidente:'Acidente Típico',tipo_acidente:'Ataque animal peçonhento',agente_causador:'Abelha',tipo_esocial:'Típico',gravidade_saude:'Leve',matricula_acidentado:'60000104',nome_acidentado:'Tiago Moura Brandão',cargo:'Auxiliar Agrícola',data_admissao:'2026-01-05',data_nascimento:'2001-09-30',unidade:'Pereira Barreto',gerencia:'Gerência Engenharia Agronômica',supervisao:'Supervisão Agrícola - Irrigação - PB',parte_do_corpo:'Pescoço',natureza_lesao:'Picada animal peçonhento',descricao_lesao:null,usava_epi:'S',jornada_ate_acidente:'05:10',cat:'64/2026',qtd_cat:1,inicio_afastamento:null,fim_afastamento:null,dias_afastado:null,afastamento_em_aberto:null,passou_para_inss:null,classificacao_sugerida:'ASA'},
 /* já vinculadas às investigações de exemplo */
 {num_ocorrencia:9286,tipo_ocorrencia:'Acidente',data_ocorrencia:'2026-10-21',hora_ocorrencia:'12:50',local_ocorrencia:'Central (JB)',descricao_ocorrencia:'Estava puxando a corda para enlonamento da carreta quando ela se rompeu e sofreu queda ao solo.',especie_acidente:'Acidente Típico',tipo_acidente:'Queda mesmo nível.',agente_causador:'Rompimento de corda',tipo_esocial:'Típico',gravidade_saude:'Leve',matricula_acidentado:'20000001',nome_acidentado:'Antônio Ferreira Lima',cargo:'Motorista III',data_admissao:'2026-03-09',data_nascimento:'1960-03-03',unidade:'Jaboticabal',gerencia:'Gerência Agrícola CTT e PPT - JB',supervisao:'Supervisão Agrícola - CTT - JB',parte_do_corpo:'Dorso',natureza_lesao:'Contusão',descricao_lesao:null,usava_epi:'S',jornada_ate_acidente:'05:50',cat:'63/2026',qtd_cat:1,inicio_afastamento:'2026-10-24',fim_afastamento:'2026-11-07',dias_afastado:15,afastamento_em_aberto:'Não',passou_para_inss:'Não',classificacao_sugerida:'ACA'},
 {num_ocorrencia:9281,tipo_ocorrencia:'Acidente',data_ocorrencia:'2026-10-15',hora_ocorrencia:'10:30',local_ocorrencia:'Pátio de Cana (PB)',descricao_ocorrencia:'Ao descer da trela durante o enlonamento, o motorista torceu o pé direito.',especie_acidente:'Acidente Típico',tipo_acidente:'ENTORSE',agente_causador:'Piso / solo / chão',tipo_esocial:'Típico',gravidade_saude:'Moderada',matricula_acidentado:'60000010',nome_acidentado:'Paulo César Duarte',cargo:'Motorista III',data_admissao:'2019-04-01',data_nascimento:'1974-06-12',unidade:'Pereira Barreto',gerencia:'Gerência Agrícola CTT e PPT - PB',supervisao:'Supervisão Agrícola - CTT - PB',parte_do_corpo:'Pé Direito',natureza_lesao:'Entorse',descricao_lesao:null,usava_epi:'S',jornada_ate_acidente:'03:30',cat:'61/2026',qtd_cat:1,inicio_afastamento:null,fim_afastamento:null,dias_afastado:null,afastamento_em_aberto:null,passou_para_inss:null,classificacao_sugerida:'ASA'}
];
let SENIOR_VINCULO={'INV-JB-2627-031':9286,'INV-PB-2627-019':9281};
const UNI_SENIOR={'Jaboticabal':'JB','Pereira Barreto':'PB'};
const seniorDe=inv=>{const n=inv&&inv.ocorrencia.ocoSenior;return n?SENIOR.find(s=>s.num_ocorrencia===+n):null};
const isTrajeto=s=>s.tipo_esocial==='Trajeto';
const idadeEm=(nasc,ref)=>{if(!nasc)return '';const a=new Date(nasc+'T12:00:00'),b=new Date((ref||today())+'T12:00:00');let i=b.getFullYear()-a.getFullYear();if(b.getMonth()<a.getMonth()||(b.getMonth()===a.getMonth()&&b.getDate()<a.getDate()))i--;return String(i)};
const semAcento=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function mapLesao(txt){const t=semAcento(txt);if(!t)return '';
 const R=[['amput','Amputação'],['fratur','Fratura'],['entors','Entorse'],['tor[cç]','Entorse'],['luxa','Entorse'],['escoria','Escoriação'],['corto|corte|cortante','Corto-contuso'],['lacer','Lácero-contuso'],['contus|hematoma|pancada|prensad|edema|esmag','Contusão'],['quimic','Queimadura química'],['queimad','Queimadura térmica'],['irrita|picada|ferroad|corpo estranho','Irritação'],['trauma','Trauma']];
 for(const [re,v] of R)if(new RegExp(re).test(t))return v;return 'Outra lesão pessoal'}
function mapParte(txt){const t=semAcento(txt);if(!t)return '';
 const R=[['olho|ocular','Olhos'],['face|rosto|testa|boca|nariz|mandib|supercil','Face'],['cabe[cç]a|cranio','Cabeça'],['dedo|mao|punho|polegar|indicador','Mão'],['joelho','Joelho'],['tornozelo','Tornozelo'],['pe |pe$|halux|calcanhar|dedao do pe','Pé'],['perna|coxa|canela|tibia','Perna'],['braco|antebra|ombro|cotovelo','Braço'],['dorso|costas|torax|tronco|abdom|pescoco','Tronco']];
 for(const [re,v] of R)if(new RegExp(re).test(t))return v;return 'Outro'}
function seniorPendentes(u){return SENIOR.filter(s=>!u||UNI_SENIOR[s.unidade]===u).filter(s=>!DB.investigacoes.some(i=>+i.ocorrencia.ocoSenior===s.num_ocorrencia)).sort((a,b)=>b.data_ocorrencia.localeCompare(a.data_ocorrencia))}
/* Aviso quando o Sênior mudou depois que a investigação foi aberta (ex.: afastamento lançado dias depois) */
function avisoSenior(inv){const s=seniorDe(inv);if(!s)return null;const c=inv.ocorrencia.classificacao||'';
 if(s.classificacao_sugerida==='ACA'&&/^ASA/.test(c))return {tipo:'aca',msg:`O Sênior registrou afastamento por acidente a partir de ${brDate(s.inicio_afastamento)} (${s.dias_afastado} dia${s.dias_afastado>1?'s':''}${s.afastamento_em_aberto==='Sim'?', ainda em aberto':''}). Pelo critério, a classificação passa de ASA para ACA, e o responsável e o prazo seguem o NP 7.2.`};
 return null}
function preencherDoSenior(inv,s){const o=inv.ocorrencia,v=inv.envolvido;
 Object.assign(o,{tipo:'Acidente',perda:['Pessoal'],ocoSenior:s.num_ocorrencia,data:s.data_ocorrencia,hora:s.hora_ocorrencia||'',local:s.local_ocorrencia||'',setor:s.supervisao||s.gerencia||'',descricao:s.descricao_ocorrencia||''});
 if(s.classificacao_sugerida==='ACA')o.classificacao='ACA – Com afastamento';
 if(isTrajeto(s))o.evento='Acidente de trajeto';
 Object.assign(v,{nome:s.nome_acidentado||'',matricula:s.matricula_acidentado||'',cargo:s.cargo||'',admissao:s.data_admissao||'',idade:idadeEm(s.data_nascimento,s.data_ocorrencia),tipoLesao:mapLesao(s.natureza_lesao),parteCorpo:mapParte(s.parte_do_corpo),cat:s.cat||'',empresa:'Usina Santa Adélia'});
}
function stripSenior(etapa){const s=seniorDe(S);if(!s)return '';
 if(etapa===0){const a=avisoSenior(S);
  return `<div class="strip i"><div><b>Dados do Sênior</b> · ocorrência nº ${s.num_ocorrencia} · CAT ${esc(s.cat||'—')} · ${esc(s.especie_acidente||'')}${s.gravidade_saude?` · gravidade (Saúde): ${esc(s.gravidade_saude)}`:''}<br><span class="small">Data, hora, local e relato vieram da CAT. O relato é ponto de partida: os fatos da investigação são levantados no passo 3. Última atualização do Sênior: ${brDate(SENIOR_CARGA.slice(0,10))} às ${SENIOR_CARGA.slice(11)}.</span></div></div>`+
   (isTrajeto(s)?`<div class="strip"><div><b>Acidente de trajeto no Sênior.</b> Abre CAT, mas não entra nos indicadores (NP 3.2).</div></div>`:'')+
   (a?`<div class="strip e"><div><b>Classificação desatualizada.</b> ${esc(a.msg)}${P.editar(S)?` <button class="btn sm" data-act="aplicarACA" style="margin-left:6px">Mudar para ACA</button>`:''}</div></div>`:'')}
 const af=s.inicio_afastamento?`afastado desde ${brDate(s.inicio_afastamento)}${s.fim_afastamento?` até ${brDate(s.fim_afastamento)}`:' (em aberto)'} · ${s.dias_afastado} dia(s)${s.passou_para_inss==='Sim'?' · passou para o INSS':''}`:'sem afastamento registrado';
 return `<div class="strip i"><div><b>Dados da CAT (Sênior)</b><br><span class="small">Natureza da lesão: <b>${esc(s.natureza_lesao||'—')}</b> · Parte do corpo: <b>${esc(s.parte_do_corpo||'—')}</b>${s.descricao_lesao?` · ${esc(s.descricao_lesao)}`:''} · Usava EPI: ${({S:'Sim',N:'Não',A:'Não se aplica'})[s.usava_epi]||'—'} · Jornada até o acidente: ${esc(s.jornada_ate_acidente||'—')} · ${af}<br>Nome, cargo, idade, admissão e CAT foram preenchidos a partir do Sênior. Lesão e parte do corpo foram convertidas para as listas do relatório: confira.</span></div></div>`}
/* ===================== VALIDAÇÃO ===================== */
const STEPS=[{t:'Ocorrência',r:()=>rOcorrencia()},{t:'Envolvido e comitê',r:()=>rEnvolvido()},{t:'Levantamento de fatos',r:()=>rFatos()},{t:'Árvore de causas',r:()=>rArvore()},{t:'Causas raízes',r:()=>rCausas()},{t:'Plano de ação',r:()=>rAcoes()},{t:'Custos e lições',r:()=>rCustos()},{t:'Revisão e relatório',r:()=>rRevisao()}];
function validar(inv){
  const old=S;S=inv;try{
  const V=STEPS.map(()=>[]);const E=(i,m)=>V[i].push({t:'e',m}),A=(i,m)=>V[i].push({t:'a',m});
  const o=inv.ocorrencia;
  [['titulo','Título'],['unidade','Unidade'],['setor','Setor'],['local','Local'],['data','Data'],['hora','Hora'],['descricao','Descrição da ocorrência']].forEach(([k,t])=>{if(!o[k])E(0,`Preencha “${t}”.`)});
  if(o.tipo==='Acidente'&&!o.classificacao)E(0,'Escolha a classificação do acidente.');
  if(!o.perda.length)E(0,'Marque o tipo de perda.');
  if(!o.evento||!o.atividade||!o.agente)E(0,'Classifique o evento (tipo de evento, atividade e agente).');
  const Pp=potencialDe(inv);
  if(o.tipo==='Incidente'){if(!Pp)E(0,'Avalie o potencial na matriz de riscos (define a classificação do incidente).')}else if(!Pp)A(0,'Avalie o potencial do acidente na matriz de riscos (recomendado).');
  if(Pp&&!o.potencial.justificativa?.trim())E(0,'Justifique a avaliação da matriz de riscos.');
  if(o.descricao&&hits(o.descricao,CONFIG.juizo).length)A(0,'A descrição contém termo de julgamento ou hipótese.');
  const v=inv.envolvido;
  if(o.perda.includes('Pessoal')){if(!v.nome)E(1,'Informe o envolvido.');if(!v.cargo)E(1,'Informe o cargo do envolvido.');if(o.tipo==='Acidente'&&!v.tipoLesao)E(1,'Informe o tipo de lesão.');if(o.tipo==='Acidente'&&!v.parteCorpo)E(1,'Informe a parte do corpo.')}
  if(analiseObrigatoria(inv)&&!inv.responsavel?.nome)E(1,`Informe o responsável pela análise (NP 7.2: ${(CONFIG.np[o.classificacao]||{}).resp||'Supervisor da área'}).`);
  const nm=nomeTokens(inv);if(nm.length){const txt=[o.titulo,o.descricao,...inv.fatos.map(f=>f.texto),...inv.licoes].join(' ').toLowerCase();const hit=nm.filter(t=>new RegExp('\\b'+t+'\\b').test(txt));if(hit.length)A(0,`O nome do envolvido (“${hit.join(' ')}”) aparece no texto. O NP 4.2 proíbe identificar o acidentado no relatório.`)}
  const req=CONFIG.comiteMinimo(o.classificacao);const tem=inv.comite.map(c=>c.papel);
  req.forEach(p=>{if(!tem.includes(p))E(1,`Comitê sem “${p}”${p==='Representante CIPA'?' (NP 7.3.2: obrigatório em toda análise)':''}.`)});
  inv.comite.forEach((c,i)=>{if(!c.nome||!c.papel)E(1,`Membro ${i+1} do comitê sem nome ou papel.`)});
  if(inv.fatos.length<5)E(2,`Só ${inv.fatos.length} fato(s) levantado(s).`);
  inv.fatos.forEach((f,i)=>{if(!f.texto.trim())E(2,`Fato F${i+1} está vazio.`);else if(hits(f.texto,CONFIG.juizo).length)A(2,`Fato F${i+1} parece julgamento ou hipótese.`);if(!f.fonte)A(2,`Fato F${i+1} sem fonte.`)});
  const T=inv.arvore;
  if(!T.rootId)E(3,'Defina o evento final (lesão ou dano) para iniciar a árvore.');
  else{
    if(T.nodes.length<4)E(3,'A árvore tem poucos fatos. Continue perguntando “o que foi preciso?”.');
    folhas().forEach(n=>{if(!n.raiz&&n.id!==T.rootId)A(3,`Fato de origem não concluído: “${nodeText(n).slice(0,60)}”.`)});
    T.nodes.forEach(n=>{const t=nodeText(n);if(catMsg(t))A(3,`Nó “${t.slice(0,40)}” parece categoria.`);else if(hits(t,CONFIG.juizo).length)A(3,`Nó “${t.slice(0,40)}” parece julgamento.`)});
    if(!raizes().length)E(3,'Nenhuma causa raiz marcada.');
  }
  raizes().forEach(n=>{const c=inv.causas[n.id]||{};if(!c.tipo)E(4,`${causaLabel(n.id)}: classifique o tipo de causa (FP/FT).`);if(!c.elemento)A(4,`${causaLabel(n.id)}: indique o elemento do sistema de SSMA.`)});
  if(raizes().length&&raizes().every(n=>(inv.causas[n.id]?.tipo||'').startsWith('FP')))A(4,'Todas as causas são fatores pessoais. Verifique causas de sistema e gestão.');
  raizes().forEach(n=>{if(!inv.acoes.some(a=>a.causas.includes(n.id)))E(5,`${causaLabel(n.id)} não tem ação vinculada.`)});
  ['dssma','abrangencia','eficacia'].forEach(p=>{if(!inv.acoes.some(a=>a.padrao===p))E(5,`Falta a ação obrigatória de ${({dssma:'DSSMA',abrangencia:'abrangência',eficacia:'verificação de eficácia'})[p]}.`)});
  inv.acoes.forEach((a,i)=>{const n=`Ação ${i+1}`;if(!a.texto.trim())E(5,`${n} sem descrição.`);if(!a.responsavel.trim())E(5,`${n} sem responsável.`);if(!a.prazo)E(5,`${n} sem prazo.`);else if(o.data&&a.prazo<o.data)E(5,`${n} com prazo anterior à ocorrência.`);if(hits(a.texto,CONFIG.disciplinar).length)A(5,`${n} é medida disciplinar.`);
    if(!a.padrao&&/Concluída/.test(a.status)&&!a.ef.resultado)A(5,`${n} concluída sem análise de eficácia registrada (NP 7.6.1).`);
    if(a.ef.resultado&&(!a.ef.como.trim()||!a.ef.evidencia.trim()))E(5,`${n}: registre como a eficácia foi verificada e a evidência.`);
    if(a.ef.resultado==='Ineficaz'&&!inv.acoes.some(x=>x.substitui===a.id))E(5,`${n} ineficaz: defina uma nova ação (NP 7.6.3).`)});
  const efa=inv.acoes.find(a=>a.padrao==='eficacia');const outras=inv.acoes.filter(a=>a.padrao!=='eficacia'&&a.status!=='Cancelada');
  if(efa&&/Concluída/.test(efa.status)&&outras.some(a=>!/Concluída/.test(a.status)||(!a.padrao&&!a.ef.resultado)))E(5,'A análise de eficácia só pode ser concluída depois que todas as ações forem concluídas e avaliadas.');
  const ef=efa;const ult=outras.map(a=>a.prazo).filter(Boolean).sort().pop();if(ef?.prazo&&ult){if(ef.prazo<ult)A(5,'A análise de eficácia deve ter o último prazo.');else if(daysBetween(ult,ef.prazo)>31)A(5,`NP 7.6.2: a eficácia deve ser analisada em até 1 mês após a última ação (${brDate(addDays(ult,30))}).`)}
  const esp=inv.acoes.filter(a=>!a.padrao);if(esp.length&&!esp.some(a=>/^[123]/.test(a.nivel||'')))A(5,'Nenhuma ação de eliminação, substituição ou engenharia.');
  if(!inv.custos.total)A(6,'Informe o custo total (calculadora).');
  if(!inv.licoes.some(l=>l.trim()))E(6,'Registre pelo menos uma lição aprendida.');
  V[7]=[];return V;
  }finally{S=old}
}
const nErros=V=>V.slice(0,7).reduce((a,v)=>a+v.filter(x=>x.t==='e').length,0);
const etapasOk=V=>V.slice(0,7).filter(v=>!v.some(x=>x.t==='e')).length;

/* ===================== ROTEAMENTO ===================== */
let VIEW='lista',step=0,sel=null,confirmDel=null,iaBusy=false,firstDraw=true,treeScroll=[0,0],listPage=1,histPage=1;
const filtros={q:'',safra:'',tipo:'',cls:'',sit:''};const hf={q:'',safra:'',tipo:'',evento:'',atividade:'',origem:''};
function go(hash){location.hash=hash}
function route(){
  const h=location.hash.replace('#','')||'lista';
  if(h.startsWith('inv-')){const id=h.slice(4);const inv=DBX.get(id);if(inv){S=inv;VIEW='inv';}else{VIEW='lista'}}
  else{VIEW=['lista','historico','config'].includes(h)?h:'lista';S=null}
  render();window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
function render(){
  renderHeader();
  const app=$('#app');
  if(VIEW==='lista')app.innerHTML=pLista();
  else if(VIEW==='historico')app.innerHTML=pHistorico();
  else if(VIEW==='config')app.innerHTML=pConfig();
  else if(VIEW==='inv'&&S){app.innerHTML=pInv();if(step===3)drawTree();applyRO();}
  document.querySelectorAll('.appnav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+(VIEW==='inv'?'lista':VIEW)));
}
function renderHeader(){
  const u=USERS[perfil()];
  if($('#hPerfil'))$('#hPerfil').innerHTML=Object.entries(USERS).map(([k,v])=>`<option value="${k}" ${k===perfil()?'selected':''}>${v.perfil}</option>`).join('');
  const unis=u.unidade?[u.unidade]:['JB','PB','USA'];if(!unis.includes(DB.unidade))DB.unidade=unis[0];
  $('#hUnidade').innerHTML=unis.map(x=>`<option value="${x}" ${x===DB.unidade?'selected':''}>${({JB:'JB · Jaboticabal',PB:'PB · Pereira Barreto',USA:'USA · JB + PB'})[x]}</option>`).join('');
  $('#hUnidade').disabled=unis.length===1;
  $('#uAv').textContent=u.ini;$('#uNome').textContent=u.nome;$('#uPerfil').textContent=u.perfil;
}
const noUnidade=inv=>DB.unidade==='USA'||inv.ocorrencia.unidade===DB.unidade;

/* ===================== LISTAGEM ===================== */
function tituloDe(inv){return inv.ocorrencia.titulo||inv.ocorrencia.descricao.slice(0,80)||'(sem título)'}
function pLista(){
  let L=DB.investigacoes.filter(noUnidade);
  const safras=[...new Set(L.map(i=>safraDe(i.ocorrencia.data)).filter(Boolean))].sort().reverse();
  const q=filtros.q.toLowerCase();
  L=L.filter(i=>(!q||[i.id,tituloDe(i),i.ocorrencia.setor,i.ocorrencia.local,i.envolvido.nome].join(' ').toLowerCase().includes(q))&&(!filtros.safra||safraDe(i.ocorrencia.data)===filtros.safra)&&(!filtros.tipo||i.ocorrencia.tipo===filtros.tipo)&&(!filtros.cls||i.ocorrencia.classificacao===filtros.cls)&&(!filtros.sit||(filtros.sit==='vencido'?situacaoPrazo(i)?.c==='e':i.status===filtros.sit)));
  L.sort((a,b)=>(b.ocorrencia.data||b.criadoEm).localeCompare(a.ocorrencia.data||a.criadoEm));
  const pend=DB.investigacoes.filter(noUnidade).filter(i=>P.aprovar(i)).length;
  const rows=L.map(i=>{const V=validar(i);const ok=i.status==='concluida'?8:etapasOk(V)+(i.status!=='elaboracao'&&i.status!=='devolvida'?1:0);const pt=potencialDe(i);const sp=situacaoPrazo(i);const re=reincidencias(i).length;
    return `<tr data-open="${i.id}"><td class="tab-num"><a class="link" href="#inv-${i.id}">${i.id}</a></td><td class="tab-num">${brDate(i.ocorrencia.data)}</td>
    <td class="desc"><b title="${esc(tituloDe(i))}">${esc(tituloDe(i))}</b><span>${esc(i.ocorrencia.setor)}${i.ocorrencia.local?' · '+esc(i.ocorrencia.local.split('›').pop().trim()):''}</span></td>
    <td>${i.envolvido.nome?`<b style="font-weight:600">${esc(i.envolvido.nome)}</b><br><span class="muted small">${esc(i.envolvido.cargo)}</span>`:'<span class="muted">—</span>'}</td>
    <td>${i.ocorrencia.tipo}</td><td>${esc(i.ocorrencia.classificacao)||'<span class="muted">—</span>'}</td>
    <td>${pt?`<span class="pot ${pt.cls}">${pt.v} · ${pt.nivel}</span>`:'<span class="pot n">—</span>'}</td>
    <td class="small muted" style="white-space:nowrap"><span class="mini">${Array.from({length:8},(_,k)=>`<i class="${k<ok?'f':''}"></i>`).join('')}</span>${ok}/8</td>
    <td><span class="status ${STATUS[i.status].c}">${STATUS[i.status].t}</span>${re?`<br><span class="tag e" style="margin-top:3px">Reincidência após conclusão</span>`:''}</td>
    <td class="tab-num">${prazoDe(i)?brDate(prazoDe(i)):'<span class="muted">—</span>'}${sp?`<br><span class="small" style="color:var(--${sp.c==='e'?'crit':sp.c==='w'?'warn':sp.c==='o'?'ok':'muted'})">${sp.t}</span>`:''}</td></tr>`}).join('');
  const prazoCfg=Object.values(DB.config.prazos).some(Boolean);
  return `<div class="pagehead" style="padding-bottom:14px"><div class="crumbs"><span>SSMA</span><span>/</span><span>Investigações</span></div>
   <div class="titlerow"><div><h1>Investigações de acidentes e incidentes</h1><div class="id">${({JB:'Unidade JB',PB:'Unidade PB',USA:'Unidades JB e PB'})[DB.unidade]}</div></div>
   <div class="actions"><button class="btn primary" data-act="nova">Nova investigação</button></div></div></div>
  <div class="pad">
   ${pend?`<div class="strip i"><div><b>${pend} investigação(ões) aguardando sua aprovação.</b></div><div class="right"><button class="btn sm" data-act="filtroAprov">Ver</button></div></div>`:''}
   ${!prazoCfg?`<div class="strip"><div><b>Prazos de investigação não configurados.</b> Cadastre os prazos do NP.AD.00.03.0002 em Configurações para o sistema controlar vencimentos.</div>${P.config()?`<div class="right"><a class="btn sm" href="#config">Configurar</a></div>`:''}</div>`:''}
   <div class="filters" role="search">
    <div class="fl"><label for="fq">Buscar</label><input id="fq" data-filtro="q" value="${esc(filtros.q)}" placeholder="Nº, título, setor, local ou envolvido"></div>
    <div class="fl"><label for="fsa">Safra</label><select id="fsa" data-filtro="safra">${opts(safras,filtros.safra,'Todas')}</select></div>
    <div class="fl"><label for="fti">Tipo</label><select id="fti" data-filtro="tipo">${opts(['Acidente','Incidente'],filtros.tipo,'Todos')}</select></div>
    <div class="fl"><label for="fcl">Classificação</label><select id="fcl" data-filtro="cls">${opts([...CONFIG.classAcidente,...CONFIG.classIncidente],filtros.cls,'Todas')}</select></div>
    <div class="fl"><label for="fsi">Situação</label><select id="fsi" data-filtro="sit"><option value="">Todas</option>${Object.entries(STATUS).map(([k,v])=>`<option value="${k}" ${filtros.sit===k?'selected':''}>${v.t}</option>`).join('')}<option value="vencido" ${filtros.sit==='vencido'?'selected':''}>Prazo vencido</option></select></div>
    <div><button class="btn" data-act="limparFiltros">Limpar</button></div>
   </div>
   <div class="tablecard"><div class="toolbar"><span class="count tab-num">${L.length} investigaç${L.length===1?'ão':'ões'}</span><span class="sp"></span><span class="small muted">Clique em uma linha para abrir</span></div>
   <div class="scroll"><table class="grid click" style="min-width:1180px"><thead><tr><th>Nº</th><th>Data</th><th>Ocorrência</th><th>Envolvido</th><th>Tipo</th><th>Classificação</th><th>Potencial</th><th>Etapas</th><th>Situação</th><th>Prazo</th></tr></thead>
   <tbody>${rows||`<tr><td colspan="10" class="empty">Nenhuma investigação com esses filtros.</td></tr>`}</tbody></table></div></div>
  </div>`;
}

/* ===================== BASE HISTÓRICA ===================== */
function pHistorico(){
  if(!BASE.length)return `<div class="pad"><div class="section"><div class="body">Carregando a base histórica…</div></div></div>`;
  let L=BASE.filter(r=>DB.unidade==='USA'||r.u===DB.unidade);
  const safras=[...new Set(L.map(r=>r.s))].sort().reverse();const q=hf.q.toLowerCase();
  L=L.filter(r=>(!q||(r.ds+' '+r.cr).toLowerCase().includes(q))&&(!hf.safra||r.s===hf.safra)&&(!hf.tipo||r.t===hf.tipo)&&(!hf.evento||r.e===hf.evento)&&(!hf.atividade||r.a===hf.atividade)&&(!hf.origem||r.o===hf.origem));
  L.sort((a,b)=>(b.d||'').localeCompare(a.d||''));
  const per=50,pages=Math.max(1,Math.ceil(L.length/per));if(histPage>pages)histPage=pages;
  const rows=L.slice((histPage-1)*per,histPage*per).map(r=>`<tr data-hist="${r.id}"><td class="tab-num">${r.id}</td><td class="tab-num">${brDate(r.d)}</td><td>${r.u}</td><td>${r.t}</td><td>${esc(r.c)}</td><td class="desc"><b title="${esc(r.ds)}">${esc(r.ds||'(sem descrição)')}</b><span>${esc(r.a)}</span></td><td>${esc(r.e)}</td><td>${esc(r.p)} · ${esc(r.l)}</td></tr>`).join('');
  return `<div class="pagehead" style="padding-bottom:14px"><div class="crumbs"><span>SSMA</span><span>/</span><span>Base histórica</span></div>
   <div class="titlerow"><div><h1>Base histórica de ocorrências</h1><div class="id">Safras 21/22 a 25/26 · relatórios de investigação e planilha oficial de acidentes · fonte da busca de casos semelhantes</div></div></div></div>
  <div class="pad"><div class="filters">
   <div class="fl"><label for="hq">Buscar no texto</label><input id="hq" data-hf="q" value="${esc(hf.q)}" placeholder="Descrição ou causa"></div>
   <div class="fl"><label for="hs">Safra</label><select id="hs" data-hf="safra">${opts(safras,hf.safra,'Todas')}</select></div>
   <div class="fl"><label for="ht">Tipo</label><select id="ht" data-hf="tipo">${opts(['Acidente','Incidente'],hf.tipo,'Todos')}</select></div>
   <div class="fl"><label for="he">Tipo de evento</label><select id="he" data-hf="evento">${opts(CONFIG.eventos,hf.evento,'Todos')}</select></div>
   <div class="fl"><label for="ha">Atividade</label><select id="ha" data-hf="atividade">${opts(CONFIG.atividades,hf.atividade,'Todas')}</select></div>
   <div><button class="btn" data-act="limparHist">Limpar</button></div></div>
   <div class="tablecard"><div class="toolbar"><span class="count tab-num">${L.length} ocorrências</span><span class="sp"></span><span class="small muted tab-num">Página ${histPage} de ${pages}</span><button class="btn sm" data-hpage="-1" ${histPage<=1?'disabled':''}>‹</button><button class="btn sm" data-hpage="1" ${histPage>=pages?'disabled':''}>›</button></div>
   <div class="scroll"><table class="grid click" style="min-width:1100px"><thead><tr><th>ID</th><th>Data</th><th>Unid.</th><th>Tipo</th><th>Classificação</th><th>Ocorrência / atividade</th><th>Tipo de evento</th><th>Parte · lesão</th></tr></thead><tbody>${rows||'<tr><td colspan="8" class="empty">Nenhum registro.</td></tr>'}</tbody></table></div></div></div>`;
}
function modalHist(id){const r=BASE.find(x=>x.id===id);if(!r)return;
  $('#modal').innerHTML=`<div class="modal" data-close="1"><div class="box"><header>${r.id} · ${r.u} · ${brDate(r.d)}</header><div class="body"><dl class="kv">
   <dt>Tipo / classificação</dt><dd>${r.t} · ${esc(r.c)}</dd><dt>Descrição</dt><dd>${esc(r.ds)||'—'}</dd><dt>Tipo de evento</dt><dd>${esc(r.e)}</dd><dt>Atividade</dt><dd>${esc(r.a)}</dd><dt>Agente</dt><dd>${esc(r.g)}</dd><dt>Parte · lesão</dt><dd>${esc(r.p)} · ${esc(r.l)}</dd>
   <dt>Causas raízes</dt><dd>${esc(r.cr)||'—'}</dd><dt>Ações</dt><dd>${esc(r.ac)||'—'}</dd><dt>Origem</dt><dd>${esc(r.o)}</dd><dt>Relatório</dt><dd class="small">${r.f?esc('S:\\SSMA\\VIDAS\\12 - Análise de Incidentes e Acidentes\\Investigações\\'+r.f.replace(/\//g,'\\')):'—'}</dd></dl></div>
   <footer><button class="btn" data-close="1">Fechar</button></footer></div></div>`}

/* ===================== CONFIGURAÇÕES ===================== */
function pConfig(){
  const ed=P.config();const cls=[...CONFIG.classAcidente,...CONFIG.classIncidente];
  return `<div class="pagehead" style="padding-bottom:14px"><div class="crumbs"><span>SSMA</span><span>/</span><span>Configurações</span></div>
   <div class="titlerow"><div><h1>Configurações</h1><div class="id">${ed?'Alterações valem para todas as investigações abertas.':'Somente o Administrador pode alterar.'}</div></div></div></div>
  <div class="pad" style="max-width:1000px">
   <div class="section"><header><h3>Responsável e prazo da análise</h3><span class="hint">NP.AD.00.03.0002 rev. 05, item 7.2 · prazo em dias a partir da data da ocorrência</span></header>
    <div class="body flush"><table class="edit"><thead><tr><th>Classificação</th><th>Responsável pela análise</th><th style="width:160px">Prazo (dias)</th></tr></thead><tbody>
    ${cls.map(c=>{const n=CONFIG.np[c];return `<tr><td style="padding-top:12px">${c}</td><td style="padding-top:12px">${n?n.resp.replace('Supervisor/Líder da área','Supervisor de área').replace('Gerente da área','Gerente de área'):'<span class="muted">Análise não obrigatória (NP 4.3)</span>'}</td><td><input class="inp" type="number" min="1" data-prazo="${esc(c)}" value="${esc(DB.config.prazos[c]||'')}" ${ed&&n?'':'disabled'} placeholder="—"></td></tr>`}).join('')}</tbody></table></div></div>
   <div class="section"><header><h3>Comitê mínimo</h3><span class="hint">Regra usada na validação da etapa 2</span></header>
    <div class="body"><ul style="margin:0;padding-left:18px;line-height:1.7"><li>Responsável pela análise: Gerente de área (fatalidade e ambiental de grande proporção) ou Supervisor de área (demais) · NP 7.2</li><li>Pelo menos um membro da CIPA/CIPATR em toda análise · NP 4.4 e 7.3.2</li><li>Técnico de Segurança · NP 6.6.5</li><li>Gerente de SSMA em fatalidade e acidente ambiental de grande proporção · NP 6.5.5</li></ul></div></div>
   <div class="section"><header><h3>Calculadora de custos</h3></header><div class="body form">
    <div class="f c12"><label class="l" for="cfgCalc">Endereço da Calculadora de Custo de Incidentes/Acidentes (GitHub Pages)</label><input type="url" id="cfgCalc" data-cfg="calcUrl" value="${esc(DB.config.calcUrl)}" ${ed?'':'disabled'} placeholder="https://tkichelewski-web.github.io/…"></div></div></div>
   ${window.MODO_PROD?'':`<div class="section"><header><h3>Dados do protótipo</h3></header><div class="body"><p class="small muted" style="margin-top:0">No protótipo os dados ficam neste navegador. Restaurar apaga as alterações e volta aos exemplos.</p><button class="btn danger" data-act="resetDB" ${ed?'':'disabled'}>${confirmDel==='db'?'Clique de novo para confirmar':'Restaurar dados de exemplo'}</button></div></div>`}
  </div>`;
}
/* ===================== INVESTIGAÇÃO ===================== */
function pInv(){
  syncClass(S);const o=S.ocorrencia,V=validar(S),pt=potencialDe(S),sp=situacaoPrazo(S),st=STATUS[S.status];const err=nErros(V);
  let acts='';
  if(P.editar(S))acts=`<button class="btn ghost ia-only" data-ia="geral">Revisão com IA</button><button class="btn" data-act="pptRasc">Gerar rascunho do relatório</button><button class="btn primary" data-act="enviar" ${err?`disabled title="Resolva as ${err} pendências obrigatórias"`:''}>Enviar para aprovação</button>`;
  else if(P.aprovar(S))acts=`<button class="btn" data-act="ppt">Ver relatório</button><button class="btn danger" data-act="devolver">Devolver para ajustes</button><button class="btn primary" data-act="aprovar">Aprovar</button>`;
  else if(P.anexarPdf(S))acts=`<button class="btn" data-act="ppt">Gerar relatório para assinatura</button><button class="btn primary" data-act="anexar">Anexar PDF assinado</button>`;
  else if(S.status==='concluida')acts=`<button class="btn" data-act="ppt">Gerar relatório</button>${P.reabrir(S)?'<button class="btn danger" data-act="reabrir">Reabrir</button>':''}`;
  else acts=`<button class="btn" data-act="ppt">Ver relatório</button>`;
  const ok=S.status==='concluida'?8:etapasOk(V);
  const re=reincidencias(S);
  let banner='';
  if(S.status==='devolvida'&&S.devolucao)banner=`<div class="strip"><div><b>Devolvida para ajustes pelo supervisor</b><div>${esc(S.devolucao)}</div></div></div>`;
  else if(S.status==='aprovacao')banner=`<div class="strip i"><div><b>Em aprovação.</b> ${P.aprovar(S)?'Revise as etapas e aprove ou devolva com o motivo.':'A investigação fica somente leitura até o supervisor aprovar ou devolver.'}</div></div>`;
  else if(S.status==='assinatura')banner=`<div class="strip i"><div><b>Aprovada. Aguardando a assinatura do comitê.</b> Gere o relatório, colete as assinaturas em papel e anexe o PDF assinado para concluir. O plano de ação continua editável para acompanhamento.</div></div>`;
  else if(S.status==='concluida')banner=`<div class="strip o"><div><b>Concluída em ${brDate(S.concluidaEm)}.</b> ${S.pdf?`PDF assinado: ${esc(S.pdf.nome)}${S.pdf.path?' <button class="link" data-act="abrirPdf">Abrir</button>':''}.`:''} O acompanhamento das ações e a verificação de eficácia continuam no Plano de ação.</div></div>`;
  if(S.status==='concluida'&&typeof ipInfo==='function')banner+=ipInfo(S);
  if(re.length)banner+=`<div class="strip e"><div><b>Reincidência após a conclusão.</b> ${re.length} ocorrência(s) com a mesma atividade e tipo de evento depois de ${brDate(S.concluidaEm)}: ${re.map(x=>`<a href="#inv-${x.id}">${x.id}</a>`).join(', ')}. As ações desta investigação podem não ter sido eficazes.</div></div>`;
  const stepItems=STEPS.map((s,i)=>{const e=V[i].filter(x=>x.t==='e').length,a=V[i].filter(x=>x.t==='a').length;let sub,c='',done=false;
    if(i===7){sub={concluida:'Concluída',aprovacao:'Em aprovação',assinatura:'Aguardando assinatura'}[S.status]||(err?'Bloqueada até concluir as etapas':'Pronta para enviar');done=S.status==='concluida'}
    else if(e){sub=`${e} pendência${e>1?'s':''}`;c='e'}else if(a){sub=`Concluída · ${a} alerta${a>1?'s':''}`;c='w';done=true}else{sub='Concluída';done=true}
    return `<li class="${i===step?'on':''} ${done?'done':''}"><button data-step="${i}" aria-current="${i===step?'step':'false'}"><span class="dot">${done?'<svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>':i+1}</span><span class="lbl">${s.t}<span class="sub ${c}">${sub}</span></span></button></li>`}).join('');
  const body=step===8?rHistoricoReg():STEPS[step].r();
  return `<div class="pagehead"><div class="crumbs"><a href="#lista">Investigações</a><span>/</span><span class="tab-num">${S.id}</span></div>
   <div class="titlerow"><div><h1>${esc(tituloDe(S))}</h1><div class="id"><span class="tab-num">${S.id}</span>${o.comunicado?`<span>· Comunicado ${esc(o.comunicado)}</span>`:''}<span>· ${esc(S.criadoPor)}</span><span class="status ${st.c}">${st.t}</span></div></div><div class="actions">${acts}</div></div>
   <dl class="keys"><div><dt>Unidade</dt><dd>${o.unidade}</dd></div><div><dt>Data e hora</dt><dd class="tab-num">${brDate(o.data)||'—'} ${o.hora?'· '+o.hora:''}</dd></div><div><dt>Tipo</dt><dd>${o.tipo}${o.perda.length?' · '+o.perda.join(', '):''}</dd></div>
   <div><dt>Classificação</dt><dd>${esc(o.classificacao)||'—'}</dd></div><div><dt>Potencial</dt><dd>${pt?`<span class="pot ${pt.cls}">${pt.v} · ${pt.nivel}</span>`:'<span class="pot n">—</span>'}</dd></div>
   <div><dt>Envolvido</dt><dd>${S.envolvido.nome?`${esc(S.envolvido.nome)} <span class="muted" style="font-weight:400">· ${esc(S.envolvido.cargo)}</span>`:'—'}</dd></div>
   <div><dt>Setor</dt><dd>${esc(o.setor)||'—'}</dd></div><div><dt>Prazo da investigação</dt><dd class="tab-num">${prazoDe(S)?brDate(prazoDe(S)):`<span class="muted" style="font-weight:400">${analiseObrigatoria(S)?(S.ocorrencia.classificacao?'Prazo não configurado':'Defina a classificação'):'Não se aplica (NP 4.3)'}</span>`}${sp?` <span class="tag ${sp.c}">${sp.t}</span>`:''}</dd></div></dl></div>
  <div class="workspace"><aside class="steps" aria-label="Etapas"><h2>Etapas da investigação</h2>
    <div class="prog"><span class="tab-num">${ok} de 8 etapas concluídas</span><div class="bar"><span style="width:${ok/8*100}%"></span></div></div><ol>${stepItems}</ol>
    <div class="grp"><h2 style="padding:0;margin-bottom:6px">Registro</h2><button data-step="8" class="${step===8?'on':''}">Histórico do registro (${S.historico.length})</button></div></aside>
   <div class="main"><div class="content">${banner}${step<8?issuesBox(V,step):''}${body}</div>
    <div class="footbar"><span class="where">${step<8?`Etapa ${step+1} de 8 · ${STEPS[step].t}`:'Histórico do registro'}</span><span class="small muted">${P.editar(S)?'· <span id="salvoMsg">Salvo automaticamente</span>':'· Somente leitura'}</span><span class="sp"></span>
     <button class="btn" data-go="${step-1}" ${step<=0||step===8?'disabled':''}>Voltar</button>${step<7?`<button class="btn primary" data-go="${step+1}">Avançar: ${STEPS[step+1].t}</button>`:''}</div></div></div>`;
}
function issuesBox(V,i){const L=V[i];if(!L.length||!P.editar(S))return '';const e=L.filter(x=>x.t==='e'),a=L.filter(x=>x.t==='a');
  return `<div class="strip ${e.length?'e':''}"><div><b>${e.length?`${e.length} pendência${e.length>1?'s':''} obrigatória${e.length>1?'s':''}`:''}${e.length&&a.length?' e ':''}${a.length?`${a.length} alerta${a.length>1?'s':''} de qualidade`:''} nesta etapa</b><ul>${L.map(x=>`<li>${esc(x.m)}</li>`).join('')}</ul></div></div>`}
function applyRO(){
  const ro=!P.editar(S);document.body.classList.toggle('ro-mode',ro);
  if(!ro)return;const follow=P.acompanharAcoes(S);
  document.querySelectorAll('#app .content input, #app .content select, #app .content textarea, #app .content button').forEach(el=>{
    if((el.dataset.follow||el.closest('[data-subst]'))&&follow)return;if(el.dataset.ia||el.dataset.keep)return;el.disabled=true});
  document.querySelectorAll('#app .content .edit-only').forEach(el=>el.style.display='none');
}

/* ---- Etapa 1 ---- */
function rOcorrencia(){const o=S.ocorrencia;const cls=o.tipo==='Acidente'?CONFIG.classAcidente:CONFIG.classIncidente;
 return stripSenior(0)+npInfo()+`<div class="section"><header><h3>Identificação</h3>${o.comunicado?`<span class="hint">Dados importados do comunicado ${esc(o.comunicado)}</span>`:''}<span class="right edit-only"><button class="link" data-act="comunicado">${o.comunicado?'Trocar comunicado':'Importar do comunicado'}</button></span></header>
  <div class="body form">
   <div class="f c12"><label class="l" for="oTit">Título<span class="req">*</span></label><input type="text" id="oTit" data-bind="ocorrencia.titulo" value="${esc(o.titulo)}" maxlength="90" placeholder="Resumo do que aconteceu, em uma linha"></div>
   <div class="f c4"><span class="lbl2">Tipo de ocorrência<span class="req">*</span></span><div class="radio" role="radiogroup">${['Acidente','Incidente'].map(t=>`<button type="button" data-tipo="${t}" class="${o.tipo===t?'on':''}" aria-pressed="${o.tipo===t}">${t}</button>`).join('')}</div></div>
   <div class="f c4"><span class="lbl2">Tipo de perda<span class="req">*</span></span><div class="checks">${['Pessoal','Material','Ambiental'].map(p=>`<label><input type="checkbox" data-perda="${p}" ${o.perda.includes(p)?'checked':''}> ${p}</label>`).join('')}</div></div>
   ${o.tipo==='Incidente'?`<div class="f c4"><span class="lbl2">Classificação</span><div class="ro">${esc(o.classificacao)||'<span class="muted" style="font-weight:400">Definida pela matriz de riscos</span>'}</div></div>`:`<div class="f c4"><label class="l" for="oCls">Classificação<span class="req">*</span></label><select id="oCls" data-bind="ocorrencia.classificacao" data-re="1">${opts(cls,o.classificacao)}</select></div>`}
   <div class="f c3"><label class="l" for="oUn">Unidade<span class="req">*</span></label><select id="oUn" data-bind="ocorrencia.unidade" ${S.id?'disabled title="Definida na criação"':''}>${opts(['JB','PB'],o.unidade)}</select></div>
   <div class="f c3"><label class="l" for="oDt">Data da ocorrência<span class="req">*</span></label><input type="date" id="oDt" data-bind="ocorrencia.data" data-re="1" value="${esc(o.data)}"></div>
   <div class="f c2"><label class="l" for="oHr">Hora<span class="req">*</span></label><input type="time" id="oHr" data-bind="ocorrencia.hora" value="${esc(o.hora)}"></div>
   <div class="f c4"><label class="l" for="oTu">Turno</label><select id="oTu" data-bind="ocorrencia.turno">${opts(CONFIG.turnos,o.turno)}</select></div>
  </div></div>
 <div class="section"><header><h3>Local e descrição</h3></header><div class="body form">
   <div class="f c4"><label class="l" for="oSe">Setor<span class="req">*</span></label><input type="text" id="oSe" data-bind="ocorrencia.setor" value="${esc(o.setor)}"></div>
   <div class="f c8"><label class="l" for="oLo">Local<span class="req">*</span></label><input type="text" id="oLo" data-bind="ocorrencia.local" value="${esc(o.local)}" placeholder="Grupo de coleção › Coleção › Item"><div class="help"><span>No sistema final, escolhido na hierarquia de locais (locais_com_hierarquia).</span></div></div>
   <div class="f c12"><label class="l" for="oDs">Descrição da ocorrência<span class="req">*</span></label><textarea id="oDs" rows="3" data-bind="ocorrencia.descricao" maxlength="600">${esc(o.descricao)}</textarea>
    <div class="w" id="w-ocorrencia.descricao">${juizoMsg(o.descricao)}</div><div class="help"><span>O que aconteceu, em 1 a 3 frases, sem causas nem julgamentos.</span><span class="tab-num">${o.descricao.length} / 600</span></div></div>
 </div></div>
 <div class="section"><header><h3>Classificação do evento</h3><span class="hint">Usada para buscar casos semelhantes e para a análise de padrões</span></header><div class="body form">
   <div class="f c4"><label class="l" for="oEv">Tipo de evento<span class="req">*</span></label><select id="oEv" data-bind="ocorrencia.evento" data-re="1">${opts(CONFIG.eventos,o.evento)}</select></div>
   <div class="f c4"><label class="l" for="oAt">Atividade<span class="req">*</span></label><select id="oAt" data-bind="ocorrencia.atividade" data-re="1">${opts(CONFIG.atividades,o.atividade)}</select></div>
   <div class="f c4"><label class="l" for="oAg">Agente<span class="req">*</span></label><select id="oAg" data-bind="ocorrencia.agente" data-re="1">${opts(CONFIG.agentes,o.agente)}</select></div>
 </div></div>
 ${rSemelhantes()}
 ${rMatriz()}`}
function npInfo(){const o=S.ocorrencia;const L=[];
 if(o.tipo==='Incidente'&&o.classificacao&&o.classificacao!=='Incidente – Alto potencial')L.push(`<b>Análise não obrigatória.</b> Pelo NP 4.3, só acidentes e incidentes de alto potencial precisam de análise. Este registro pode ser concluído de forma simplificada ou mantido só como comunicado.`);
 if(o.classificacao==='Fatal')L.push(`<b>Fatalidade:</b> reunião extraordinária da CIPA/CIPATR em até 48 horas, registrada em ata (NP 4.6). Análise sob responsabilidade do gerente da área, com participação do Gerente de SSMA, em até 15 dias.`);
 if(o.evento==='Acidente de trajeto')L.push(`<b>Acidente de trajeto:</b> abre CAT, mas não entra nos indicadores de acidente (NP 3.2, nota 1). Envolvendo veículo, só é considerado com boletim de ocorrência.`);
 if(o.evento==='Picada/ataque de animal')L.push(`<b>Animal peçonhento:</b> abre CAT, mas não entra nos indicadores de acidente (NP 3.3, nota 2).`);
 return L.map(x=>`<div class="strip i"><div>${x}</div></div>`).join('')}
function rSemelhantes(){const o=S.ocorrencia;if(!o.evento&&!o.atividade)return '';
  const L=semelhantes(S);const fortes=L.filter(x=>x.s===3);
  if(!BASE.length)return `<div class="section"><header><h3>Casos semelhantes</h3></header><div class="body muted">Carregando a base histórica…</div></div>`;
  return `<div class="section"><header><h3>Casos semelhantes</h3><span class="hint">${L.length?`${fortes.length} com a mesma atividade e tipo de evento · ${L.length-fortes.length} com o mesmo evento e agente`:'Nenhum caso semelhante na base histórica'}</span>
   ${fortes.length&&+(o.potencial?.probabilidade)!==4&&P.editar(S)?`<span class="right"><button class="btn sm edit-only" data-act="prob4">Aplicar probabilidade 4 na matriz</button></span>`:''}</header>
   ${fortes.length?`<div class="strip i" style="margin:12px 16px 0"><div>A matriz define <b>Provável (4)</b> quando há “histórico de ocorrências ou situação semelhante”. Encontramos ${fortes.length} caso(s) com a mesma atividade e o mesmo tipo de evento.</div></div>`:''}
   <div class="body flush">${L.slice(0,6).map(x=>`<div class="sim"><div class="meta"><b>${x.inv?`<a href="#inv-${x.id}">${x.id}</a>`:`<button class="link" data-hist="${x.id}">${x.id}</button>`}</b>${x.u} · ${brDate(x.d)}<br>${x.t}${x.s===3?'<br><span class="tag g">Mesma atividade e evento</span>':''}</div>
    <div class="txt">${esc(x.ds||'(sem descrição)')}${x.ac?`<div class="ac"><b>Ações tomadas:</b> ${esc(x.ac.slice(0,240))}${x.ac.length>240?'…':''}</div>`:''}</div></div>`).join('')}
    ${L.length>6?`<div class="addrow small muted">Mais ${L.length-6} caso(s) na Base histórica.</div>`:''}</div></div>`}
function rMatriz(){const o=S.ocorrencia,pt=o.potencial,M=CONFIG.matriz,Pp=potencialDe(S),inc=o.tipo==='Incidente';
 let h=`<tr><th class="axis">Probabilidade</th>${M.grav.map((g,i)=>`<th class="col">${i+1} · ${g.t}</th>`).join('')}</tr>`;
 for(let p=5;p>=1;p--){h+=`<tr><th>${p} · ${M.prob[p-1].t}</th>`;for(let g=1;g<=5;g++){const v=p*g,n=M.nivel(v),c=n==='Baixo'?'b':n==='Médio'?'m':'a';h+=`<td class="${c} ${Pp&&Pp.p===p&&Pp.g===g?'sel':''} tab-num" data-cell="${p}|${g}" title="${M.prob[p-1].t} × ${M.grav[g-1].t} = ${v} (${n})">${v}</td>`}h+='</tr>'}
 h+=`<tr><th class="axis"></th><th class="axis" colspan="5" style="text-align:center">Gravidade</th></tr>`;
 const di=M.dims.indexOf(pt.dimensao);
 const res=Pp?`<div class="hd"><span class="score">${Pp.v}</span><span class="pot ${Pp.cls}">Potencial ${Pp.nivel.toLowerCase()}</span>${inc?`<span class="small muted">Classificação: ${esc(o.classificacao)}</span>`:''}</div>
   <dl><dt>Gravidade</dt><dd>${Pp.g} · ${Pp.gt}${di>=0?` (${M.dims[di]}): ${M.grav[Pp.g-1].d[di]}`:''}</dd><dt>Probabilidade</dt><dd>${Pp.p} · ${Pp.pt}</dd></dl><div class="acc">${M.aceit[Pp.nivel]}</div>`
   :`<div class="hd"><span class="pot n">Não avaliado</span></div><div class="acc" style="padding-top:10px">Clique numa célula da matriz ou escolha nos critérios abaixo.</div>`;
 return `<div class="section"><header><h3>Avaliação de potencial</h3><span class="hint">Matriz de riscos 5×5 · Baixo 1–4 · Médio 5–12 · Alto 15–25</span><span class="right"><span class="tag">${inc?'Obrigatória para incidentes':'Recomendada para acidentes'}</span></span></header>
  <div class="body"><div class="mx-wrap"><div><div class="scroll"><table class="mx" aria-label="Matriz de riscos">${h}</table></div>
   <div class="legend"><span><i style="background:var(--ok-bg);border:1px solid var(--ok-line)"></i>Baixo (1–4)</span><span><i style="background:var(--warn-bg);border:1px solid var(--warn-line)"></i>Médio (5–12)</span><span><i style="background:var(--crit-bg);border:1px solid var(--crit-line)"></i>Alto (15–25)</span></div></div>
   <div style="display:flex;flex-direction:column;gap:12px"><div class="result">${res}</div>
    <div class="f"><label class="l" for="oJus">Justificativa da avaliação${Pp?'<span class="req">*</span>':''}</label><textarea id="oJus" rows="3" data-bind="ocorrencia.potencial.justificativa" placeholder="Pior consequência realista e motivo da probabilidade escolhida">${esc(pt.justificativa)}</textarea></div></div></div>
   <details class="crit"><summary>Critérios de gravidade</summary><div class="scroll"><table class="ref"><tr><th></th>${M.grav.map(g=>`<th>${g.n} · ${g.t}</th>`).join('')}</tr>${M.dims.map((d,i)=>`<tr><td>${d}</td>${M.grav.map(g=>`<td data-grav="${g.n}|${d}" class="${+pt.gravidade===g.n&&pt.dimensao===d?'sel':''}">${esc(g.d[i])}</td>`).join('')}</tr>`).join('')}</table></div></details>
   <details class="crit"><summary>Critérios de probabilidade</summary><div class="scroll"><table class="ref"><tr><th style="width:140px">Nível</th><th colspan="3">Situação encontrada</th></tr>${M.prob.map(p=>`<tr><td>${p.n} · ${p.t}</td>${p.d.map(x=>`<td data-prob="${p.n}" class="${+pt.probabilidade===p.n?'sel':''}">${esc(x)}</td>`).join('')}</tr>`).join('')}</table></div></details>
  </div></div>`}

/* ---- Etapa 2 ---- */
function rEnvolvido(){const v=S.envolvido,o=S.ocorrencia;const req=CONFIG.comiteMinimo(o.classificacao);const tem=S.comite.map(c=>c.papel);
 return stripSenior(1)+`<div class="section"><header><h3>Responsável pela análise</h3><span class="hint">NP 7.2: ${esc(((CONFIG.np[o.classificacao]||{}).resp||'Supervisor/Líder da área').replace('Supervisor/Líder da área','Supervisor de área').replace('Gerente da área','Gerente de área'))}${analiseObrigatoria(S)?` · prazo de ${DB.config.prazos[o.classificacao]||'—'} dias`:''}</span></header><div class="body form">
   <div class="f c6"><label class="l" for="rNom">Nome${analiseObrigatoria(S)?'<span class="req">*</span>':''}</label><input type="text" id="rNom" data-bind="responsavel.nome" value="${esc(S.responsavel.nome)}"></div>
   <div class="f c6"><label class="l" for="rCar">Cargo</label><input type="text" id="rCar" data-bind="responsavel.cargo" value="${esc(S.responsavel.cargo)}"></div></div></div>
 <div class="section"><header><h3>${o.tipo==='Acidente'?'Acidentado':'Envolvido'}</h3><span class="hint">O nome fica só no sistema: o relatório não identifica o acidentado (NP 4.2)</span></header><div class="body form">
   <div class="f c3"><label class="l" for="eMat">Matrícula</label><div style="display:flex;gap:6px"><input type="text" id="eMat" data-bind="envolvido.matricula" value="${esc(v.matricula)}"><button class="btn edit-only" data-act="ativos">Buscar</button></div></div>
   <div class="f c5"><label class="l" for="eNom">Nome<span class="req">*</span></label><input type="text" id="eNom" data-bind="envolvido.nome" value="${esc(v.nome)}"></div>
   <div class="f c4"><label class="l" for="eEmp">Empresa</label><input type="text" id="eEmp" data-bind="envolvido.empresa" value="${esc(v.empresa)}"></div>
   <div class="f c4"><label class="l" for="eCar">Cargo<span class="req">*</span></label><input type="text" id="eCar" data-bind="envolvido.cargo" value="${esc(v.cargo)}"></div>
   <div class="f c2"><label class="l" for="eIda">Idade</label><input type="number" id="eIda" data-bind="envolvido.idade" value="${esc(v.idade)}"></div>
   <div class="f c3"><label class="l" for="eAdm">Admissão</label><input type="date" id="eAdm" data-bind="envolvido.admissao" value="${esc(v.admissao)}"></div>
   <div class="f c3"><span class="lbl2">Tempo de empresa</span><div class="ro" id="tempoEmp">${esc(tempoEntre(v.admissao,o.data))||'—'}</div></div>
   <div class="f c4"><label class="l" for="eExp">Experiência na atividade</label><input type="text" id="eExp" data-bind="envolvido.experiencia" value="${esc(v.experiencia)}"></div>
   <div class="f c4"><label class="l" for="eLes">Tipo de lesão${o.tipo==='Acidente'?'<span class="req">*</span>':''}</label><select id="eLes" data-bind="envolvido.tipoLesao">${opts(CONFIG.tipoLesao,v.tipoLesao)}</select></div>
   <div class="f c4"><label class="l" for="eCat">CAT (nº, emitida pela Saúde)</label><input type="text" id="eCat" data-bind="envolvido.cat" value="${esc(S.envolvido.cat)}" placeholder="Prazo legal: 24 horas"></div>
   <div class="f c4"><label class="l" for="ePar">Parte do corpo${o.tipo==='Acidente'?'<span class="req">*</span>':''}</label><select id="ePar" data-bind="envolvido.parteCorpo">${opts(CONFIG.parteCorpo,v.parteCorpo)}</select></div>
 </div></div>
 <div class="section"><header><h3>Comitê de análise</h3><span class="hint">Mínimo para ${esc(o.classificacao||'esta classificação')}: ${req.map(p=>`<span class="tag ${tem.includes(p)?'o':'e'}">${esc(p)}</span>`).join(' ')}</span></header>
  <div class="body flush"><div class="scroll"><table class="edit" style="min-width:720px"><thead><tr><th style="width:120px">Matrícula</th><th>Nome</th><th>Cargo</th><th style="width:220px">Papel no comitê</th><th style="width:36px"></th></tr></thead><tbody>
  ${S.comite.map((c,i)=>`<tr><td><input class="inp" data-bind="comite.${i}.matricula" value="${esc(c.matricula)}" aria-label="Matrícula"></td><td><input class="inp" data-bind="comite.${i}.nome" value="${esc(c.nome)}" aria-label="Nome"></td><td><input class="inp" data-bind="comite.${i}.cargo" value="${esc(c.cargo)}" aria-label="Cargo"></td><td><select class="inp" data-bind="comite.${i}.papel" data-re="1" aria-label="Papel">${opts(CONFIG.papeis,c.papel)}</select></td><td><button class="x edit-only" data-del="comite.${i}" title="Remover">✕</button></td></tr>`).join('')||'<tr><td colspan="5" class="empty">Nenhum membro.</td></tr>'}
  </tbody></table></div><div class="addrow edit-only"><button class="btn sm" data-act="addComite">Adicionar membro</button><button class="btn sm" data-act="envNoComite">Incluir o envolvido</button></div></div></div>`}

/* ---- Etapa 3 ---- */
function rFatos(){const usados=new Set(S.arvore.nodes.map(n=>n.fatoId));
 return `<div class="section"><header><h3>Fatos levantados (${S.fatos.length})</h3><span class="hint">Um fato por linha: o que aconteceu ou existia, sem interpretação</span><span class="right ia-only edit-only"><button class="btn sm ghost" data-ia="fatos">Revisar fatos com IA</button></span></header>
  <div class="body flush"><div class="scroll"><table class="edit" style="min-width:760px"><thead><tr><th>Nº</th><th>Fato</th><th style="width:220px">Fonte</th><th style="width:90px">Na árvore</th><th style="width:36px"></th></tr></thead><tbody>
  ${S.fatos.map((f,i)=>`<tr><td class="num">F${i+1}</td><td><textarea class="inp" rows="1" data-bind="fatos.${i}.texto" aria-label="Fato F${i+1}">${esc(f.texto)}</textarea><div class="w" id="w-fatos.${i}.texto">${juizoMsg(f.texto)}</div></td>
   <td><select class="inp" data-bind="fatos.${i}.fonte" aria-label="Fonte">${opts(CONFIG.fontes,f.fonte)}</select></td><td style="padding-top:12px">${usados.has(f.id)?'<span class="tag g">Sim</span>':'<span class="muted small">Não</span>'}</td><td><button class="x edit-only" data-delfato="${i}" title="Remover">✕</button></td></tr>`).join('')||'<tr><td colspan="5" class="empty">Nenhum fato.</td></tr>'}
  </tbody></table></div><div class="addrow edit-only"><button class="btn sm" data-act="addFato">Adicionar fato</button><button class="btn sm" data-act="colar">Colar lista de fatos</button></div><div id="colarBox"></div>${iaBox('fatos')}</div></div>
 <div class="section"><header><h3>Registros fotográficos (${S.fotos.length})</h3><span class="hint">Entram no relatório · não use imagens que permitam reconhecer o acidentado (NP 4.2)</span></header><div class="body">
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">${S.fotos.map((p,i)=>`<div style="border:1px solid var(--line);border-radius:var(--r)"><img src="${p.src}" alt="" style="width:100%;height:130px;object-fit:cover;display:block"><div style="display:flex;gap:4px;padding:6px"><input class="inp" placeholder="Legenda" data-bind="fotos.${i}.legenda" value="${esc(p.legenda)}" aria-label="Legenda"><button class="x edit-only" data-del="fotos.${i}">✕</button></div></div>`).join('')}</div>
  <label class="btn sm edit-only" style="margin-top:10px">Adicionar fotos<input type="file" accept="image/*" multiple id="fotoIn" style="display:none"></label></div></div>`}

/* ---- Etapa 4: árvore ---- */
function rArvore(){const T=S.arvore;
 if(!T.rootId)return `<div class="section"><header><h3>Evento final</h3><span class="hint">A árvore começa pela lesão ou dano e segue para trás: o que foi preciso para isso acontecer?</span></header><div class="body form">
  <div class="f c6"><label class="l" for="rootSel">Escolha um fato</label><select id="rootSel">${opts(S.fatos.map((f,i)=>`F${i+1} – ${f.texto}`),'')}</select></div><div class="f c4"><label class="l" for="rootNew">ou descreva a lesão/dano</label><input type="text" id="rootNew"></div><div class="f c2" style="align-self:end"><button class="btn primary edit-only" data-act="setRoot">Iniciar árvore</button></div></div></div>`;
 return `<div class="tree-wrap"><div><div class="section" style="margin:0"><header><h3>Árvore de causas</h3><span class="hint">O que foi preciso? Foi necessário? Foi suficiente?</span><span class="right small muted"><span class="pot a" style="min-width:0">Evento final</span> <span class="pot m" style="min-width:0">Causa raiz</span></span></header><div class="canvas" id="canvas" style="border:0;border-radius:0"></div></div></div>
  <div class="panel" id="panel">${panelHTML()}</div></div>`}
function panelHTML(){const T=S.arvore;const n=nodeById(sel);
 if(!n)return `<div class="section"><header><h3>Como construir</h3></header><div class="body"><ol style="padding-left:18px;margin:0;line-height:1.6"><li>Selecione o evento final, à direita da árvore.</li><li>Pergunte <b>o que foi preciso</b> para isso acontecer e adicione o antecedente.</li><li><b>Foi necessário?</b> Sem ele, o fato teria acontecido?</li><li><b>Foi suficiente?</b> Se não, adicione o outro antecedente (conjunção).</li><li>Pare num fato sobre o qual a empresa pode agir e marque como <b>causa raiz</b>.</li></ol></div></div>`;
 const fi=S.fatos.findIndex(f=>f.id===n.fatoId);const an=ants(n.id);const usados=new Set(T.nodes.map(x=>x.fatoId));
 const livres=S.fatos.map((f,i)=>({f,i})).filter(x=>!usados.has(x.f.id));const lig=T.nodes.filter(x=>x.id!==n.id&&!an.includes(x.id)&&!reaches(n.id,x.id));const isRoot=n.id===T.rootId;
 let tip='';if(an.length===0&&!n.raiz)tip=`<div class="strip i" style="margin:0 0 10px"><div><b>O que foi preciso</b> para este fato acontecer? Se for uma origem tratável, marque como causa raiz.</div></div>`;else if(an.length===1)tip=`<div class="strip i" style="margin:0 0 10px"><div><b>Foi suficiente?</b> Se o antecedente sozinho não basta, adicione o outro.</div></div>`;
 return `<div class="section"><header><h3>${isRoot?'Evento final':'Fato selecionado'} · F${fi+1}</h3></header><div class="body">
  <textarea class="inp" rows="3" data-bind="fatos.${fi}.texto" aria-label="Texto do fato">${esc(nodeText(n))}</textarea><div class="w" id="w-fatos.${fi}.texto">${juizoMsg(nodeText(n))}${catMsg(nodeText(n))}</div>
  ${isRoot?'':`<label class="checks" style="min-height:0;margin:10px 0"><input type="checkbox" data-raiz="${n.id}" ${n.raiz?'checked':''}> <span><b>Causa raiz</b> · origem sobre a qual a empresa pode agir</span></label>`}
  ${tip}<span class="lbl2">Antecedentes (${an.length})</span>
  ${an.map(a=>`<div style="display:flex;gap:6px;align-items:flex-start;margin-bottom:4px"><span style="flex:1" class="small">${esc(nodeText(nodeById(a)))}</span><button class="x edit-only" data-unlink="${a}" title="Desfazer ligação">✕</button></div>`).join('')||'<p class="small muted" style="margin:0">Nenhum.</p>'}
  <div class="edit-only" style="border-top:1px solid var(--line);margin-top:10px;padding-top:10px"><label class="lbl2" for="addSel">O que foi preciso para isso acontecer?</label><select class="inp" id="addSel"><option value="">Escrever fato novo</option>${livres.map(x=>`<option value="${x.f.id}">F${x.i+1} – ${esc(x.f.texto.slice(0,70))}</option>`).join('')}</select>
   <textarea class="inp" id="addNew" rows="2" style="margin-top:6px" placeholder="Fato novo (entra no levantamento de fatos)"></textarea><button class="btn sm primary" style="margin-top:6px" data-act="addAnt">Adicionar antecedente</button></div>
  ${lig.length?`<div class="edit-only" style="border-top:1px solid var(--line);margin-top:10px;padding-top:10px"><label class="lbl2" for="linkSel">Ligar a fato já existente na árvore</label><div style="display:flex;gap:6px"><select class="inp" id="linkSel">${lig.map(x=>`<option value="${x.id}">${esc(nodeText(x).slice(0,60))}</option>`).join('')}</select><button class="btn sm" data-act="link">Ligar</button></div></div>`:''}
  <div class="edit-only" style="margin-top:12px">${isRoot?`<button class="btn sm danger" data-act="resetTree">${confirmDel==='root'?'Confirmar: apagar árvore':'Recomeçar a árvore'}</button>`:`<button class="btn sm danger" data-act="delNode">${confirmDel===n.id?'Confirmar remoção':'Remover da árvore'}</button>`}</div>
 </div></div>`}
const NW=220,NH=78,COLW=270,ROWH=96,PAD=20;
function wrapText(t,max=30,lines=4){const w=t.split(/\s+/);const out=[];let cur='';for(const x of w){if((cur+' '+x).trim().length>max){if(cur)out.push(cur);cur=x}else cur=(cur+' '+x).trim()}if(cur)out.push(cur);if(out.length>lines){out.length=lines;out[lines-1]=out[lines-1].replace(/.{0,2}$/,'')+'…'}return out}
function layoutTree(){const T=S.arvore;const depth={};depth[T.rootId]=0;let ch=true,it=0;
 while(ch&&it++<500){ch=false;for(const e of T.edges){if(depth[e.to]!=null){const d=depth[e.to]+1;if(depth[e.from]==null||depth[e.from]<d){depth[e.from]=d;ch=true}}}}
 let slot=0;const y={},seen=new Set();(function dfs(id){seen.add(id);const ys=[];for(const a of ants(id)){if(!seen.has(a))ys.push(dfs(a))}y[id]=ys.length?(Math.min(...ys)+Math.max(...ys))/2:slot++;return y[id]})(T.rootId);
 T.nodes.forEach(n=>{if(!seen.has(n.id)){y[n.id]=slot++;depth[n.id]=depth[n.id]??0}});
 const maxD=Math.max(0,...Object.values(depth));const Pz={};T.nodes.forEach(n=>{Pz[n.id]={x:PAD+(maxD-depth[n.id])*COLW,y:PAD+y[n.id]*ROWH}});
 return {P:Pz,w:PAD*2+maxD*COLW+NW,h:PAD*2+(slot-1)*ROWH+NH}}
function treeSVG(exp){const T=S.arvore;if(!T.rootId)return '';const {P:Pz,w,h}=layoutTree();const Fn="Open Sans, Arial, sans-serif";
 let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#8A9690"/></marker></defs><rect width="${w}" height="${h}" fill="#ffffff"/>`;
 for(const e of T.edges){const a=Pz[e.from],b=Pz[e.to];if(!a||!b)continue;const x1=a.x+NW,y1=a.y+NH/2,x2=b.x-2,y2=b.y+NH/2,mx=(x1+x2)/2;s+=`<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" fill="none" stroke="#8A9690" stroke-width="1.5" marker-end="url(#ar)"/>`}
 for(const n of T.nodes){const p=Pz[n.id];const t=nodeText(n);const isR=n.id===T.rootId;const flag=!!(catMsg(t)||hits(t,CONFIG.juizo).length);
  const fill=isR?'#FCEBE9':n.raiz?'#FFF5E3':'#ffffff';const stroke=isR?'#DF4636':n.raiz?'#FDB952':'#BFC8C3';const sw=(!exp&&n.id===sel)?3:1.5;const L=wrapText(t);const ty=p.y+NH/2-(L.length-1)*8;
  s+=`<g class="node" data-node="${n.id}"><rect x="${p.x}" y="${p.y}" width="${NW}" height="${NH}" rx="3" fill="${fill}" stroke="${!exp&&n.id===sel?'#07583C':stroke}" stroke-width="${sw}"/>`;
  if(flag&&!exp)s+=`<rect x="${p.x-4}" y="${p.y-4}" width="${NW+8}" height="${NH+8}" rx="4" fill="none" stroke="#DF4636" stroke-dasharray="5 4" stroke-width="1.2"/>`;
  if(n.raiz)s+=`<text x="${p.x+NW-6}" y="${p.y+13}" text-anchor="end" font-family="${Fn}" font-size="10" font-weight="700" fill="#7A4B00">${causaLabel(n.id)}</text>`;
  s+=`<text font-family="${Fn}" font-size="12" fill="#1E2924" text-anchor="middle" ${isR?'font-weight="700"':''}>${L.map((l,i)=>`<tspan x="${p.x+NW/2}" y="${ty+i*16+4}">${esc(l)}</tspan>`).join('')}</text></g>`}
 return s+'</svg>'}
document.addEventListener('scroll',e=>{if(e.target.id==='canvas')treeScroll=[e.target.scrollLeft,e.target.scrollTop]},true);
function drawTree(){const c=$('#canvas');if(!c)return;c.innerHTML=treeSVG(false);if(firstDraw){c.scrollLeft=c.scrollWidth}else{c.scrollLeft=treeScroll[0];c.scrollTop=treeScroll[1]}firstDraw=false;treeScroll=[c.scrollLeft,c.scrollTop]}
async function treePNG(){const svg=treeSVG(true);if(!svg)return null;const m=/width="(\d+\.?\d*)" height="(\d+\.?\d*)"/.exec(svg);const w=+m[1],h=+m[2];
 const img=new Image();await new Promise((r,j)=>{img.onload=r;img.onerror=j;img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)});
 const cv=document.createElement('canvas');cv.width=w*2;cv.height=h*2;const cx=cv.getContext('2d');cx.scale(2,2);cx.drawImage(img,0,0);return {data:cv.toDataURL('image/png'),w,h}}

/* ---- Etapa 5 ---- */
function rCausas(){const R=raizes();const pend=folhas().filter(n=>!n.raiz&&n.id!==S.arvore.rootId);
 return `<div class="section"><header><h3>Causas raízes (${R.length})</h3><span class="hint">Fatos marcados como causa raiz na árvore · classificação do formulário de levantamento de fatos</span></header>
  <div class="body flush"><div class="scroll"><table class="edit" style="min-width:820px"><thead><tr><th style="width:50px"></th><th>Causa raiz</th><th style="width:260px">Tipo de causa<span class="req">*</span></th><th style="width:300px">Elemento do sistema de SSMA</th></tr></thead><tbody>
  ${R.map(n=>{const c=S.causas[n.id]||(S.causas[n.id]={tipo:'',elemento:''});return `<tr><td class="num">${causaLabel(n.id)}</td><td style="padding-top:12px">${esc(nodeText(n))}</td><td><select class="inp" data-bind="causas.${n.id}.tipo" aria-label="Tipo de causa">${opts(CONFIG.tipoCausa,c.tipo)}</select></td><td><select class="inp" data-bind="causas.${n.id}.elemento" aria-label="Elemento">${opts(CONFIG.elementos,c.elemento)}</select></td></tr>`}).join('')||'<tr><td colspan="4" class="empty">Nenhuma causa raiz marcada na árvore.</td></tr>'}
  </tbody></table></div></div></div>
  ${pend.length?`<div class="section"><header><h3>Fatos de origem sem decisão</h3><span class="hint">Estão na ponta da árvore: ou são causa raiz, ou falta perguntar “o que foi preciso?”</span></header><div class="body"><ul style="margin:0;padding-left:18px">${pend.map(n=>`<li>${esc(nodeText(n))}</li>`).join('')}</ul></div></div>`:''}`}

/* ---- Etapa 6 ---- */
const PADROES={dssma:{t:'Realizar DSSMA com a equipe sobre o ocorrido e as lições aprendidas.',d:15},abrangencia:{t:'Realizar análise de abrangência nas demais áreas e unidades, em até 10 dias após o compartilhamento da análise (NP 7.4.2).',d:17},eficacia:{t:'Concluir a análise de eficácia de todas as ações, em até 1 mês após a última ação (NP 7.6.2).',d:120}};
function garantirPadroes(){if(!P.editar(S))return;const base=S.ocorrencia.data||today();Object.entries(PADROES).forEach(([k,p])=>{if(!S.acoes.some(a=>a.padrao===k))S.acoes.push({id:uid(),texto:p.t,causas:[],nivel:CONFIG.niveis[3],responsavel:'',prazo:addDays(base,p.d),status:'Não iniciada',padrao:k,ef:{como:'',evidencia:'',resultado:''}})});S.acoes.forEach(a=>{a.ef=a.ef||{como:'',evidencia:'',resultado:''}})}
function rAcoes(){garantirPadroes();const R=raizes();const re=reincidencias(S);const tot=S.acoes.length,conc=S.acoes.filter(a=>/Concluída/.test(a.status)).length;
 return `${P.acompanharAcoes(S)?`<div class="strip i"><div><b>Acompanhamento.</b> Status, prazos e a verificação de eficácia continuam editáveis após a aprovação.</div></div>`:''}
 <div class="section"><header><h3>Ações (${conc}/${tot} concluídas)</h3><span class="hint">Toda causa raiz precisa de ação · prefira eliminação, substituição ou engenharia</span>
  <span class="right small">${R.map(n=>`<span class="tag" title="${esc(nodeText(n))}">${causaLabel(n.id)}</span>`).join(' ')}</span></header>
  <div class="body flush">${S.acoes.map((a,i)=>`<div class="acao ${a.padrao?'pad':''}" ${a.substitui?'data-subst="1"':''}>
   <div class="top"><span class="n">A${i+1}</span><div><textarea class="inp" rows="2" data-bind="acoes.${i}.texto" aria-label="Ação ${i+1}" ${a.padrao?'':''}>${esc(a.texto)}</textarea><div class="w" id="w-acoes.${i}.texto">${discMsg(a.texto)}</div>${a.substitui?`<span class="tag w" style="margin-top:4px">Substitui A${S.acoes.findIndex(x=>x.id===a.substitui)+1} (ineficaz)</span> `:''}${a.padrao?`<span class="tag o" style="margin-top:4px">Obrigatória · ${({dssma:'DSSMA',abrangencia:'Abrangência',eficacia:'Verificação de eficácia'})[a.padrao]}</span>`:''}</div>${a.padrao?'<span></span>':`<button class="x edit-only" data-del="acoes.${i}" title="Remover">✕</button>`}</div>
   ${a.padrao?'':`<div class="causes"><span class="small muted">Atua na causa:</span>${R.map(n=>`<label title="${esc(nodeText(n))}"><input type="checkbox" data-causa="${i}|${n.id}" ${a.causas.includes(n.id)?'checked':''}> ${causaLabel(n.id)}</label>`).join('')||'<span class="small muted">sem causas raízes</span>'}</div>`}
   <div class="grid4"><div class="f"><label class="l">Nível de controle</label><select class="inp" data-bind="acoes.${i}.nivel">${opts(CONFIG.niveis,a.nivel)}</select></div><div class="f"><label class="l">Responsável<span class="req">*</span></label><input class="inp" data-bind="acoes.${i}.responsavel" value="${esc(a.responsavel)}"></div><div class="f"><label class="l">Prazo<span class="req">*</span></label><input class="inp" type="date" data-follow="1" data-bind="acoes.${i}.prazo" value="${esc(a.prazo)}"></div><div class="f"><label class="l">Status</label><select class="inp" data-follow="1" data-bind="acoes.${i}.status" data-re="1">${opts(CONFIG.status,a.status)}</select></div></div>
   ${a.padrao==='eficacia'?rEfGeral(i):(/Concluída/.test(a.status)&&!a.padrao)?rEfAcao(a,i):''}
  </div>`).join('')}</div>
  <div class="addrow edit-only"><button class="btn sm" data-act="addAcao">Adicionar ação</button><span class="small muted" style="align-self:center">No sistema final, as ações podem ser exportadas para lançamento no Senior.</span></div></div>`}

function rEfAcao(a,i){const req=a.ef.resultado?'<span class="req">*</span>':'';const sub=S.acoes.find(x=>x.substitui===a.id);
 return `<div class="ef"><div class="f"><label class="l">Análise de eficácia · como foi verificada${req}</label><textarea class="inp" rows="2" data-follow="1" data-bind="acoes.${i}.ef.como" placeholder="Ex.: inspeção em 30 conjuntos; a condição não foi mais encontrada">${esc(a.ef.como)}</textarea></div>
  <div class="f"><label class="l">Evidência (link SharePoint)${req}</label><input class="inp" type="url" data-follow="1" data-bind="acoes.${i}.ef.evidencia" value="${esc(a.ef.evidencia)}" placeholder="https://…"></div>
  <div class="f"><label class="l">Resultado</label><select class="inp" data-follow="1" data-bind="acoes.${i}.ef.resultado" data-re="1">${opts(['Eficaz','Ineficaz'],a.ef.resultado,'Pendente')}</select></div>
  ${a.ef.resultado==='Ineficaz'?`<div class="small" style="grid-column:1/-1;color:var(--crit);display:flex;gap:10px;align-items:center">${sub?`Nova ação definida: A${S.acoes.indexOf(sub)+1}.`:`Ação ineficaz: defina uma nova ação, que também passará por análise de eficácia (NP 7.6.3).`}${sub?'':`<button class="btn sm" data-follow="1" data-act="novaSubst" data-i="${i}">Criar nova ação</button>`}</div>`:''}</div>`}
function rEfGeral(i){const a=S.acoes[i];const out=S.acoes.filter(x=>x.padrao!=='eficacia'&&x.status!=='Cancelada');const conc=out.filter(x=>/Concluída/.test(x.status));const av=out.filter(x=>!x.padrao&&x.ef.resultado);const especificas=out.filter(x=>!x.padrao);const inef=out.filter(x=>x.ef.resultado==='Ineficaz');const re=reincidencias(S);
 const ult=out.map(x=>x.prazo).filter(Boolean).sort().pop();
 return `<div class="ef" style="grid-template-columns:1fr"><div class="small"><b>Situação:</b> ${conc.length}/${out.length} ações concluídas · ${av.length}/${especificas.length} com eficácia avaliada${inef.length?` · <span style="color:var(--crit)">${inef.length} ineficaz(es)</span>`:''}. ${ult?`Pelo NP 7.6.2, a análise deve ocorrer em até 1 mês após a última ação: <b>${brDate(addDays(ult,30))}</b>.`:''}</div>
  <div class="small muted">Cada ação recebe sua própria análise de eficácia quando é concluída (NP 7.6.1), feita pelo supervisor da área com a Segurança.</div>
  ${re.length?`<div class="small" style="color:var(--crit)"><b>Reincidência:</b> ${re.map(x=>x.id).join(', ')} ocorreu depois da conclusão, com a mesma atividade e tipo de evento.</div>`:''}</div>`}
/* ---- Etapa 7 ---- */
function rCustos(){const c=S.custos,u=DB.config.calcUrl;
 return `<div class="section"><header><h3>Custos</h3><span class="hint">Calculados na Calculadora de Custo de Incidentes/Acidentes</span>${u?`<span class="right"><a class="btn sm" href="${esc(u)}" target="_blank" rel="noopener">Abrir calculadora</a></span>`:''}</header><div class="body form">
  <div class="f c3"><label class="l" for="cTot">Custo total (R$)</label><input type="text" id="cTot" data-bind="custos.total" value="${esc(c.total)}" placeholder="0,00"></div>
  <div class="f c9" style="grid-column:span 9"><label class="l" for="cPdf">Link do PDF de custos</label><input type="url" id="cPdf" data-bind="custos.pdf" value="${esc(c.pdf)}"></div>
  <div class="f c12"><label class="l" for="cObs">Observação</label><input type="text" id="cObs" data-bind="custos.obs" value="${esc(c.obs)}"></div></div></div>
 <div class="section"><header><h3>Lições aprendidas</h3><span class="hint">O que outras equipes devem levar desta ocorrência · evite lições que só pedem “mais atenção”</span></header><div class="body">
  ${S.licoes.map((l,i)=>`<div style="display:flex;gap:6px;margin-bottom:6px"><textarea class="inp" rows="1" data-bind="licoes.${i}" aria-label="Lição ${i+1}">${esc(l)}</textarea><button class="x edit-only" data-del="licoes.${i}">✕</button></div><div class="w" id="w-licoes.${i}">${juizoMsg(l)}</div>`).join('')}
  <button class="btn sm edit-only" data-act="addLicao">Adicionar lição</button></div></div>`}

/* ---- Etapa 8 ---- */
function rRevisao(){const V=validar(S);const err=nErros(V);const al=V.slice(0,7).reduce((a,v)=>a+v.filter(x=>x.t==='a').length,0);
 const fluxo=[['elaboracao','Elaboração','Técnico preenche as etapas'],['aprovacao','Aprovação','Validação do gerente da área e aprovação do SSMA (NP 7.3.6)'],['assinatura','Assinatura','Relatório impresso e assinado pelo comitê; PDF anexado (NP 7.3.7)'],['concluida','Concluída','Ações seguem em acompanhamento até a eficácia']];
 const idx={elaboracao:0,devolvida:0,aprovacao:1,assinatura:2,concluida:3}[S.status];
 return `<div class="section"><header><h3>Fluxo da investigação</h3></header><div class="body flush"><div class="scroll"><table class="edit"><tbody><tr>${fluxo.map((f,i)=>`<td style="padding:12px 14px;border-right:1px solid var(--line);${i===idx?'background:var(--brand-tint);box-shadow:inset 0 3px 0 var(--brand)':''}"><b>${i+1}. ${f[1]}</b>${i<idx?' <span class="tag o">feito</span>':i===idx?' <span class="tag g">atual</span>':''}<div class="small muted">${f[2]}</div></td>`).join('')}</tr></tbody></table></div></div></div>
 <div class="section"><header><h3>Situação das etapas</h3><span class="hint">${err?`${err} pendência(s) obrigatória(s)`:'Sem pendências obrigatórias'}${al?` · ${al} alerta(s)`:''}</span></header><div class="body flush"><table class="edit"><tbody>
  ${STEPS.slice(0,7).map((s,i)=>{const e=V[i].filter(x=>x.t==='e'),a=V[i].filter(x=>x.t==='a');return `<tr style="cursor:pointer" data-step="${i}"><td style="width:240px;padding:10px 12px"><b>${i+1}. ${s.t}</b></td><td style="padding:10px 12px">${e.length?`<span class="tag e">${e.length} pendência(s)</span>`:a.length?`<span class="tag w">${a.length} alerta(s)</span>`:'<span class="tag o">Concluída</span>'} <span class="small muted">${[...e,...a].slice(0,2).map(x=>esc(x.m)).join(' · ')}</span></td></tr>`}).join('')}</tbody></table></div></div>
 <div class="section"><header><h3>Validação e registro</h3><span class="hint">NP 7.3.6 e 6.6.9</span></header><div class="body form">
  <div class="f c4"><span class="lbl2">Validado pelo gerente da área</span><div class="ro">${S.validacaoGerente.nome?`${esc(S.validacaoGerente.nome)} · ${brDate(S.validacaoGerente.data)}`:'<span class="muted" style="font-weight:400">Registrado na aprovação</span>'}</div></div>
  <div class="f c4"><span class="lbl2">Aprovado pelo SSMA</span><div class="ro">${(S.historico.find(h=>h.acao==='Aprovada')||{}).quem||'<span class="muted" style="font-weight:400">Pendente</span>'}</div></div>
  <div class="f c4"><label class="l" for="rvSen">Registro no Sênior (nº)</label><input type="text" id="rvSen" data-follow="1" data-bind="senior" value="${esc(S.senior)}"></div></div></div>
 <div class="section"><header><h3>Relatório e assinatura do comitê</h3></header><div class="body">
  <p style="margin-top:0">O relatório sai sempre no mesmo modelo: capa, comitê com campo de assinatura, envolvido e ocorrência, matriz de riscos, fatos, fotos, árvore, causas raízes, custos e lições, plano de ação.</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="${P.editar(S)?'pptRasc':'ppt'}" data-keep="1">${P.editar(S)?'Gerar rascunho do relatório':'Gerar relatório'}</button><button class="btn" data-act="json" data-keep="1">Exportar investigação (.json)</button></div>
  ${S.pdf?`<div class="strip o" style="margin:12px 0 0"><div><b>PDF assinado anexado:</b> ${esc(S.pdf.nome)} · ${esc(S.pdf.data)} · ${esc(S.pdf.por)}${S.pdf.path?' · <button class="link" data-act="abrirPdf">Abrir PDF</button>':''}</div></div>`:S.status==='assinatura'?`<div class="strip" style="margin:12px 0 0"><div><b>Aguardando o PDF assinado pelo comitê.</b> Use “Anexar PDF assinado” no topo da página.</div></div>`:''}
 </div></div>
 ${iaBox('geral')}`}
function rHistoricoReg(){return `<div class="section"><header><h3>Histórico do registro</h3><span class="hint">Criação, envios, aprovações, devoluções, anexos e reaberturas</span></header><div class="body flush"><ul class="timeline">${S.historico.map(h=>`<li><span class="when tab-num">${esc(h.quando)}</span><div><b>${esc(h.acao)}</b><div class="small muted">${esc(h.quem)}${h.obs?' · '+esc(h.obs):''}</div></div></li>`).join('')||'<li><span></span><div class="muted">Sem registros.</div></li>'}</ul></div></div>`}

/* ---- IA ---- */
let iaSample=null;
function iaBox(esc_){const r=S.ia&&S.ia.escopo===esc_?S.ia:null;
 return `<div class="ia-only" style="padding:12px 16px;${esc_==='geral'?'':'border-top:1px solid var(--line)'}">${esc_==='geral'?`<div class="section"><header><h3>Revisão com IA</h3><span class="hint">Confere fatos, árvore, causas e ações com as regras da árvore de causas · a decisão é do comitê</span><span class="right"><button class="btn sm" data-ia="geral" ${iaBusy?'disabled':''}>${iaBusy?'Analisando…':'Revisar agora'}</button></span></header><div class="body ia">${r?iaResult(r):'<span class="muted small">Nenhuma revisão feita.</span>'}</div></div>`:(r?`<div class="ia">${iaResult(r)}</div>`:'')}</div>`}
function iaResult(r){if(r.erro)return `<div class="strip e" style="margin:0"><div>${esc(r.erro)}</div></div>`;return `${r.resumo?`<p style="margin:0 0 6px">${esc(r.resumo)}</p>`:''}${(r.observacoes||[]).map(o=>`<div class="ob ${esc(o.gravidade||'')}"><span class="tag">${esc(o.etapa||'')}</span> ${o.item?`<span class="small muted">“${esc(o.item)}”</span>`:''}<div><b>${esc(o.problema||'')}</b></div>${o.sugestao?`<div class="small">Sugestão: ${esc(o.sugestao)}</div>`:''}</div>`).join('')||'<p>Nenhuma observação.</p>'}`}
function dadosParaIA(){const o=S.ocorrencia;const L=[`OCORRÊNCIA: ${o.tipo} | ${o.classificacao} | ${o.setor} | ${o.atividade} | ${o.evento}\nDescrição: ${o.descricao}`,'FATOS:\n'+S.fatos.map((f,i)=>`F${i+1}. ${f.texto} [${f.fonte||'sem fonte'}]`).join('\n')];
 if(S.arvore.rootId){L.push('ÁRVORE (consequência <= antecedentes):\n'+S.arvore.nodes.map(n=>{const a=ants(n.id);return a.length?`"${nodeText(n)}" <= ${a.map(x=>`"${nodeText(nodeById(x))}"`).join(' E ')}`:null}).filter(Boolean).join('\n'));L.push('CAUSAS RAÍZES:\n'+raizes().map(n=>`${causaLabel(n.id)}. ${nodeText(n)} [${S.causas[n.id]?.tipo||'sem tipo'}]`).join('\n'))}
 L.push('AÇÕES:\n'+S.acoes.map((a,i)=>`A${i+1}. ${a.texto} | causas: ${a.causas.map(causaLabel).join(',')||'-'} | nível: ${a.nivel||'-'}`).join('\n'));L.push('LIÇÕES:\n'+S.licoes.filter(Boolean).join('\n'));return L.join('\n\n')}
async function rodarIA(escopo){if(!iaSample){toast('Revisão com IA indisponível nesta visualização.',true);return}
 iaBusy=true;render();
 const foco=escopo==='fatos'?'Foque SOMENTE nos FATOS: julgamentos, hipóteses, frases vagas, dois fatos numa linha e perguntas que ainda faltam fazer.':'Analise fatos, árvore (necessidade, suficiência, conjunções faltando, nós que são categorias ou julgamentos), causas raízes (fatos de origem tratáveis, preferindo causas de sistema e gestão) e ações (cada causa com ação, hierarquia de controles, medida disciplinar não é ação corretiva).';
 const prompt=`Você revisa investigações de acidentes da Usina Santa Adélia pela metodologia Árvore de Causas. Fatos são objetivos e verificáveis; cada nó da árvore é um fato; cada antecedente responde "o que foi preciso para isso acontecer?"; teste de necessidade e suficiência.\n${foco}\nResponda em português, de forma direta, para um técnico de segurança. Devolva SOMENTE JSON: {"resumo":"1-2 frases","observacoes":[{"etapa":"Fatos|Árvore|Causas|Ações|Lições","gravidade":"alta|media|baixa","item":"trecho","problema":"...","sugestao":"..."}]} com no máximo ${escopo==='fatos'?8:12} observações.\n\nDADOS:\n${dadosParaIA()}`;
 try{const r=await iaSample.json(prompt,{modelTier:'default'});S.ia={escopo,...(typeof r==='object'&&r?r:{resumo:String(r)})}}
 catch(e){S.ia={escopo,erro:e?.code==='not_granted'?'Revisão com IA não autorizada.':e?.code==='rate_limited'?'Muitas solicitações agora; tente em alguns minutos.':'Não foi possível revisar agora.'}}
 iaBusy=false;DBX.save();render()}
/* ===================== RELATÓRIO (PowerPoint) ===================== */
let dl=null;
async function baixar(nome,blob){
 if(dl){try{await dl.save({filename:nome,data:blob});return true}catch(e){if(/declin|cancel/i.test(e?.code+' '+e?.message))return false;toast('Não foi possível salvar o arquivo.',true);return false}}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=nome;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);return true}
async function gerarPPT(rascunho){
 if(typeof PptxGenJS==='undefined'){toast('A biblioteca do PowerPoint não carregou.',true);return}
 const p=new PptxGenJS();p.layout='LAYOUT_WIDE';p.author='SSMA – Usina Santa Adélia';p.title=S.id;
 const G='07583C',LG='B3DD64',AM='FDB952',RD='DF4636',TX='1E2924',MU='5B6862',FF='Open Sans',GR='F2F4F3';
 const o=S.ocorrencia,v=S.envolvido;const tit=o.tipo;const draft=rascunho||nErros(validar(S))>0;
 const base=t=>{const s=p.addSlide();s.background={color:'FFFFFF'};s.addShape(p.ShapeType.rect,{x:0,y:0,w:13.333,h:0.75,fill:{color:G}});s.addText(t,{x:0.45,y:0.1,w:10.5,h:0.55,fontFace:FF,fontSize:20,bold:true,color:'FFFFFF'});s.addText(S.id,{x:10.6,y:0.1,w:2.3,h:0.55,fontFace:FF,fontSize:11,color:'FFFFFF',align:'right'});
  s.addShape(p.ShapeType.line,{x:0.45,y:7.05,w:12.43,h:0,line:{color:'D6DDD9',width:0.75}});s.addText(`Usina Santa Adélia · SSMA · ${tit} ${o.unidade} ${brDate(o.data)}${draft?' · RASCUNHO':''}`,{x:0.45,y:7.08,w:12.43,h:0.3,fontFace:FF,fontSize:9,color:draft?RD:MU,align:'right'});return s};
 const cell=(t,x={})=>({text:String(t??''),options:{fontFace:FF,fontSize:11,color:TX,valign:'middle',...x}});const hd=t=>cell(t,{bold:true,color:'FFFFFF',fill:{color:G}});const B={type:'solid',pt:0.5,color:'D6DDD9'};
 let s=p.addSlide();s.background={color:'FFFFFF'};s.addShape(p.ShapeType.rect,{x:0,y:0,w:0.35,h:7.5,fill:{color:G}});
 s.addText(`Relatório de análise de ${tit.toLowerCase()}`,{x:0.9,y:1.4,w:11,h:0.5,fontFace:FF,fontSize:18,color:MU});s.addText(tituloDe(S),{x:0.9,y:1.95,w:11.5,h:1.3,fontFace:'Bitter',fontSize:32,bold:true,color:G,valign:'top'});
 s.addText(o.descricao,{x:0.9,y:3.5,w:11.2,h:1.3,fontFace:FF,fontSize:14,color:TX,valign:'top'});
 s.addTable([[cell('Nº',{bold:true,color:MU}),cell(S.id,{bold:true}),cell('Classificação',{bold:true,color:MU}),cell(o.classificacao)],[cell('Unidade',{bold:true,color:MU}),cell(o.unidade),cell('Data e hora',{bold:true,color:MU}),cell(`${brDate(o.data)} ${o.hora}`)],[cell('Setor',{bold:true,color:MU}),cell(o.setor),cell('Local',{bold:true,color:MU}),cell(o.local)]],{x:0.9,y:5.15,w:11.5,colW:[1.4,4.4,1.6,4.1],rowH:0.4,border:B});
 if(draft)s.addText('RASCUNHO',{x:9.4,y:0.5,w:3.3,h:0.5,fontFace:FF,fontSize:14,bold:true,color:RD,align:'right'});
 s=base(`Comitê de análise do ${tit.toLowerCase()}`);
 s.addTable([[hd('Matrícula'),hd('Nome'),hd('Cargo'),hd('Papel no comitê'),hd('Assinatura')],...S.comite.map(c=>c.papel==='Envolvido/Acidentado'?[cell('—'),cell('Envolvido na ocorrência',{italic:true}),cell(c.cargo),cell(c.papel),cell('')]:[cell(c.matricula),cell(c.nome),cell(c.cargo),cell(c.papel),cell('')])],{x:0.45,y:1.05,w:12.43,colW:[1.3,3.1,2.8,2.6,2.63],rowH:0.55,border:B});
 s=base('Dados da ocorrência e do envolvido');
 const kv=r=>r.map(([k,x])=>[cell(k,{bold:true,color:G,fill:{color:'EAF2EE'}}),cell(x)]);const pt=potencialDe(S);
 s.addTable(kv([['Responsável pela análise',[S.responsavel.nome,S.responsavel.cargo].filter(Boolean).join(' · ')],['Envolvido','Não identificado (NP 4.2)'],['Idade',v.idade?v.idade+' anos':''],['Cargo',v.cargo],['Admissão',brDate(v.admissao)],['Tempo de empresa',tempoEntre(v.admissao,o.data)],['Experiência na atividade',v.experiencia],['Lesão / parte do corpo',[v.tipoLesao,v.parteCorpo].filter(Boolean).join(' · ')]]),{x:0.45,y:1.05,w:5.9,colW:[2.2,3.7],rowH:0.42,border:B});
 s.addTable(kv([['Classificação',o.classificacao],['Tipo de perda',o.perda.join(', ')],['Data / hora',`${brDate(o.data)} ${o.hora}`],['Turno',o.turno],['Setor',o.setor],['Local',o.local],['Evento',`${o.evento} · ${o.atividade}`],['Potencial',pt?`${pt.v} – ${pt.nivel}`:''],['Custo',S.custos.total?'R$ '+S.custos.total:'']]),{x:6.75,y:1.05,w:6.13,colW:[1.8,4.33],rowH:0.42,border:B});
 if(pt){const M=CONFIG.matriz;s=base('Matriz de riscos – potencial da ocorrência');const cw=0.78,ch=0.7,x0=2.15,y0=1.05;const col={Baixo:'EEF6E2',Médio:'FFF5E3',Alto:'FCEBE9'},cols={Baixo:LG,Médio:AM,Alto:RD};
  for(let r=1;r<=5;r++){const pr=6-r;s.addText(`${M.prob[pr-1].t} (${pr})`,{x:0.45,y:y0+(r-1)*ch,w:1.62,h:ch-0.05,fontFace:FF,fontSize:10,bold:true,color:MU,fill:{color:GR},align:'center',valign:'middle'});
   for(let c=1;c<=5;c++){const val=pr*c,n=M.nivel(val),on=pt.p===pr&&pt.g===c;s.addText(String(val),{x:x0+(c-1)*cw,y:y0+(r-1)*ch,w:cw-0.05,h:ch-0.05,fontFace:FF,fontSize:on?18:12,bold:true,color:on&&n==='Alto'?'FFFFFF':TX,fill:{color:on?cols[n]:col[n]},align:'center',valign:'middle',line:on?{color:TX,width:2.5}:undefined})}}
  M.grav.forEach((g,i)=>s.addText(`(${g.n})\n${g.t}`,{x:x0+i*cw,y:y0+5*ch,w:cw-0.05,h:0.55,fontFace:FF,fontSize:7.5,bold:true,color:MU,fill:{color:GR},align:'center',valign:'middle',margin:1}));
  s.addText([{text:`${pt.v}  `,options:{fontSize:34,bold:true}},{text:`POTENCIAL ${pt.nivel.toUpperCase()}`,options:{fontSize:18,bold:true}}],{x:6.55,y:1.05,w:6.3,h:0.8,fontFace:FF,color:pt.nivel==='Alto'?RD:pt.nivel==='Médio'?'7A4B00':'2F6B2A'});
  const di=M.dims.indexOf(o.potencial.dimensao);
  s.addText([{text:`Gravidade ${pt.g} – ${pt.gt}${o.potencial.dimensao?` (${o.potencial.dimensao})`:''}\n`,options:{bold:true,color:G}},{text:(di>=0?M.grav[pt.g-1].d[di]:'')+'\n\n',options:{fontSize:11}},{text:`Probabilidade ${pt.p} – ${pt.pt}\n`,options:{bold:true,color:G}},{text:M.prob[pt.p-1].d.filter(Boolean).join(' · ')+'\n\n',options:{fontSize:11}},{text:'Justificativa\n',options:{bold:true,color:G}},{text:o.potencial.justificativa||'—',options:{fontSize:11}},{text:'\n\n'+M.aceit[pt.nivel],options:{fontSize:10,color:MU}}],{x:6.55,y:1.95,w:6.3,h:4.9,fontFace:FF,fontSize:12,color:TX,valign:'top'})}
 const per=11;for(let i=0;i<Math.max(1,S.fatos.length);i+=per){s=base('Levantamento de fatos'+(S.fatos.length>per?` (${Math.floor(i/per)+1}/${Math.ceil(S.fatos.length/per)})`:''));
  s.addTable(S.fatos.slice(i,i+per).map((f,j)=>[cell('F'+(i+j+1),{bold:true,color:G,align:'center'}),cell(f.texto,{fontSize:12}),cell(f.fonte,{fontSize:9,color:MU})]),{x:0.45,y:1.0,w:12.43,colW:[0.7,9.2,2.53],rowH:0.48,border:B})}
 for(let i=0;i<S.fotos.length;i+=2){s=base('Registros fotográficos');S.fotos.slice(i,i+2).forEach((ph,j)=>{const bw=5.9,bh=4.9,r=Math.min(bw/ph.w,bh/ph.h),w=ph.w*r,h=ph.h*r,x0=0.45+j*6.5;s.addImage({data:ph.src,x:x0+(bw-w)/2,y:1.05+(bh-h)/2,w,h});s.addText(ph.legenda||'',{x:x0,y:6.05,w:bw,h:0.6,fontFace:FF,fontSize:12,color:TX,align:'center'})})}
 const png=await treePNG();s=base('Análise da causa raiz – árvore de causas');s.addText('O que foi preciso? Foi necessário? Foi suficiente?',{x:0.45,y:0.85,w:9,h:0.35,fontFace:FF,fontSize:12,italic:true,color:MU});
 if(png){const bw=12.43,bh=5.65;const r=Math.min(bw/(png.w/96),bh/(png.h/96),1.4);const w=png.w/96*r,h=png.h/96*r;s.addImage({data:png.data,x:0.45+(bw-w)/2,y:1.25+(bh-h)/2,w,h})}
 s=base('Causas raízes');s.addTable([[hd(''),hd('Causa raiz'),hd('Tipo de causa'),hd('Elemento do sistema de SSMA')],...raizes().map(n=>[cell(causaLabel(n.id),{bold:true,color:'7A4B00',fill:{color:'FFF5E3'},align:'center'}),cell(nodeText(n),{fontSize:12}),cell(S.causas[n.id]?.tipo||''),cell(S.causas[n.id]?.elemento||'')])],{x:0.45,y:1.05,w:12.43,colW:[0.7,5.9,2.7,3.13],rowH:0.6,border:B});
 s=base('Custos e lições aprendidas');s.addTable([[cell('Custo total',{bold:true,color:MU})],[cell(S.custos.total?'R$ '+S.custos.total:'—',{fontSize:26,bold:true,color:G})],[cell(S.custos.obs||'Calculado na Calculadora de Custo de Incidentes/Acidentes',{fontSize:9,color:MU})]],{x:0.45,y:1.1,w:4,border:B,fill:{color:'F7F8F8'}});
 s.addText(S.licoes.filter(l=>l.trim()).map(l=>({text:l,options:{bullet:true,paraSpaceAfter:10}})),{x:4.9,y:1.1,w:7.98,h:5.6,fontFace:FF,fontSize:15,color:TX,valign:'top'});
 const pa=7;for(let i=0;i<Math.max(1,S.acoes.length);i+=pa){s=base('Plano de ação'+(S.acoes.length>pa?` (${Math.floor(i/pa)+1}/${Math.ceil(S.acoes.length/pa)})`:''));
  s.addTable([[hd('Ação'),hd('Causa'),hd('Nível'),hd('Responsável'),hd('Prazo'),hd('Status')],...S.acoes.slice(i,i+pa).map(a=>[cell(a.texto,{fontSize:10}),cell(a.padrao?'Todas':a.causas.map(causaLabel).join(', '),{align:'center'}),cell((a.nivel||'').split(' (')[0],{fontSize:9}),cell(a.responsavel,{fontSize:10}),cell(brDate(a.prazo),{align:'center'}),cell(a.status,{fontSize:10,bold:true})])],{x:0.45,y:1.0,w:12.43,colW:[5.4,0.9,1.7,1.9,1.1,1.43],rowH:0.6,border:B})}
 const blob=await p.write({outputType:'blob'});if(await baixar(`${S.id} - ${draft?'RASCUNHO - ':''}Relatório de investigação.pptx`,blob))toast('Relatório gerado.');
}

/* ===================== MODAIS ===================== */
let COMUNICADOS=[
 {id:'COM-2026-0462',tipo:'Acidente',unidade:'JB',setor:'Indústria – Fábrica de Açúcar',local:'Indústria › Fábrica de Açúcar › Centrífugas',data:'2026-11-16',hora:'15:40',turno:'B',descricao:'Durante deslocamento a pé para acionar a centrífuga, a colaboradora sentiu dor no joelho direito após mudar de direção.'},
 {id:'COM-2026-0465',tipo:'Incidente',unidade:'JB',setor:'CTT',local:'Agrícola › Frentes de colheita › Frente 4',data:'2026-11-17',hora:'10:15',turno:'A',descricao:'Ao manobrar próximo ao carreador, o elevador da colhedora atingiu os cabos da rede telefônica.',perda:['Material']},
 {id:'COM-2026-0468',tipo:'Acidente',unidade:'PB',setor:'Automotiva',local:'Automotiva › Oficina de colhedoras',data:'2026-11-18',hora:'08:20',turno:'ADM',descricao:'Durante a troca de faca do corte de base, a chave escapou e atingiu a mão esquerda do mecânico.'}];
function modal(html,cls){$('#modal').innerHTML=`<div class="modal" data-close="1"><div class="box ${cls||''}" role="dialog" aria-modal="true">${html}</div></div>`}
function fecharModal(){$('#modal').innerHTML=''}
function modalNova(){const u=USERS[perfil()].unidade;const lst=COMUNICADOS.filter(c=>!u||c.unidade===u).filter(c=>!DB.investigacoes.some(i=>i.ocorrencia.comunicado===c.id));const sen=seniorPendentes(u);
 modal(`<header>Nova investigação</header><div class="body">
  <h4 class="mh">Acidentes do Sênior sem investigação <span class="small muted" style="font-weight:400">· CAT aberta pela Saúde · atualizado em ${brDate(SENIOR_CARGA.slice(0,10))} às ${SENIOR_CARGA.slice(11)}</span></h4>
  <p class="small muted" style="margin:0 0 8px">Ao escolher, ocorrência e acidentado já vêm preenchidos. A equipe só faz a investigação.</p>
  <table class="grid click"><thead><tr><th>Sênior</th><th>Data</th><th>Unid.</th><th>Acidentado</th><th>Ocorrência</th><th>Sugestão</th></tr></thead><tbody>${sen.map(s=>`<tr data-novasen="${s.num_ocorrencia}"><td class="tab-num"><b>nº ${s.num_ocorrencia}</b><br><span class="small muted">CAT ${esc(s.cat||'—')}</span></td><td class="tab-num">${brDate(s.data_ocorrencia)}</td><td>${UNI_SENIOR[s.unidade]||esc(s.unidade)}</td><td class="small">${esc(s.nome_acidentado)}<br><span class="muted">${esc(s.cargo)}</span></td><td class="small">${esc(s.descricao_ocorrencia)}</td><td>${isTrajeto(s)?'<span class="tag w">Trajeto</span>':s.classificacao_sugerida==='ACA'?'<span class="tag e">ACA</span>':'<span class="tag g">ASA</span>'}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">Todos os acidentes do Sênior já têm investigação.</td></tr>'}</tbody></table>
  <h4 class="mh" style="margin-top:18px">Comunicados sem investigação <span class="small muted" style="font-weight:400">· incidentes e acidentes ainda sem CAT</span></h4>
  <table class="grid click"><thead><tr><th>Comunicado</th><th>Data</th><th>Unid.</th><th>Ocorrência</th></tr></thead><tbody>${lst.map(c=>`<tr data-novacom="${c.id}"><td class="tab-num"><b>${c.id}</b><br><span class="small muted">${c.tipo}</span></td><td class="tab-num">${brDate(c.data)}</td><td>${c.unidade}</td><td class="small">${esc(c.descricao)}</td></tr>`).join('')||'<tr><td colspan="4" class="empty">Nenhum comunicado pendente.</td></tr>'}</tbody></table></div>
  <footer><button class="btn" data-close="1">Cancelar</button><button class="btn" data-novacom="">Criar em branco</button></footer>`,'wide')}
function criarDoSenior(num){const s=SENIOR.find(x=>x.num_ocorrencia===+num);if(!s)return;const u=UNI_SENIOR[s.unidade]||'JB';
 const inv=novaInv(u);preencherDoSenior(inv,s);
 const c=COMUNICADOS.find(x=>x.unidade===u&&x.data===s.data_ocorrencia&&x.tipo==='Acidente'&&!DB.investigacoes.some(i=>i.ocorrencia.comunicado===x.id));if(c)Object.assign(inv.ocorrencia,{comunicado:c.id,turno:c.turno});
 inv.id=proximoId(u,inv.ocorrencia.data);hist(inv,`Investigação criada a partir da ocorrência nº ${s.num_ocorrencia} do Sênior (CAT ${s.cat||'—'})`);DB.investigacoes.push(inv);DBX.save();fecharModal();step=0;go('inv-'+inv.id)}
function criarInv(comId){const c=COMUNICADOS.find(x=>x.id===comId);const u=c?c.unidade:(USERS[perfil()].unidade||(DB.unidade==='USA'?'JB':DB.unidade));
 const inv=novaInv(u);if(c)Object.assign(inv.ocorrencia,{tipo:c.tipo,perda:c.perda||['Pessoal'],setor:c.setor,local:c.local,data:c.data,hora:c.hora,turno:c.turno,descricao:c.descricao,comunicado:c.id});
 inv.id=proximoId(u,inv.ocorrencia.data);hist(inv,c?`Investigação criada a partir do comunicado ${c.id}`:'Investigação criada');DB.investigacoes.push(inv);DBX.save();fecharModal();step=0;go('inv-'+inv.id)}
function modalMotivo(titulo,label,acao){modal(`<header>${titulo}</header><div class="body"><div class="f"><label class="l" for="mMot">${label}<span class="req">*</span></label><textarea class="inp" id="mMot" rows="4"></textarea></div></div><footer><button class="btn" data-close="1">Cancelar</button><button class="btn primary" data-mot="${acao}">Confirmar</button></footer>`);setTimeout(()=>$('#mMot')?.focus(),30)}
function modalPdf(){modal(`<header>Anexar relatório assinado pelo comitê</header><div class="body"><p class="small muted" style="margin-top:0">Anexe o PDF com as assinaturas do comitê. Ao anexar, a investigação é concluída. No sistema final o arquivo é guardado no SharePoint/Storage.</p><div class="f"><label class="l" for="mPdf">Arquivo PDF<span class="req">*</span></label><input type="file" id="mPdf" accept="application/pdf"></div></div><footer><button class="btn" data-close="1">Cancelar</button><button class="btn primary" data-act="confirmaPdf">Anexar e concluir</button></footer>`)}

/* ===================== EVENTOS ===================== */
function podeEditarCampo(el){return P.editar(S)||((el.dataset.follow||el.closest('[data-subst]'))&&P.acompanharAcoes(S))}
function refreshSoft(){if(VIEW!=='inv')return;const tmp=document.createElement('div');tmp.innerHTML=pInv();
 [['.pagehead'],['.steps'],['.footbar']].forEach(([q])=>{const a=$('#app '+q),b=tmp.querySelector(q);if(a&&b)a.replaceWith(b)});
 const ia=$('#app .content > .strip.e, #app .content > .strip:not(.i):not(.o)');const nb=tmp.querySelector('.content > .strip.e, .content > .strip:not(.i):not(.o)');
 const cont=$('#app .content');if(cont){cont.querySelectorAll(':scope > .strip').forEach(x=>x.remove());const strips=[...tmp.querySelectorAll('.content > .strip')];strips.reverse().forEach(x=>cont.prepend(x))}}
document.addEventListener('input',e=>{const el=e.target;
 if(el.dataset.filtro==='q'){filtros.q=el.value;render();const f=$('#fq');f.focus();f.setSelectionRange(f.value.length,f.value.length);return}
 if(el.dataset.hf==='q'){hf.q=el.value;histPage=1;render();const f=$('#hq');f.focus();f.setSelectionRange(f.value.length,f.value.length);return}
 const b=el.dataset.bind;if(!b||VIEW!=='inv'||!S)return;if(!podeEditarCampo(el))return;
 setPath(S,b,el.type==='checkbox'?el.checked:el.value);DBX.save();
 const w=document.getElementById('w-'+b);if(w)w.innerHTML=b.startsWith('acoes')?discMsg(el.value):juizoMsg(el.value)+(step===3?catMsg(el.value):'');
 if(b==='envolvido.admissao'){const t=$('#tempoEmp');if(t)t.textContent=tempoEntre(S.envolvido.admissao,S.ocorrencia.data)||'—'}
 if(step===3&&b.startsWith('fatos'))drawTree();
});
document.addEventListener('change',e=>{const el=e.target;
 if(el.id==='hPerfil'){DB.perfil=el.value;DB.unidade=USERS[el.value].unidade||DB.unidade;DBX.save();render();toast(`Perfil: ${USERS[el.value].perfil}`);return}
 if(el.id==='hUnidade'){DB.unidade=el.value;DBX.save();render();return}
 if(el.dataset.filtro&&el.dataset.filtro!=='q'){filtros[el.dataset.filtro]=el.value;render();return}
 if(el.dataset.hf&&el.dataset.hf!=='q'){hf[el.dataset.hf]=el.value;histPage=1;render();return}
 if(el.dataset.prazo!==undefined&&P.config()){DB.config.prazos[el.dataset.prazo]=el.value;DBX.save();toast('Prazo salvo.');return}
 if(el.dataset.cfg&&P.config()){DB.config[el.dataset.cfg]=el.value.trim();DBX.save();toast('Configuração salva.');return}
 if(VIEW!=='inv'||!S)return;
 if(el.dataset.perda&&P.editar(S)){const L=S.ocorrencia.perda;el.checked?L.push(el.dataset.perda):L.splice(L.indexOf(el.dataset.perda),1);DBX.save();refreshSoft();return}
 if(el.dataset.raiz&&P.editar(S)){const n=nodeById(el.dataset.raiz);n.raiz=el.checked;if(el.checked&&!S.causas[n.id])S.causas[n.id]={tipo:'',elemento:''};DBX.save();render();return}
 if(el.dataset.causa&&(P.editar(S)||(el.closest('[data-subst]')&&P.acompanharAcoes(S)))){const [i,id]=el.dataset.causa.split('|');const c=S.acoes[+i].causas;el.checked?c.push(id):c.splice(c.indexOf(id),1);DBX.save();refreshSoft();return}
 if(el.id==='fotoIn'&&P.editar(S)){addFotos(el.files);return}
 if(el.dataset.bind&&podeEditarCampo(el)){if(el.dataset.re){const y=window.scrollY;syncClass(S);DBX.save();render();window.scrollTo(0,y)}else refreshSoft()}
});
document.addEventListener('click',async e=>{
 const t=e.target.closest('[data-close],[data-open],[data-hist],[data-hpage],[data-step],[data-go],[data-tipo],[data-cell],[data-grav],[data-prob],[data-del],[data-delfato],[data-node],[data-unlink],[data-ia],[data-act],[data-novacom],[data-novasen],[data-mot]');if(!t)return;
 if(t.dataset.close!==undefined){if(e.target===t||t.tagName==='BUTTON')fecharModal();return}
 if(t.dataset.open){if(!e.target.closest('a'))go('inv-'+t.dataset.open);return}
 if(t.dataset.hist){modalHist(t.dataset.hist);return}
 if(t.dataset.hpage){histPage+=+t.dataset.hpage;render();return}
 if(t.dataset.novacom!==undefined){criarInv(t.dataset.novacom);return}
 if(t.dataset.novasen!==undefined){criarDoSenior(t.dataset.novasen);return}
 if(t.dataset.mot){const m=$('#mMot').value.trim();if(!m){toast('Informe o motivo.',true);return}
   if(t.dataset.mot==='devolver'){S.status='devolvida';S.devolucao=m;hist(S,'Devolvida para ajustes',m);toast('Investigação devolvida ao técnico.')}
   if(t.dataset.mot==='reabrir'){S.status='elaboracao';S.concluidaEm='';hist(S,'Reaberta',m);toast('Investigação reaberta.')}
   DBX.save();fecharModal();render();return}
 if(t.dataset.step!=null){step=+t.dataset.step;firstDraw=true;sel=step===3?sel:null;render();window.scrollTo(0,0);return}
 if(t.dataset.go!=null){step=+t.dataset.go;firstDraw=true;render();window.scrollTo(0,0);return}
 if(!S)return t.dataset.act&&actGlobal(t.dataset.act,t);
 const ed=P.editar(S);
 if(t.dataset.tipo&&ed){S.ocorrencia.tipo=t.dataset.tipo;if(!(t.dataset.tipo==='Acidente'?CONFIG.classAcidente:CONFIG.classIncidente).includes(S.ocorrencia.classificacao))S.ocorrencia.classificacao='';syncClass(S);DBX.save();render();return}
 if(t.dataset.cell&&ed){const [p,g]=t.dataset.cell.split('|');const pt=S.ocorrencia.potencial;pt.probabilidade=p;if(pt.gravidade!==g){pt.gravidade=g;pt.dimensao=''}syncClass(S);DBX.save();const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(t.dataset.grav&&ed){const [g,d]=t.dataset.grav.split('|');Object.assign(S.ocorrencia.potencial,{gravidade:g,dimensao:d});syncClass(S);DBX.save();const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(t.dataset.prob&&ed){S.ocorrencia.potencial.probabilidade=t.dataset.prob;syncClass(S);DBX.save();const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(t.dataset.del&&ed){const ks=t.dataset.del.split('.');getPath(S,ks[0]).splice(+ks[1],1);if(ks[0]==='licoes'&&!S.licoes.length)S.licoes.push('');DBX.save();render();return}
 if(t.dataset.delfato&&ed){const f=S.fatos[+t.dataset.delfato];if(S.arvore.nodes.some(x=>x.fatoId===f.id)){toast('Este fato está na árvore. Remova-o da árvore primeiro.',true);return}S.fatos.splice(+t.dataset.delfato,1);DBX.save();render();return}
 if(t.dataset.node){sel=t.dataset.node;confirmDel=null;$('#panel').innerHTML=panelHTML();drawTree();applyRO();return}
 if(t.dataset.unlink&&ed){S.arvore.edges=S.arvore.edges.filter(x=>!(x.from===t.dataset.unlink&&x.to===sel));prune();DBX.save();render();return}
 if(t.dataset.ia){rodarIA(t.dataset.ia);return}
 if(t.dataset.act)actInv(t.dataset.act,t,ed);
});
function actGlobal(a,t){
 if(a==='nova')modalNova();
 if(a==='limparFiltros'){Object.keys(filtros).forEach(k=>filtros[k]='');render()}
 if(a==='limparHist'){Object.keys(hf).forEach(k=>hf[k]='');histPage=1;render()}
 if(a==='filtroAprov'){filtros.sit='aprovacao';render()}
 if(a==='resetDB'&&P.config()){if(confirmDel!=='db'){confirmDel='db';render();return}confirmDel=null;DBX.reset();render();toast('Dados de exemplo restaurados.')}
}
async function actInv(a,t,ed){
 if(['nova','limparFiltros','limparHist','filtroAprov','resetDB'].includes(a))return actGlobal(a,t);
 if(a==='novaSubst'&&(ed||P.acompanharAcoes(S))){const o=S.acoes[+t.dataset.i];const k=S.acoes.findIndex(x=>x.padrao);S.acoes.splice(k<0?S.acoes.length:k,0,{id:uid(),texto:'',causas:[...o.causas],nivel:'',responsavel:o.responsavel,prazo:'',status:'Não iniciada',padrao:'',substitui:o.id,ef:{como:'',evidencia:'',resultado:''}});hist(S,'Nova ação definida por ineficácia',o.texto.slice(0,80));DBX.save();render();return}
 if(a==='enviar'&&ed){if(nErros(validar(S))){toast('Resolva as pendências obrigatórias antes de enviar.',true);return}S.status='aprovacao';S.devolucao='';hist(S,'Enviada para aprovação');DBX.save();render();toast('Enviada para aprovação do supervisor.')}
 if(a==='aprovar'&&P.aprovar(S)){modal(`<header>Aprovar a análise</header><div class="body"><p class="small muted" style="margin-top:0">NP 7.3.6: a análise é validada pelo gerente da área e aprovada pelo SSMA. Registre a validação do gerente.</p><div class="form"><div class="f c8"><label class="l" for="mVg">Gerente da área que validou<span class="req">*</span></label><input type="text" class="inp" id="mVg" value="${esc(S.validacaoGerente.nome)}"></div><div class="f c4"><label class="l" for="mVd">Data<span class="req">*</span></label><input type="date" class="inp" id="mVd" value="${esc(S.validacaoGerente.data||today())}"></div></div></div><footer><button class="btn" data-close="1">Cancelar</button><button class="btn primary" data-act="confirmaAprov">Aprovar</button></footer>`)}
 if(a==='confirmaAprov'&&P.aprovar(S)){const n=$('#mVg').value.trim(),dt=$('#mVd').value;if(!n||!dt){toast('Informe o gerente e a data da validação.',true);return}S.validacaoGerente={nome:n,data:dt};S.status='assinatura';const ab=S.acoes.find(x=>x.padrao==='abrangencia');if(ab&&!/Concluída/.test(ab.status))ab.prazo=addDays(today(),10);hist(S,'Aprovada',`Validada pelo gerente da área ${n} em ${brDate(dt)}`);DBX.save();fecharModal();step=7;render();toast('Aprovada. Prazo da abrangência ajustado para 10 dias (NP 7.4.2).')}
 if(a==='devolver'&&P.aprovar(S))modalMotivo('Devolver para ajustes','Motivo da devolução (o técnico verá esta mensagem)','devolver');
 if(a==='reabrir'&&P.reabrir(S))modalMotivo('Reabrir investigação','Motivo da reabertura','reabrir');
 if(a==='anexar'&&P.anexarPdf(S))modalPdf();
 if(a==='confirmaPdf'){const f=$('#mPdf').files[0];if(!f){toast('Escolha o arquivo PDF.',true);return}if(window.MODO_PROD){t.disabled=true;t.textContent='Enviando...';await PROD.anexarPdf(f);return}S.pdf={nome:f.name,data:brDate(today()),por:USERS[perfil()].nome};S.status='concluida';S.concluidaEm=today();hist(S,'Concluída com o PDF assinado anexado',f.name);DBX.save();fecharModal();render();toast('Investigação concluída.')}
 if(a==='ppt'||a==='pptRasc'){t.disabled=true;try{await gerarPPT(a==='pptRasc')}catch(x){console.error(x);toast('Erro ao gerar o relatório.',true)}t.disabled=false}
 if(a==='json'){await baixar(S.id+'.json',new Blob([JSON.stringify(S,null,1)],{type:'application/json'}))}
 if(a==='abrirPdf'){PROD.abrirPdf(S);return}
 if(a==='enviarIP'){t.disabled=true;await PROD.sincronizarIP(S,true);render();return}
 if(!ed)return;
 if(a==='comunicado'){toast('No sistema final abre a lista de comunicados para vincular.')}
 if(a==='prob4'){S.ocorrencia.potencial.probabilidade='4';syncClass(S);DBX.save();render();toast('Probabilidade 4 (Provável) aplicada. Revise a gravidade e a justificativa.')}
 if(a==='aplicarACA'){S.ocorrencia.classificacao='ACA – Com afastamento';hist(S,'Classificação alterada de ASA para ACA (afastamento registrado no Sênior)');DBX.save();render();toast('Classificação alterada para ACA.');return}
 if(a==='ativos'){toast('No sistema final, nome, cargo, idade e admissão vêm da planilha ATIVOS.')}
 if(a==='addComite'){S.comite.push({matricula:'',nome:'',cargo:'',papel:''});DBX.save();render()}
 if(a==='envNoComite'){const v=S.envolvido;if(!S.comite.some(c=>c.papel==='Envolvido/Acidentado'))S.comite.push({matricula:v.matricula,nome:v.nome,cargo:v.cargo,papel:'Envolvido/Acidentado'});DBX.save();render()}
 if(a==='addFato'){S.fatos.push({id:uid(),texto:'',fonte:''});DBX.save();render();const tx=document.querySelectorAll('table.edit textarea');tx[tx.length-1]?.focus()}
 if(a==='colar'){$('#colarBox').innerHTML=`<div style="padding:0 12px 12px"><label class="lbl2" for="colarTx">Cole os fatos, um por linha (a numeração é removida)</label><textarea class="inp" id="colarTx" rows="6"></textarea><button class="btn sm primary" style="margin-top:6px" data-act="colarOk">Adicionar à lista</button></div>`}
 if(a==='colarOk'){const L=$('#colarTx').value.split('\n').map(l=>l.replace(/^\s*(\d+[\.\)\-–]|[•\-\*])\s*/,'').replace(/;\s*$/,'').trim()).filter(Boolean);L.forEach(l=>S.fatos.push({id:uid(),texto:l,fonte:''}));DBX.save();render();toast(`${L.length} fato(s) adicionado(s).`)}
 if(a==='setRoot'){const i=$('#rootSel').selectedIndex-1;const nv=$('#rootNew').value.trim();let fid;if(nv){const f={id:uid(),texto:nv,fonte:'A confirmar'};S.fatos.push(f);fid=f.id}else if(i>=0)fid=S.fatos[i].id;else{toast('Escolha um fato ou descreva a lesão/dano.',true);return}
  const n={id:uid(),fatoId:fid,raiz:false};S.arvore={rootId:n.id,nodes:[n],edges:[]};sel=n.id;DBX.save();render()}
 if(a==='addAnt'){const fs=$('#addSel').value;const nv=$('#addNew').value.trim();let fid=fs;if(!fid){if(!nv){toast('Escolha um fato ou escreva um novo.',true);return}const f={id:uid(),texto:nv,fonte:'A confirmar'};S.fatos.push(f);fid=f.id}
  const n={id:uid(),fatoId:fid,raiz:false};S.arvore.nodes.push(n);S.arvore.edges.push({from:n.id,to:sel});const par=nodeById(sel);if(par.raiz){par.raiz=false;delete S.causas[par.id]}DBX.save();render()}
 if(a==='link'){const id=$('#linkSel').value;if(reaches(sel,id)){toast('Essa ligação criaria um ciclo.',true);return}S.arvore.edges.push({from:id,to:sel});DBX.save();render()}
 if(a==='delNode'){if(confirmDel!==sel){confirmDel=sel;$('#panel').innerHTML=panelHTML();return}const id=sel;S.arvore.nodes=S.arvore.nodes.filter(n=>n.id!==id);S.arvore.edges=S.arvore.edges.filter(x=>x.from!==id&&x.to!==id);delete S.causas[id];prune();sel=null;confirmDel=null;DBX.save();render()}
 if(a==='resetTree'){if(confirmDel!=='root'){confirmDel='root';$('#panel').innerHTML=panelHTML();return}S.arvore={rootId:null,nodes:[],edges:[]};S.causas={};sel=null;confirmDel=null;DBX.save();render()}
 if(a==='addAcao'){const k=S.acoes.findIndex(x=>x.padrao);S.acoes.splice(k<0?S.acoes.length:k,0,{id:uid(),texto:'',causas:[],nivel:'',responsavel:'',prazo:'',status:'Não iniciada',padrao:'',ef:{como:'',evidencia:'',resultado:''}});DBX.save();render()}
 if(a==='addLicao'){S.licoes.push('');DBX.save();render()}
}
async function addFotos(files){for(const f of files){const src=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)});const img=new Image();await new Promise(r=>{img.onload=r;img.src=src});
 const sc=Math.min(1,1024/Math.max(img.width,img.height));const cv=document.createElement('canvas');cv.width=Math.round(img.width*sc);cv.height=Math.round(img.height*sc);cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
 const ph={src:cv.toDataURL('image/jpeg',0.8),w:cv.width,h:cv.height,legenda:''};if(window.MODO_PROD){try{ph.path=await PROD.subirFoto(S,cv)}catch(x){toast('A foto não foi enviada: '+x.message,true);continue}}S.fotos.push(ph)}DBX.save();render()}

/* ===================== INÍCIO ===================== */
let lastId=null;
const _route=route;route=function(){const h=location.hash.replace('#','');const id=h.startsWith('inv-')?h.slice(4):null;if(id!==lastId){step=0;sel=null;firstDraw=true;confirmDel=null;lastId=id}_route()};
window.removeEventListener('hashchange',_route);window.addEventListener('hashchange',route);
if(!window.MODO_PROD){DBX.load();route();}
if(window.claude&&typeof window.claude.use==='function'){
 claude.use('downloads').then(d=>{dl=d}).catch(()=>{});
 claude.use('sample').then(s=>{iaSample=s;if(s)document.body.classList.remove('noia')}).catch(()=>{});
}
