# Diretrizes de Desenvolvimento - duck2p

## Sobre o Projeto
O duck2p (Duck-to-Peer) é uma plataforma desenvolvida para o CodeDay 2026 voltada a conectar estudantes com dificuldades de programação a mentores voluntários no campus. O projeto substitui o desabafo solitário do "rubber duck debugging" por mentoria real, utilizando Inteligência Artificial para realizar o pareamento semântico entre a dúvida do calouro e as habilidades cadastradas pelos veteranos, gerando também um roteiro prévio de estudo.

## Princípios de Código
* **KISS (Keep It Simple, Stupid):** Prefira sempre a solução mais simples e direta. Evite abstrações precoces e sobre-engenharia.
* **DRY (Don't Repeat Yourself):** Não duplique lógica de negócio, mas não crie abstrações complexas sem necessidade real.
* **SRP (Single Responsibility Principle):** Cada módulo, classe e função deve ter apenas uma responsabilidade clara e bem definida.
* **Legibilidade Absoluta:** O código precisa ser limpo, intuitivo e fácil de explicar verbalmente em bancas e avaliações. Prefira clareza a truques de sintaxe.
* **Zero Comentários:** NUNCA escreva comentários no código (sem comentários em linha, blocos explicativos ou docstrings redundantes). O código deve ser autoexplicativo pela sua própria nomenclatura e estrutura.
* **Sem Arquivos de Teste:** Não crie arquivos de testes automatizados (unitários ou e2e) a menos que explicitamente solicitado.
* **Regra Estrita de Dependências:** SEMPRE TENTE NÃO BAIXAR NOVAS DEPENDÊNCIAS. Utilize os recursos nativos do ecossistema e os pacotes já instalados no projeto antes de cogitar qualquer nova biblioteca.

## Stack Técnica
* **Frontend:** React com Vite, TypeScript e CSS nativo puro. Requisições via API nativa `fetch` e persistência com `localStorage`.
* **Backend:** Python com FastAPI e Uvicorn.
* **Banco de Dados:** PostgreSQL com chamadas diretas via `psycopg` (sem ORM).
* **Autenticação:** Tokens JWT (`pyjwt`) e hash de senhas (`bcrypt`).
* **Ambiente Local e Portas:** Backend na porta `8000` (`http://localhost:8000`), Frontend na porta `5173` (`http://localhost:5173`) e PostgreSQL na porta `5432`.

## Arquitetura do Backend (`backend/src/`)
Mantenha a divisão estrita em camadas:
* `controllers/`: Endpoints FastAPI, parsing de rotas e códigos de status HTTP.
* `services/`: Regras de negócio, autenticação e validações.
* `repositories/`: Consultas SQL diretas e parametrizadas no banco de dados.
* `dtos/`: Schemas Pydantic para validação de entrada e saída.
* `models/`: Entidades e estruturas de dados representativas das tabelas.
* `database.py`: Conexão direta com o banco.

## Arquitetura do Frontend (`frontend/src/`)
Mantenha a divisão modular e com responsabilidade única:
* `components/`: Componentes visuais com responsabilidade clara (cabeçalho, abas, chat e modais).
* `services/`: Comunicação com a API via `fetch` nativo, envio de token e tratamento seguro de respostas.
* `types/`: Interfaces e tipos TypeScript centralizados.
* `styles/`: Estilos em CSS puro e variáveis do `:root` organizados por módulo.
* `App.tsx`: Orquestração simples de telas, abas e estados compartilhados.

## Paleta de Cores Obrigatória (CSS Nativo)
Utilize rigorosamente as variáveis de cores padronizadas:
* `--color-primary: #73030D;` (Crimson / Primária: destaques principais, botões de ação, cabeçalho do card de match e detalhes da marca)
* `--color-primary-hover: #732F3B;` (Bordô Secundário: estados de hover nos botões, badges secundárias e títulos secundários)
* `--color-bg: #F2F2F2;` (Off-white / Superfície Clara: fundo principal da aplicação ou cor dos cards)
* `--color-surface: #FFFFFF;` (Branco: fundo dos formulários e cartões internos)
* `--color-border: #8C8C8C;` (Cinza Médio: bordas de inputs, linhas divisórias, placeholders e metadados)
* `--color-text: #0D0D0D;` (Preto Carvão: tipografia principal ou plano de fundo para modo escuro)
* `--color-text-muted: #666666;` (Texto secundário e labels auxiliares)

## Padrão de Commits
Siga estritamente o formato existente no histórico do repositório, sem escopos entre parênteses, em português e com descrição toda em letras minúsculas:
* `feat: descricao da nova funcionalidade`
* `fix: correcao de determinado problema`
* `docs: atualizacao ou adicao de documentacao`
* `chore: alteracoes em configuracoes ou infraestrutura`