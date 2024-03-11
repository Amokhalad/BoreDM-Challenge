from quart import Quart, websocket, jsonify
from marshmallow import Schema, fields

import json
import traceback

app = Quart(__name__)

# Initial database
data = [
    {
        "id": 1, 
        "name": "Mokhalad", 
        "age": 21, 
        "school": "UC Berkeley"
    },
    {
        "id": 2, 
        "name": "Erfan", 
        "age": 24, 
        "school": "Stanford University"
    },
]

connected_websockets = set()


async def broadcast(message):
    """Broadcasts a message to all websockets."""
    disconnected_ws = set()
    for ws in connected_websockets:
        try:
            await ws.send(message)
        except Exception:
            disconnected_ws.add(ws)
    connected_websockets.difference_update(disconnected_ws)


# Schema for data serialization/deserialization
class DataSchema(Schema):
    id = fields.Int()
    name = fields.Str()
    age = fields.Int()
    school = fields.Str()

data_schema = DataSchema()
data_list_schema = DataSchema(many=True)

# WebSocket route
@app.websocket('/ws')
async def ws():
    ws_obj = websocket._get_current_object()
    connected_websockets.add(ws_obj)
    try:
        await websocket.send(json.dumps({"type": "initial", "data": data_list_schema.dump(data)}))
        while True:
            data_in = await websocket.receive()
            await process_message(data_in)
    except Exception as e:
        app.logger.error(f'WebSocket error: {str(e)}')
    finally:
        connected_websockets.discard(ws_obj)

async def process_message(data_in):
    """Process incoming WebSocket messages."""
    message = json.loads(data_in)
    match message['type']: # CRUD
        case 'create':
            await handle_create(message)
        case 'read':
            await broadcast(json.dumps(data_list_schema.dump(data)))
        case 'update':
            await handle_update(message)
        case 'delete':
            await handle_delete(message)
        case _:
            app.logger.warn(f'Unhandled message type: {message["type"]}')
            



async def handle_create(message):
    new_data = data_schema.load(message['data'])
    data.append(new_data)
    await broadcast(json.dumps({"type": "read", "data": data_list_schema.dump(data), "message": "create"}))

async def handle_update(message):
    updated_data = data_schema.load(message['data'])
    for i, item in enumerate(data):
        if item['id'] == updated_data['id']:
            data[i].update(updated_data)
    await broadcast(json.dumps({"type": "read", "data": data_list_schema.dump(data), "message": "update"}))

async def handle_delete(message):
    data[:] = [d for d in data if d['id'] != message['id']]
    await broadcast(json.dumps({"type": "read", "data": data_list_schema.dump(data), "message": "delete"}))


if __name__ == '__main__':
    app.run(debug=True, host='localhost')
