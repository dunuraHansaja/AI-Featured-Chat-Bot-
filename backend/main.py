import whisper
from googletrans import Translator
import re

model = whisper.load_model("base")

def speech_to_text(audio_file):
    result = model.transcribe(audio_file)
    return result["text"]

# test
text = speech_to_text("sample.wav")
print("Converted Text:", text)

translator = Translator()

def translate_to_english(text):
    translated = translator.translate(text, dest='en')
    return translated.text

print(translate_to_english(text))

def extract_items(text):
    pattern = r'(\d+\.?\d*\s?(kg|g|packet|packets|litre|ml))\s([a-zA-Z]+)'
    
    matches = re.findall(pattern, text)
    
    items = []
    
    for match in matches:
        quantity = match[0]
        item = match[2]
        
        items.append({
            "item": item,
            "quantity": quantity
        })
    
    return items










































# import os
# import uuid
# import json
# from fastapi import FastAPI, UploadFile, File, HTTPException
# import traceback
# from fastapi.middleware.cors import CORSMiddleware
# from openai import OpenAI
# from products import PRODUCTS

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # for dev only
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# DISCOUNT_RATE = 0.07  # 7%

# @app.get("/health")
# def health():
#     return {"status": "ok"}

# def safe_json_load(s: str):
#     """Try to parse model output as JSON even if it contains extra text."""
#     s = s.strip()
#     # find first [ and last ] to extract array
#     start = s.find("[")
#     end = s.rfind("]")
#     if start != -1 and end != -1 and end > start:
#         s = s[start:end+1]
#     return json.loads(s)

# @app.post("/voice")
# async def voice_to_order(file: UploadFile = File(...)):
#     ext = os.path.splitext(file.filename)[1] or ".webm"
#     temp_name = f"audio_{uuid.uuid4().hex}{ext}"

#     with open(temp_name, "wb") as f:
#         f.write(await file.read())

#     try:
#         # 1) Speech -> text
#         try:
#             with open(temp_name, "rb") as audio:
#                 transcript = client.audio.transcriptions.create(
#                     model="gpt-4o-transcribe",
#                     file=audio,
#                 )
#             text = (transcript.text or "").strip()
#         except Exception as e:
#             # Print traceback to server logs for debugging
#             traceback.print_exc()
#             raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")

#         if not text:
#             return {
#                 "text": "",
#                 "language": "Unknown",
#                 "items": [],
#                 "discount": "7%",
#                 "total": 0.0,
#                 "points": 0.0,
#                 "previous_points": 222.50
#             }

#         # 2) Detect language (Sinhala / English)
#         lang_prompt = f"""
# Detect the language of the following text.
# Reply ONLY with: Sinhala or English.

# Text:
# {text}
# """
#         try:
#             lang_resp = client.chat.completions.create(
#                 model="gpt-4o-mini",
#                 messages=[{"role": "user", "content": lang_prompt}],
#             )
#             language = lang_resp.choices[0].message.content.strip()
#         except Exception as e:
#             traceback.print_exc()
#             raise HTTPException(status_code=500, detail=f"Language detection failed: {e}")

#         # 3) Filter products list from text (JSON only)
#         extract_prompt = f"""
# Filter the products from the following list based on the text.
# Return ONLY a JSON array of matching product names. No extra words.

# Available products: {', '.join(PRODUCTS.keys())}

# Text:
# {text}

# Example output:
# ["rice", "soap"]
# """
#         try:
#             ext_resp = client.chat.completions.create(
#                 model="gpt-4o-mini",
#                 messages=[{"role": "user", "content": extract_prompt}],
#             )
#             filtered_products = safe_json_load(ext_resp.choices[0].message.content)
#         except Exception as e:
#             traceback.print_exc()
#             raise HTTPException(status_code=500, detail=f"Product filtering failed: {e}")

#         # 4) Match filtered products with PRODUCTS and calculate total
#         order_items = []
#         subtotal = 0.0

#         for product_name in filtered_products:
#             key = product_name.lower().strip()

#             # Simple normalization
#             key = key.replace(".", "").replace(",", "").strip()

#             if key in PRODUCTS:
#                 price = float(PRODUCTS[key]["price"])
#                 subtotal += price
#                 order_items.append({
#                     "name": product_name,
#                     "quantity": "1",  # Default quantity for filtered items
#                     "price": price
#                 })
#             else:
#                 # If no match, still show it but price=0 (though it should match)
#                 order_items.append({
#                     "name": product_name,
#                     "quantity": "1",
#                     "price": 0.0
#                 })

#         # discount + totals
#         total = subtotal - (subtotal * DISCOUNT_RATE)
#         points = round(total * 0.01, 2)  # 1% points (you can change)
#         previous_points = 222.50  # demo value (replace later with DB)

#         return {
#             "text": text,
#             "language": language,
#             "items": order_items,
#             "discount": "7%",
#             "total": round(total, 2),
#             "points": points,
#             "previous_points": previous_points
#         }

#     finally:
#         try:
#             os.remove(temp_name)
#         except:
#             pass


# @app.post("/voice-debug")
# async def voice_debug(file: UploadFile = File(...)):
#     """Simple debug endpoint: returns a fixed transcript without calling OpenAI.
#     Use this to verify frontend -> backend upload and response parsing.
#     """
#     return {
#         "text": "one kilo rice and two soaps",
#         "language": "English",
#         "items": [
#             {"name": "Rice", "quantity": "1", "price": 350},
#             {"name": "Soap", "quantity": "1", "price": 150}
#         ],
#         "discount": "7%",
#         "total": 520.0,
#         "points": 5.20,
#         "previous_points": 222.50
#     }
