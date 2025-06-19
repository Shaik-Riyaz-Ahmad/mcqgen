# MCQ Generator Web App (Google Gemini + LangChain)
# Enjoy a modern, attractive UI with custom themes, icons, and interactive features.
# This Streamlit app allows you to generate, review, and export Multiple Choice Questions (MCQs) from any text using Google Gemini API and LangChain.

import os
import json
import traceback
from datetime import datetime
import pandas as pd
import streamlit as st
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain, SequentialChain

# --- Load environment variables ---
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# --- Streamlit page config ---
st.set_page_config(
    page_title="MCQ Generator (Gemini + LangChain)",
    page_icon="📝",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Custom CSS for attractive UI ---
st.markdown(
    """
    <style>
    .main {background-color: #f8fafc;}
    .stButton>button {background-color: #2563eb; color: white; font-weight: 600; border-radius: 8px;}
    .stTextInput>div>div>input {border-radius: 8px;}
    .stTextArea>div>textarea {border-radius: 8px;}
    .stSelectbox>div>div {border-radius: 8px;}
    .stMarkdown {font-size: 1.1rem;}
    .stDataFrame {background: #fff; border-radius: 8px;}
    </style>
    """,
    unsafe_allow_html=True
)

# --- Sidebar ---
st.sidebar.image(
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", width=80
)
st.sidebar.title("MCQ Generator")
st.sidebar.markdown("Generate, review, and export MCQs from any text using Google Gemini and LangChain.")

# --- Model selection ---
def get_model_name():
    default_model = "gemini-1.5-pro-latest"
    model = st.sidebar.text_input(
        "Gemini Model Name",
        value=default_model,
        help="Set your Gemini model name (e.g., gemini-1.5-pro-latest)."
    )
    return model

model_name = get_model_name()

# --- API Key input (optional override) ---
if not GOOGLE_API_KEY:
    GOOGLE_API_KEY = st.sidebar.text_input(
        "Google Gemini API Key",
        type="password",
        help="Paste your Google Gemini API key here."
    )

# --- LLM Initialization ---
llm = None
if GOOGLE_API_KEY and model_name:
    try:
        llm = ChatGoogleGenerativeAI(
            model=model_name,
            temperature=0.7,
            google_api_key=GOOGLE_API_KEY
        )
        st.sidebar.success(f"Gemini model '{model_name}' initialized.")
    except Exception as e:
        st.sidebar.error(f"Error initializing Gemini: {e}")
else:
    st.sidebar.warning("Please provide your Google Gemini API key and model name.")

# --- Prompt Templates ---
RESPONSE_JSON = {
    "1": {
        "mcq": "multiple choice question",
        "options": {"a": "choice here", "b": "choice here", "c": "choice here", "d": "choice here"},
        "correct": "correct answer",
        "explanation": "explanation of the correct answer"
    }
}

TEMPLATE = """
Text: {text}
You are an expert MCQ maker. Given the above text, it is your job to create a quiz of {number} multiple choice questions for {subject} students in {tone} tone.
Make sure the questions are not repeated and check all the questions to be conforming the text as well.
Make sure to format your response like RESPONSE_JSON below and use it as a guide.
Ensure to make {number} MCQs only.
### RESPONSE_JSON
{response_json}
### INSTRUCTIONS:
1. Create exactly {number} questions
2. Each question should have 4 options (a, b, c, d)
3. Clearly indicate the correct answer
4. Provide explanation for each correct answer
5. Questions should be relevant to the given text
6. Use {tone} tone throughout
7. Target {subject} students level
"""

TEMPLATE2 = """
You are an expert English grammarian and writer. Given a Multiple Choice Quiz for {subject} students.
You need to evaluate the complexity of the question and give a complete analysis of the quiz. Only use at max 50 words for complexity analysis.
If the quiz is not at par with the cognitive and analytical abilities of the students, update the quiz questions which need to be changed and change the tone such that it perfectly fits the student abilities.
Quiz_MCQs:
{quiz}
Check from an expert English Writer of the above quiz:
"""

quiz_generator_prompt = PromptTemplate(
    input_variables=["text", "number", "subject", "tone", "response_json"],
    template=TEMPLATE
)
quiz_evaluation_prompt = PromptTemplate(
    input_variables=["quiz", "subject"],
    template=TEMPLATE2
)

# --- Chains ---
quiz_chain = LLMChain(
    llm=llm,
    prompt=quiz_generator_prompt,
    output_key="quiz",
    verbose=False
)
review_chain = LLMChain(
    llm=llm,
    prompt=quiz_evaluation_prompt,
    output_key="review",
    verbose=False
)
generate_evaluation_chain = SequentialChain(
    chains=[quiz_chain, review_chain],
    input_variables=["text", "number", "subject", "tone", "response_json"],
    output_variables=["quiz", "review"],
    verbose=False
)

# --- Main App UI ---
st.title("📝 MCQ Generator (Gemini + LangChain)")
st.markdown(
    """
    <div style='font-size:1.2rem;'>
    Generate high-quality, customizable MCQs from any text. Powered by <b>Google Gemini</b> and <b>LangChain</b>.<br>
    <span style='color:#2563eb;'>Paste your text, set your preferences, and get instant MCQs!</span>
    </div>
    """,
    unsafe_allow_html=True
)

with st.expander("ℹ️ How it works", expanded=False):
    st.markdown("""
    1. Paste or upload your text.
    2. Set the number of questions, subject, and tone.
    3. Click <b>Generate MCQs</b> to get your quiz and review.
    4. Download your MCQs as CSV for easy sharing.
    """, unsafe_allow_html=True)

# --- Input Section ---
def get_text_input():
    st.subheader("📄 Input Text")
    text = st.text_area(
        "Paste your text here:",
        height=200,
        placeholder="Paste any article, notes, or textbook content..."
    )
    uploaded_file = st.file_uploader("Or upload a .txt file", type=["txt"])
    if uploaded_file:
        text = uploaded_file.read().decode("utf-8")
        st.success("Text file loaded!")
    return text

text = get_text_input()

col1, col2, col3 = st.columns([1,1,1])
with col1:
    number = st.number_input("Number of Questions", min_value=1, max_value=20, value=5)
with col2:
    subject = st.text_input("Subject", value="general", help="E.g., science, history, machine learning")
with col3:
    tone = st.selectbox("Tone", ["simple", "moderate", "complex"], index=0)

# --- MCQ Generation ---
def parse_quiz_json(quiz_content):
    import re
    try:
        json_match = re.search(r'\{.*\}', quiz_content, re.DOTALL)
        if json_match:
            quiz_json = json.loads(json_match.group())
            return quiz_json
        else:
            return None
    except Exception:
        return None

def quiz_to_table(quiz_json):
    quiz_table_data = []
    for key, value in quiz_json.items():
        mcq = value.get("mcq", "")
        options = value.get("options", {})
        correct = value.get("correct", "")
        explanation = value.get("explanation", "")
        options_str = " | ".join([f"{k}: {v}" for k, v in options.items()])
        quiz_table_data.append({
            "Question": mcq,
            "Options": options_str,
            "Correct Answer": correct,
            "Explanation": explanation
        })
    return quiz_table_data

if st.button("✨ Generate MCQs", use_container_width=True, type="primary"):
    if not llm:
        st.error("Please provide a valid Google Gemini API key and model name.")
    elif not text or len(text.strip()) < 20:
        st.warning("Please provide a longer text input.")
    else:
        with st.spinner("Generating MCQs and review..."):
            try:
                response = generate_evaluation_chain({
                    "text": text,
                    "number": number,
                    "subject": subject,
                    "tone": tone,
                    "response_json": json.dumps(RESPONSE_JSON)
                })
                quiz_content = response.get("quiz", "")
                review = response.get("review", "")
                quiz_json = parse_quiz_json(quiz_content)
                if quiz_json:
                    quiz_table_data = quiz_to_table(quiz_json)
                    quiz_df = pd.DataFrame(quiz_table_data)
                    st.success(f"Generated {len(quiz_table_data)} MCQs!")
                    st.dataframe(quiz_df, use_container_width=True, hide_index=True)
                    st.markdown("### 📊 Quiz Review and Evaluation")
                    st.info(review)
                    # Download button
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    filename = f"mcq_{subject.replace(' ', '_')}_{timestamp}.csv"
                    csv = quiz_df.to_csv(index=False).encode('utf-8')
                    st.download_button(
                        label="💾 Download MCQs as CSV",
                        data=csv,
                        file_name=filename,
                        mime='text/csv',
                        use_container_width=True
                    )
                else:
                    st.error("Could not parse MCQ JSON from the model response. Please try again or adjust your input.")
            except Exception as e:
                st.error(f"Error: {e}")
                st.exception(traceback.format_exc())

# --- Footer ---
st.markdown("""
---
<div style='text-align:center; color: #888;'>
    Made with ❤️ using Google Gemini, LangChain, and Streamlit.<br>
    <a href="https://github.com/langchain-ai/langchain" target="_blank">LangChain</a> | <a href="https://ai.google.dev/gemini-api/docs" target="_blank">Google Gemini API</a>
</div>
""", unsafe_allow_html=True)
