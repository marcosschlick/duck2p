# duck2p

O **duck2p** (*Duck-to-Peer*) é uma plataforma desenvolvida para o CodeDay 2026 (IFSUL Santana do Livramento) que conecta estudantes com dificuldades de programação a mentores voluntários no campus.

O projeto transforma o *rubber duck debugging* solitário em mentoria colaborativa real: calouros relatam suas dúvidas em linguagem natural e o sistema realiza o pareamento semântico com o mentor mais capacitado para auxiliá-los.

### Principais Recursos
* **Pareamento Semântico Local:** Geração de embeddings vetoriais em CPU via FastEmbed (modelo multilíngue) com desempate por pontuação de gamificação.
* **Acolhimento com Duck Bot:** Mensagem inicial empática no chat gerada pela API Gemini, sintetizando a dúvida e tranquilizando o aluno.
* **Briefing Pedagógico:** Diagnóstico prévio e orientações no método socrático gerados via Gemini para guiar o mentor sem entregar código pronto.
* **Perfil Evolutivo:** Ao concluir um atendimento com dúvida resolvida, o tema é agregado às competências do mentor e seu vetor de afinidade é recalculado.
* **Ranking da Comunidade (Leaderboard):** Classificação gamificada dos mentores com base em pontuação, nível, atendimentos e avaliação por estrelas.
* **Chat Integrado:** Atendimento 100% interno na plataforma, sem necessidade de contatos externos.

---

## Como Rodar o Projeto

### Pré-requisitos
* Docker e Docker Compose (ou Podman e podman-compose)
* Chave de API Google Gemini ([Google AI Studio](https://aistudio.google.com/))
* Python e Node.js (opcional, para execução local direta)

---

### 1. Configuração de Variáveis de Ambiente

Crie o arquivo `.env` a partir do modelo de exemplo:

```bash
cp .env.example .env
```

Edite o `.env` e adicione sua chave de API do Google Gemini:

```env
GEMINI_API_KEY=sua_chave_aqui
```

> **Nota:** Se a chave não for informada, o sistema aciona automaticamente o mecanismo de contingência (*fallback*) com mensagens e briefings estruturados.

---

### 2. Execução com Docker Compose (Recomendado)

Na raiz do projeto:

```bash
docker compose up --build
```

Os serviços iniciam automaticamente:
* Aplicação Frontend: `http://localhost:5173`
* API Backend: `http://localhost:8000`
* Documentação da API (Swagger): `http://localhost:8000/docs`
* PostgreSQL: `localhost:5432`

---

### 3. Execução Local Direta (Alternativa)

#### Banco de Dados (PostgreSQL)

```bash
docker compose up -d db
```

#### Backend (FastAPI)

Em um terminal:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=src uvicorn main:app --reload --port 8000
```

#### Frontend (React + Vite)

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

---

### Comandos Úteis

* Parar os serviços:
  ```bash
  docker compose stop
  ```
* Parar e remover containers e volumes:
  ```bash
  docker compose down -v
  ```


