from openai import OpenAI
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Load environment variables
load_dotenv()

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Create OpenAI client (new SDK format)
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_API_BASE")  # OpenRouter endpoint
)

@app.route('/')
def home():
    return "LexiBot backend using OpenRouter AI is working!"

@app.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    text = data.get('text', '').strip()
    tone = data.get('tone', 'neutral').lower()
    target_lang = data.get('language', '').strip()

    if not text:
        return jsonify({'error': 'Missing input text'}), 400

    # Detect special 'translate my day' prompt
    is_day_translation = text.lower().startswith("translate my day")

    if is_day_translation:
        cleaned_text = text[len("translate my day"):].strip(": ").strip()

        prompt = f"""
You are LexiBot, a multilingual assistant with a warm and expressive tone.

Instructions:
1. Detect the original language of the input below.
2. Translate it clearly and naturally into '{target_lang}' — avoid overly literal translations or awkward phrases like 'by' or 'through'.
3. Then, offer a more expressive, diary-style version of the translation in '{target_lang}' — something poetic or emotionally rich.
4. Write as if you're speaking kindly to the user. For example:
   - "That would translate to '...'"
   - "Or, to say it more beautifully, you might say '...'"
5. Do not return any JSON, tags, or code — only friendly, human-like language.

User input:
"{cleaned_text}"
"""
    else:
        prompt = f"""
You are LexiBot, a multilingual and tone-aware assistant.

Instructions:
1. Detect the language of the input.
2. Translate it clearly into '{target_lang}'.
3. Rewrite it using a '{tone}' tone (e.g., casual, formal, sarcastic, encouraging).
4. Respond like a friendly assistant using this format:

"The original language is <DetectedLanguage>. Here's your {tone} version in <TargetLanguage>: <TranslatedText>"

Avoid JSON, tags, or code formatting.

User input:
"{text}"
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            temperature=0.7,
            messages=[
                {"role": "system", "content": "You are LexiBot, a helpful, tone-aware language assistant."},
                {"role": "user", "content": prompt}
            ]
        )

        ai_reply = response.choices[0].message.content.strip()
        print("AI raw response:", ai_reply)

        return jsonify({
            'translated_text': ai_reply,
            'target_lang': target_lang
        })

    except Exception as e:
        print(f"OpenRouter error: {str(e)}")
        return jsonify({'error': 'Translation via AI failed'}), 500


if __name__ == '__main__':
    app.run(debug=True)
