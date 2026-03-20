from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import speech_recognition as sr
from googletrans import Translator
import re
import uvicorn
import os
from pydub import AudioSegment

app = FastAPI()

# Initialize recognizer and translator
recognizer = sr.Recognizer()
translator = Translator()

class AudioRequest(BaseModel):
    audioPath: str

def speech_to_text(audio_file_path):
    try:
        # Convert audio to WAV if needed
        audio = AudioSegment.from_file(audio_file_path)
        wav_path = audio_file_path.rsplit('.', 1)[0] + '.wav'
        audio.export(wav_path, format='wav')

        # Use speech recognition
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
            return text
    except Exception as e:
        print(f"Error in speech recognition: {e}")
        return "Could not transcribe audio"
    finally:
        # Clean up temp file
        if os.path.exists(wav_path):
            os.remove(wav_path)

def translate_to_english(text):
    try:
        translated = translator.translate(text, dest='en')
        return translated.text
    except:
        return text  # Return original if translation fails

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

@app.post("/process-audio")
async def process_audio(audio: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        temp_path = f"temp_{audio.filename}"
        with open(temp_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)

        # Process audio
        text = speech_to_text(temp_path)
        translated_text = translate_to_english(text)
        items = extract_items(translated_text)
        
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return {
            "text": translated_text,
            "items": items
        }
    except Exception as e:
        # Clean up on error
        print(f"Error processing audio: {e}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)