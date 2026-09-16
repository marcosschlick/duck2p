import json
import os

import numpy as np
from fastembed import TextEmbedding
from google import genai
from google.genai import errors


class AIService:
    _embedding_model: TextEmbedding | None = None

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()

    @classmethod
    def get_embedding_model(cls) -> TextEmbedding:
        if cls._embedding_model is None:
            cls._embedding_model = TextEmbedding(
                model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
            )
        return cls._embedding_model

    def generate_embedding(self, text: str) -> list[float]:
        model = self.get_embedding_model()
        embeddings = list(model.embed([text]))
        return embeddings[0].tolist()

    def generate_embedding_json(self, text: str) -> str:
        vector = self.generate_embedding(text)
        return json.dumps(vector)

    @staticmethod
    def calculate_cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        similarity = float(np.dot(a, b) / (norm_a * norm_b))
        return max(0.0, min(1.0, similarity))

    def find_best_mentor(
        self, question_embedding: list[float], mentors: list[dict]
    ) -> tuple[dict, float] | None:
        if not mentors:
            return None

        candidates = []
        for mentor in mentors:
            raw_emb = mentor.get("embedding")
            if not raw_emb:
                mentor_vec = self.generate_embedding(mentor["skills"])
            else:
                try:
                    mentor_vec = json.loads(raw_emb)
                except (json.JSONDecodeError, TypeError, ValueError):
                    mentor_vec = self.generate_embedding(mentor["skills"])

            score = self.calculate_cosine_similarity(question_embedding, mentor_vec)
            points = mentor.get("points", 0)
            candidates.append((score, points, mentor))

        candidates.sort(key=lambda item: (item[0], item[1]), reverse=True)
        best_score, _, best_mentor = candidates[0]
        return best_mentor, round(best_score, 4)

    def generate_duck_bot_greeting(self, problem_description: str) -> str:
        fallback = (
            "Olá! Sou o Duck Bot da plataforma duck2p. "
            "Já processei a descrição da sua dúvida e encontrei um mentor ideal para orientar você. "
            "Respire fundo: estamos prontos para desvendar esse código juntos!"
        )
        if not self.api_key:
            return fallback

        try:
            client = genai.Client(api_key=self.api_key)
            prompt = (
                f"Você é o Duck Bot, assistente carinhoso e técnico da plataforma duck2p. "
                f"O aluno enviou a seguinte dúvida de programação: '{problem_description}'. "
                f"Escreva uma mensagem inicial acolhedora, empática e encorajadora (máximo 3 frases) "
                f"para tranquilizar o aluno, resumindo brevemente a essência do problema e avisando que um mentor já foi conectado."
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            text = response.text.strip() if response.text else ""
            return text if text else fallback
        except (errors.APIError, ConnectionError, TimeoutError, OSError, ValueError):
            return fallback

    def generate_mentor_briefing(self, problem_description: str) -> str:
        fallback = (
            "Diagnóstico Técnico: Dificuldade na compreensão do fluxo ou lógica do código relatado.\n"
            "Orientação Pedagógica: Conduza o aluno com o método Rubber Duck Debugging, "
            "fazendo perguntas reflexivas para que ele identifique o erro por si mesmo sem dar a resposta pronta."
        )
        if not self.api_key:
            return fallback

        try:
            client = genai.Client(api_key=self.api_key)
            prompt = (
                f"Você é um orientador pedagógico de programação. Um aluno enviou a seguinte dúvida: '{problem_description}'. "
                f"Elabore um briefing técnico prévio sucinto e objetivo para o mentor voluntário com: "
                f"1) Diagnóstico provável da dúvida; 2) Orientação pedagógica de como conduzir a mentoria "
                f"usando o método socrático/rubber duck debugging sem entregar a resposta pronta."
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            text = response.text.strip() if response.text else ""
            return text if text else fallback
        except (errors.APIError, ConnectionError, TimeoutError, OSError, ValueError):
            return fallback
