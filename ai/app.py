import os
import re
import tempfile
from flask import Flask, request, jsonify
from model import recommend, upsert_items

app = Flask(__name__)

try:
    import whisper
    whisper_model = whisper.load_model('base')
except ModuleNotFoundError:
    whisper_model = None


def speech_to_text(audio_path):
    if whisper_model is None:
        raise RuntimeError("Whisper is not installed; install via `pip install -U openai-whisper` if you need /process-audio.")
    output = whisper_model.transcribe(audio_path)
    return output.get('text', '').strip()


def translate_to_english(text):
    # Optional translation step: if you don't want dependency, remove or keep as passthrough
    try:
        from googletrans import Translator
        translator = Translator()
        translated = translator.translate(text, dest='en')
        return translated.text
    except Exception:
        return text


def extract_items(text):
    pattern = r'(\d+\.?\d*\s?(kg|g|packet|packets|litre|ml))\s([a-zA-Z]+)'
    matches = re.findall(pattern, text)
    items = []

    for quantity, _, item in matches:
        items.append({'item': item, 'quantity': quantity})

    # fallback: every word can also be considered an item if no quantity is present
    if not items and text:
        for token in re.findall(r"[a-zA-Z]+", text):
            items.append({'item': token.lower(), 'quantity': '1'})

    return items


@app.route('/recommend', methods=['POST'])
def get_recommendation():
    data = request.get_json(force=True, silent=True) or {}
    product = data.get('product')
    additional_items = data.get('items') or data.get('products')

    # Optional: ingest dynamic items from client
    new_items = []
    if additional_items and isinstance(additional_items, list):
        new_items = upsert_items(additional_items)

    result = recommend(product)

    return jsonify({
        'input': product,
        'recommendations': result,
        'new_items_added': new_items
    })


@app.route('/process-audio', methods=['POST'])
def process_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'audio file field is required'}), 400

    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'filename is required'}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    try:
        raw_text = speech_to_text(tmp_path)
        text = translate_to_english(raw_text)
        items = extract_items(text)

        item_names = [i['item'] for i in items if i.get('item')]
        new_items = upsert_items(item_names)

        recommendation = None
        if item_names:
            recommendation = recommend(item_names[0])

        return jsonify({
            'text': text,
            'items': items,
            'new_items_added': new_items,
            'recommendations': recommendation
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass


if __name__ == '__main__':
    app.run(port=8000)