import requests
from bs4 import BeautifulSoup
import pandas as pd
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.tag import pos_tag
from nltk.chunk import ne_chunk
from deep_translator import GoogleTranslator
import os

# Descargar recursos necesarios de nltk
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('maxent_ne_chunker')
nltk.download('words')
nltk.download('stopwords')

# Base URL de O*NET
base_url = "https://www.onetonline.org"
translator = GoogleTranslator(source='en', target='es')

def get_clusters():
    """Obtener los clusters de carreras disponibles."""
    url = f"{base_url}/find/family"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    job_families_select = soup.find('select', id='f')
    if job_families_select:
        options = job_families_select.find_all('option')
        # Asegurarse de excluir la opción 'All Job Families'
        return [(opt.text.strip(), f"{base_url}/find/family?f={opt['value']}") for opt in options if opt['value'] != '0']
    return []

def get_occupations(cluster_url):
    """Obtener las ocupaciones dentro de un cluster específico."""
    response = requests.get(cluster_url)
    soup = BeautifulSoup(response.text, 'html.parser')
    occupations = soup.find_all('a', href=True, string=True)
    return [(occ.text, f"{base_url}{occ['href']}") if not occ['href'].startswith(base_url) else (occ.text, occ['href']) for occ in occupations if "/link/summary/" in occ['href']]

def get_tasks(occupation_url):
    """Extraer tareas de una ocupación específica."""
    response = requests.get(occupation_url)
    soup = BeautifulSoup(response.text, 'html.parser')
    tasks = []
    tasks_section = soup.find('div', id='Tasks')  # Basado en el class 'section' y id 'tasks'
    
    if tasks_section:
        items = tasks_section.find_all('li')  # Buscando elementos <li> dentro de la sección
        for item in items:
            task_description = item.text.strip()
            tasks.append(task_description)
    else:
        print(f"No tasks section found for URL: {occupation_url}")
    return tasks

def get_processed_clusters(csv_file):
    """Obtener una lista de clusters ya procesados desde el archivo CSV."""
    if not os.path.exists(csv_file):
        return []
    
    df = pd.read_csv(csv_file)
    return df['Cluster'].unique().tolist()

def main():
    clusters = get_clusters()
    csv_file = 'onet_tasks_data.csv'
    
    # Si el archivo CSV no existe, crearlo con los encabezados
    if not os.path.exists(csv_file):
        with open(csv_file, 'w') as f:
            f.write('Cluster,Occupation,Task Description (ES)\n')
    
    processed_clusters = get_processed_clusters(csv_file)
    print(f"Processed clusters: {processed_clusters}")
    
    for name, url in clusters:
        translated_name = translator.translate(name)
        if translated_name in processed_clusters:
            print(f"Skipping already processed cluster: {name}")
            continue

        print(f"Processing cluster: {name}")
        data = []
        occupations = get_occupations(url)
        for occ_name, occ_url in occupations:
            print(f"Processing occupation: {occ_name}")
            tasks = get_tasks(occ_url)
            if not tasks:
                print(f"No tasks found for occupation: {occ_name}")
            for task_description in tasks:
                data.append({
                    'Cluster': translated_name,
                    'Occupation': translator.translate(occ_name),
                    'Task Description (ES)': translator.translate(task_description)
                })
        
        # Guardar los datos del cluster actual en el archivo CSV
        if data:
            df = pd.DataFrame(data)
            df.to_csv(csv_file, mode='a', header=False, index=False)
            print(f"Data for cluster '{name}' saved to {csv_file}")

if __name__ == "__main__":
    main()
