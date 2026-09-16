# duck2p

O **duck2p** (*Duck-to-Peer*) é uma plataforma desenvolvida para o CodeDay 2026 voltada a conectar estudantes com dificuldades de programação a mentores voluntários no campus.

O projeto visa superar as limitações do *rubber duck debugging* solitário, permitindo que alunos iniciantes relatem suas dúvidas de programação em linguagem natural e sejam direcionados ao colega mais capacitado para auxiliá-los.

A Inteligência Artificial desempenha o papel de pareamento semântico via similaridade de texto (*embeddings*) entre o problema descrito pelo estudante e as competências cadastradas pelos mentores. Adicionalmente, o modelo sintetiza um *briefing* técnico preliminar sobre a questão para contextualizar o mentor e dar celeridade ao atendimento.

---

## Como Rodar o Projeto

### Pré-requisitos
* Docker e Docker Compose (ou Podman e podman-compose)
* Python e pip (opcional, para execução local direta)
* Node.js e npm (opcional, para execução local direta)

---

### 1. Com Docker Compose (Recomendado)

Na raiz do projeto:

```bash
cp .env.example .env
docker compose up --build
```

Os serviços iniciam automaticamente com suporte a hot-reload:
* Aplicação Frontend: `http://localhost:5173`
* API Backend: `http://localhost:8000`
* Documentação da API: `http://localhost:8000/docs`
* PostgreSQL: `localhost:5432`

---

### 2. Execução Local Direta (Alternativa)

#### Banco de Dados (PostgreSQL)

Na raiz do projeto:

```bash
cp .env.example .env
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

#### Frontend (React)

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


