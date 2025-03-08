#final
import csv
from langchain_groq import ChatGroq
from langchain.embeddings import HuggingFaceBgeEmbeddings
from langchain.document_loaders import PyPDFLoader, DirectoryLoader
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os

# Initialize LLM with enhanced context
def initialize_llm():
  llm = ChatGroq(
    temperature = 0,
    groq_api_key = "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",
    model_name = "llama-3.3-70b-versatile"
  )
  return llm



def create_vector_db():
  loader = DirectoryLoader("C:/Users/Shamit/OneDrive/Desktop/React/genexus/mind_ease/Python/Data", glob = '*.pdf', loader_cls = PyPDFLoader) #give the FOLDER PATH of the dataset(mental health document){not the direct path}
  documents = loader.load()
  text_splitter = RecursiveCharacterTextSplitter(chunk_size = 500, chunk_overlap = 50)
  texts = text_splitter.split_documents(documents)
  embeddings = HuggingFaceBgeEmbeddings(model_name = 'sentence-transformers/all-MiniLM-L6-v2')
  vector_db = Chroma.from_documents(texts, embeddings, persist_directory = './chroma_db')
  vector_db.persist()

  return vector_db

def setup_qa_chain(vector_db, llm):
  retriever = vector_db.as_retriever()
  prompt_templates = """ I’m here to support you, and I can do that best when you share what’s on your mind.
  Sometimes, talking about our feelings can be the first step toward finding peace.
  Whenever you’re ready, I’m here to listen, and I can also help connect you with professional resources if that feels right.:
    {context}
    User: {question}
    AntarVaani: """
  PROMPT = PromptTemplate(template = prompt_templates, input_variables = ['context', 'question'])

  qa_chain = RetrievalQA.from_chain_type(
      llm = llm,
      chain_type = "stuff",
      retriever = retriever,
      chain_type_kwargs = {"prompt": PROMPT}
  )
  return qa_chain


def main():
  print("......... Intializing AntarVaani .........")
  llm = initialize_llm()
  #till now llm not studied dataset

  # Read assessment context
  assessment_context = []
  with open('C:/Users/Shamit/OneDrive/Desktop/React/genexus/mind_ease/Python/quiz_answers (2).csv') as file:  #direct file path of the Ease Assessment(by the user) csv file
      reader = csv.DictReader(file)
      assessment_context = [{"question": row['Question'], "answer": row['Answer']} for row in reader]

  # Read therapist profiles
  therapists = []
  with open('C:/Users/Shamit/OneDrive/Desktop/React/genexus/mind_ease/Python/updated_mental_health_professionals.csv') as file: #direct file path for the doctor resume CSV
      reader = csv.DictReader(file)
      therapists = [dict(row) for row in reader]

  # Format combined context
  context_str = "### User Assessment:\n" + "\n".join(
      [f"Q: {qa['question']}\nA: {qa['answer']}" for qa in assessment_context]
  )

  therapist_str = "\n### Available Therapists:\n" + "\n".join(
      [f"Name: {t['Name']}\nSpecialization: {t['Specialization']}\nExperience: {t['Experience']} years\nContact: {t['Contact']}\nApproach: {t['Approach']}"
      for t in therapists]
  )
  response = llm.invoke(f"""
        1. Generate a welcoming message based on the assessment
        2. Analyze the user's responses to identify key mental health needs
        3. Recommend the most suitable therapist from the list below, considering:
          - Specialization match with identified needs
          - Treatment approach compatibility
          - Experience level
        4. Provide contact information and specific reasons for recommendation

      Context:
      {context_str}
      {therapist_str}
      """)
  print(response.content)

  db_path = "mind_ease/Python/chroma_db" #do not change this or create

  if not os.path.exists(db_path):
    vector_db  = create_vector_db()
  else:
    embeddings = HuggingFaceBgeEmbeddings(model_name = 'sentence-transformers/all-MiniLM-L6-v2')
    vector_db = Chroma(persist_directory=db_path, embedding_function=embeddings)
  qa_chain = setup_qa_chain(vector_db, llm)

  while True:
    query = input("\nUser: ")
    if query.lower()  == "exit":
      print("AntarVaani: I’m here to listen whenever you’re ready to share. Expressing your thoughts can be the first step toward clarity and healing. Take your time, and when you’re comfortable, I’m here to help.")
      break
    response = qa_chain.run(query)
    print(f"AntarVaani: {response}")

    

if __name__ == "__main__":
  main()
  