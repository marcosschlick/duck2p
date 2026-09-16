from dtos.message_dto import MessageResponse, MessageSendRequest
from fastapi import HTTPException, status
from repositories.match_repository import MatchRepository
from repositories.message_repository import MessageRepository
from repositories.question_repository import QuestionRepository
from repositories.user_repository import UserRepository


class ChatService:
    def __init__(
        self,
        message_repo: MessageRepository | None = None,
        match_repo: MatchRepository | None = None,
        question_repo: QuestionRepository | None = None,
        user_repo: UserRepository | None = None,
    ):
        self.message_repo = message_repo or MessageRepository()
        self.match_repo = match_repo or MatchRepository()
        self.question_repo = question_repo or QuestionRepository()
        self.user_repo = user_repo or UserRepository()

    def send_message(
        self, user_id: int, match_id: int, data: MessageSendRequest
    ) -> MessageResponse:
        match = self.match_repo.find_by_id(match_id)
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atendimento não encontrado.",
            )

        question = self.question_repo.find_by_id(match["question_id"])
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dúvida não encontrada.",
            )

        if user_id != question["student_id"] and user_id != match["mentor_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para interagir neste chat.",
            )

        if match["status"] != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Atendimento encerrado, não é possível enviar novas mensagens.",
            )

        if user_id == match["mentor_id"]:
            self.match_repo.set_first_response_at(match_id)

        msg = self.message_repo.create(
            match_id=match_id, sender_id=user_id, content=data.content
        )
        user = self.user_repo.find_by_id(user_id)
        sender_name = user["full_name"] if user else ""

        return MessageResponse(
            id=msg["id"],
            match_id=msg["match_id"],
            sender_id=msg["sender_id"],
            sender_name=sender_name,
            content=msg["content"],
            created_at=msg["created_at"],
            is_mine=True,
        )

    def list_messages(self, user_id: int, match_id: int) -> list[MessageResponse]:
        match = self.match_repo.find_by_id(match_id)
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atendimento não encontrado.",
            )

        question = self.question_repo.find_by_id(match["question_id"])
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dúvida não encontrada.",
            )

        if user_id != question["student_id"] and user_id != match["mentor_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para visualizar as mensagens deste atendimento.",
            )

        rows = self.message_repo.list_by_match_id(match_id)
        if user_id == match["mentor_id"]:
            rows = [r for r in rows if r["sender_id"] is not None]
        return [
            MessageResponse(
                id=r["id"],
                match_id=r["match_id"],
                sender_id=r["sender_id"],
                sender_name=r["sender_name"],
                content=r["content"],
                created_at=r["created_at"],
                is_mine=(r["sender_id"] == user_id),
            )
            for r in rows
        ]
