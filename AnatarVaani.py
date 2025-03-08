!pip install langchain_groq
!pip install langchain_core langchain_community
!pip install ChromaDB
!pip install sentence_transformers
!pip install pypdf
!pip install gradio
!pip install gradio --upgrade

import gradio as gr
import os
import csv
import json
from typing import List, Dict, Tuple
from dataclasses import dataclass
from rich.console import Console
from rich.panel import Panel
from rich.prompt import IntPrompt
from rich.progress import track
from langchain_groq import ChatGroq
from langchain.document_loaders import DirectoryLoader, PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceBgeEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# Initialize console for rich output
console = Console()

# Define SAMPLE_QUESTIONS globally before Gradio loads
SAMPLE_QUESTIONS = {
    "In the past two weeks, how often have you felt nervous, anxious, or on edge?": [
        "Never", "Rarely", "Sometimes", "Often", "Always"
    ],
    "How often have you felt down, depressed, or hopeless in the last two weeks?": [
        "Never", "Rarely", "Sometimes", "Often", "Always"
    ],
    # Add all other questions similarly...
}

@dataclass
class Question:
    text: str
    options: List[str]

class QuestionnaireApp:
    def __init__(self, questions: Dict[str, List[str]]):
        self.questions = [Question(q, opts) for q, opts in questions.items()]
        self.responses = []
        self.current_question = 0

    def run(self) -> Tuple[Dict, str]:
        for question in track(self.questions, description="Processing..."):
            answer = self.display_question(question)
            self.responses.append((question.text, answer))

        json_data, formatted_context = self.generate_context()
        self.show_summary(formatted_context)

        return json_data, formatted_context

    def display_question(self, question: Question) -> str:
        console.clear()
        console.print(Panel.fit(f"[bold yellow]{question.text}[/]", title="Question"))
        options = "\n".join(
            f"[bold cyan]{i}. {option}[/]" for i, option in enumerate(question.options, 1)
        )
        console.print(Panel.fit(options, title="Options"))

        choice = IntPrompt.ask(
            "\n[bold white]Enter your choice[/]",
            choices=[str(i) for i in range(1, len(question.options)+1)],
            show_choices=False
        )
        return question.options[choice-1]

    def generate_context(self) -> Tuple[Dict, str]:
        json_context = {
            "metadata": {
                "total_questions": len(self.questions),
                "answered": len(self.responses)
            },
            "answers": [
                {"question": q_text, "selected_answer": ans}
                for q_text, ans in self.responses
            ]
        }
        
        context_str = "\n".join(
            [f"Q: {q}\nA: {a}" for q,a in self.responses]
        )

        return json_context, context_str

    def show_summary(self, context_str):
        console.clear()
        console.print(Panel.fit("[bold green]✓ Assessment Complete![/]", title="Status"))
        console.print(Panel.fit(context_str, title="Your Answers"))

def initialize_llm():
    return ChatGroq(
        temperature=0,
        groq_api_key="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",
        model_name="llama-3.3-70b-versatile"
    )

def load_therapists():
    with open('/content/updated_mental_health_professionals.csv') as file:
        reader = csv.DictReader(file)
        return [dict(row) for row in reader]

def create_or_load_vector_db():
    db_path = "/content/chroma_db"
    embeddings = HuggingFaceBgeEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
    
    if not os.path.exists(db_path):
        loader = DirectoryLoader("/content/data", glob='*.pdf', loader_cls=PyPDFLoader)
        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        texts = text_splitter.split_documents(documents)
        
        vector_db = Chroma.from_documents(texts, embeddings, persist_directory=db_path)
        vector_db.persist()
    else:
        vector_db = Chroma(persist_directory=db_path, embedding_function=embeddings)

    return vector_db

def setup_qa_chain(vector_db, llm):
    retriever = vector_db.as_retriever()
    prompt_template = """
    Context: {context}
    User: {question}
    AntarVaani:"""

    PROMPT = PromptTemplate(template=prompt_template.strip(), input_variables=['context', 'question'])
    
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs={"prompt": PROMPT}
    )
    
    return qa_chain

# Run assessment BEFORE loading Gradio UI
app = QuestionnaireApp(SAMPLE_QUESTIONS)
json_data, context_str = app.run()

llm = initialize_llm()
therapists = load_therapists()

therapist_str = "\n".join(
    [f"Name: {t['Name']}, Specialization: {t['Specialization']}, Experience: {t['Experience']} years\nContact: {t['Contact']}\nApproach: {t['Approach']}"
     for t in therapists]
)

initial_message_response = llm.invoke(f"""
1. Generate a welcoming message based on the assessment.
2. Analyze user's responses to identify mental health needs.
3. Recommend a suitable therapist based on specialization match and experience.
4. Provide contact information.

Context:
{context_str}

Available Therapists:
{therapist_str}
""")

initial_message = initial_message_response.content

vector_db = create_or_load_vector_db()
qa_chain = setup_qa_chain(vector_db, llm)

# Define chatbot logic after Gradio loads
def chatbot(user_input, chat_history):
    if not chat_history:
        chat_history.append(("AntarVaani", initial_message))

    response = qa_chain.run(user_input)
    
    chat_history.append(("User", user_input))
    chat_history.append(("AntarVaani", response))
    
    return chat_history

# Load Gradio UI AFTER assessment and data preparation are complete
with gr.Blocks() as demo:
    gr.Markdown("# 🤖 AntarVaani - Let your inner voice be heard...")
    
    chatbot_ui = gr.Chatbot(label="AntarVaani Chat")
    
    msg_input = gr.Textbox(label="Your Message:")
    
    send_btn = gr.Button("Send")
    clear_btn = gr.Button("Clear Chat")

    send_btn.click(chatbot, inputs=[msg_input, chatbot_ui], outputs=chatbot_ui)
    
    clear_btn.click(lambda: [("AntarVaani", initial_message)], outputs=chatbot_ui)

demo.launch()
