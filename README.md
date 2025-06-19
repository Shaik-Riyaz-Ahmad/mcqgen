# MCQ Generator (Google Gemini + LangChain)

A modern, interactive tool to generate, review, and export Multiple Choice Questions (MCQs) from any text using Google Gemini API and LangChain. Includes both a Jupyter notebook and a beautiful Streamlit web app.

---

## Features
- **Generate MCQs** from any text (paste or upload)
- **Customizable**: Set number of questions, subject, and tone
- **Quality Review**: Built-in quiz evaluation and improvement
- **Export**: Download MCQs as CSV
- **Modern UI**: Streamlit app with attractive design
- **Robust Error Handling**

---

## Quick Start

### 1. Install Requirements
```sh
pip install -r requirements.txt
```

### 2. Set Up Google Gemini API Key
- Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Add it to a `.env` file:
  ```env
  GOOGLE_API_KEY=your-google-api-key-here
  ```
  Or enter it in the Streamlit sidebar at runtime.

### 3. Run the Streamlit App
```sh
streamlit run experiment/streamlit_app.py
```
- Open the local URL in your browser.
- Paste/upload text, set preferences, and generate MCQs!

### 4. Use the Jupyter Notebook (Optional)
- Open `experiment/mcq.ipynb` in Jupyter or VS Code.
- Run cells to generate and review MCQs programmatically.

---

## File Structure
- `experiment/streamlit_app.py` — Streamlit web app
- `experiment/mcq.ipynb` — Jupyter notebook version
- `requirements.txt` — Python dependencies
- `.env` — (Not included) Your API key

---

## Customization & Extending
- Change prompt templates for different question types
- Add more question types (True/False, Fill-in-the-blank)
- Integrate with other LLMs or APIs
- Build on the Streamlit UI for more features

---

## Credits
- [LangChain](https://github.com/langchain-ai/langchain)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [Streamlit](https://streamlit.io/)

---

## License
MIT License
