from celery import shared_task
import pandas as pd

from .handle_excel import handle_excel
from .handle_Other_Files import handlePDF, handleTXT, handleDOC

@shared_task
def process_uploaded_file(chatbot_id, docname, file_path, file_extension):
    try:
        print("going to process file")
        with open(file_path, "rb") as f:
            if file_extension in [".xls", ".xlsx", ".csv"]:
                if file_extension == ".csv":
                    df = pd.read_csv(f)
                else:
                    df = pd.read_excel(f)
                handle_excel(df, chatbot_id, docname)

            elif file_extension == ".pdf":
                handlePDF(chatbot_id, docname, f)

            elif file_extension == ".docx":
                handleDOC(chatbot_id, docname, f)

            elif file_extension == ".txt":
                handleTXT(chatbot_id, docname, f)

            else:
                # Optional: log unsupported format
                print(f"Unsupported format: {file_extension}")
        print(("finished processing file"))

    except Exception as e:
        print(f"Error in background task: {e}")
