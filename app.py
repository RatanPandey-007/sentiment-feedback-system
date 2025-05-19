from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import logging
import os
import re
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Set logging level and format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

def clean_text(text):
    """
    Clean feedback text by removing unwanted characters.
    Keeps letters, digits, spaces, and basic punctuation.
    """
    return re.sub(r"[^\w\s,.!?]", "", text)

@app.route('/')
def welcome():
    return jsonify({
        "message": "🎉 Welcome to the College Feedback Sentiment Analysis API",
        "usage": {
            "POST /feedback": {
                "description": "Analyze sentiment of a feedback",
                "body_format": {
                    "event": "string",
                    "feedback": "string"
                },
                "response": {
                    "sentiment": "Positive 😊 / Neutral 😐 / Negative 😞",
                    "polarity": "float (between -1 and 1)",
                    "confidence": "percentage score"
                }
            }
        }
    }), 200

@app.route('/feedback', methods=['POST'])
def analyze_feedback():
    try:
        data = request.get_json()
        event = data.get('event', '').strip()
        feedback_text = data.get('feedback', '').strip()

        if not event or not feedback_text:
            return jsonify({
                'status': 'error',
                'message': '❌ Event name and feedback are required.'
            }), 400

        # Clean the feedback
        cleaned = clean_text(feedback_text)

        # Analyze sentiment
        analysis = TextBlob(cleaned)
        polarity = round(analysis.sentiment.polarity, 2)

        if polarity > 0.2:
            sentiment = "Positive 😊"
        elif polarity < -0.2:
            sentiment = "Negative 😞"
        else:
            sentiment = "Neutral 😐"

        logging.info(f"[{event}] => {sentiment} (polarity: {polarity})")

        return jsonify({
            'status': 'success',
            'event': event,
            'original_feedback': feedback_text,
            'cleaned_feedback': cleaned,
            'sentiment': sentiment,
            'polarity': polarity,
            'confidence': f"{abs(polarity * 100):.1f}%"  # e.g., 82.0%
        }), 200

    except Exception as e:
        logging.exception("❌ Unexpected error occurred:")
        return jsonify({
            'status': 'error',
            'message': 'Something went wrong while analyzing feedback.',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))  # Default port 5000
    app.run(debug=True, host='0.0.0.0', port=port)
