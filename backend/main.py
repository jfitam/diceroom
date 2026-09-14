from uuid import uuid4
from typing import Literal, Annotated

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, StringConstraints, ValidationError
import d20

PlayerName = Annotated[
    str, 
    StringConstraints(
        strip_whitespace=True,
        min_length=1,
        max_length=20,
    ),
    ]
class RollRequest(BaseModel):
    name: PlayerName
    expression: str

class Roll(BaseModel):
    id: str
    name: str
    expression: str
    details: str
    total: int

class Response(BaseModel):
    type: Literal["history", "roll", "error"]
    data: list[Roll] | Roll | str


app = FastAPI()

connections: list[WebSocket] = []

rolls: list[Roll] = []

@app.get("/")
def home():
    return {"message": "Servidor de dados funcionando"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.append(websocket)
    await websocket.send_json(Response(type = "history", data = rolls).model_dump(mode="json"))

    while True:
        try:
        
            data = await websocket.receive_json()
            request = RollRequest.model_validate(data)

            rolled_expression = d20.roll(request.expression)

            roll = Roll(
                id = str(uuid4()),
                name = request.name,
                expression = request.expression,
                details = str(rolled_expression),
                total = rolled_expression.total,
            )

            rolls.insert(0, roll)
            del rolls[20:]

            for connection in connections:
                await connection.send_json(Response(type = "roll", data = roll).model_dump(mode="json"))

        except WebSocketDisconnect:
            connections.remove(websocket)
            break

        except ValidationError as e:
            print(e)
            await websocket.send_json(Response(type="error", data="Nombre o expresión no válidos").model_dump(mode="json"))
            continue

        except d20.RollSyntaxError as e:
            print(e)
            await websocket.send_json(Response(type="error", data="La tirada indicada no es válida").model_dump(mode="json"))