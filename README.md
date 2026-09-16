# duck2p
Fale com o pato, deixe a IA entender sua dor e destrave o projeto com a ajuda de um colega.

---

## Como Rodar o Projeto

### Pré-requisitos
* Docker e Docker Compose
* Python e pip
* Node.js e npm

---

### 1. Banco de Dados (PostgreSQL)

Na raiz do projeto:

```bash
cp .env.example .env
docker compose up -d
```

---

### 2. Backend (FastAPI)

Em um terminal:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=src uvicorn main:app --reload --port 8000
```

* API: `http://localhost:8000`
* Documentação: `http://localhost:8000/docs`

---

### 3. Frontend (React)

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

* Aplicação: `http://localhost:5173`

---

### Comandos Úteis

* Parar o banco de dados:
  ```bash
  docker compose stop
  ```
* Resetar o banco de dados:
  ```bash
  docker compose down -v
  docker compose up -d
  ```

