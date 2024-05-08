import requests
from bs4 import BeautifulSoup
import pandas as pd

# Base URL de O*NET
base_url = "https://www.onetonline.org"

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


def get_skills(occupation_url):
    """Extraer conocimientos técnicos de una ocupación específica."""
    response = requests.get(occupation_url)
    soup = BeautifulSoup(response.text, 'html.parser')    
    knowledge = []
    knowledge_section = soup.find('div', id='Knowledge')  # Basado en el ID 'Knowledge'
    if knowledge_section:
        items = knowledge_section.find_all('li')  # Buscando elementos <li> dentro de la sección
        for item in items:
            knowledge.append(item.text.strip())
    return knowledge

def main():
    clusters = get_clusters()
    data = []
    for name, url in clusters:
        print(f"Processing cluster: {name}")
        occupations = get_occupations(url)
        for occ_name, occ_url in occupations:
            skills = get_skills(occ_url)
            data.append({
                'Cluster': name,
                'Occupation': occ_name,
                'Skills': skills
            })
    df = pd.DataFrame(data)
    df.to_csv('onet_skills_data.csv', index=False)
    print("Data extraction complete and saved to onet_skills_data.csv")

if __name__ == "__main__":
    main()
