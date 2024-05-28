from faker import Faker
import json
import pandas as pd
from random import *
from app.models import * 
import random as rnd
fake = Faker('es_ES')

def select_random_skills(skills,n ):
    return fake.random_elements(elements=skills, length=n, unique=True)

def generate_trabajadores(num,sector,fabrica_id):
    print("generamos trabajadores")
    soft_skills = [skill[1] for skill in TareaModel.get_soft_skills()]
    skills =[skill[1] for skill in TareaModel.get_hard_skills(sector)] 
    for _ in range(num):
        selected_hard_skills = select_random_skills(skills, fake.random_int(min=1, max=5))
        selected_soft_skills = select_random_skills(soft_skills, fake.random_int(min=1, max=5))
        combined_skills = selected_hard_skills + selected_soft_skills
        trabajador = {
            'nombre': fake.first_name(),
            'apellidos': fake.last_name(),
            'fecha_nacimiento': fake.date_of_birth(minimum_age=18, maximum_age=65),
            'fatiga': fake.random_int(min=0, max=100),
            'coste_h': fake.random_number(digits=2),
            'preferencias': 0,
            'skills': combined_skills
        }
        RecursosModel.add_trabajador(fabrica_id, trabajador['nombre'], trabajador['apellidos'],
                                     trabajador['fecha_nacimiento'], trabajador['fatiga'], trabajador['coste_h'],
                                     trabajador['preferencias'], trabajador['skills'])

def generate_maquinas(num, sector, fabrica_id):
    print("generamos máquinas")
    skills =[skill[1] for skill in TareaModel.get_hard_skills(sector)] 
    for _ in range(num):
        selected_hard_skills = select_random_skills(skills, fake.random_int(min=1, max=5))
        maquina = {
            'nombre': fake.word(),
            'fatiga': fake.random_int(min=0, max=100),
            'coste_h': fake.random_number(digits=2),
            'skills': selected_hard_skills
        }
        RecursosModel.add_maquina(fabrica_id, maquina['nombre'], maquina['fatiga'], maquina['coste_h'], maquina['skills'])

def generate_subtasks(num, sector, fabrica_id):
    csv_path = './onet/onet_tasks_data.csv'
    df = pd.read_csv(csv_path)
    tasks = df[df['Cluster'] == sector]
    existing_subtasks = [subtask[0] for subtask in TareaModel.get_subtasks(fabrica_id)]
    for _ in range(num):
        try:
            task_selec = tasks.sample(n = 1).iloc[0]
            subtask = {
                'nombre': task_selec['Task Name'],
                'duracion': fake.random_number(digits=2),
                'beneficio': fake.random_number(digits=3, fix_len=True),
                'coste': fake.random_number(digits=2, fix_len=True),
                'descripcion': task_selec['Task Description'],
                
            }
            t =TareaModel.add_subtask(subtask['nombre'], subtask['duracion'], subtask['beneficio'], subtask['coste'], 
                                subtask['descripcion'], fabrica_id, sector)
            if existing_subtasks and rnd.choices([True, False], weights=[60, 40])[0]: 
                parent_subtask_id = rnd.choice(existing_subtasks)
                TareaModel.add_dependencias_subtasks(t[0], parent_subtask_id)
            
            # Add the new subtask to the existing subtasks list for future dependencies
            existing_subtasks.append(t[0])
        except Exception as e:
            print('Error pero seguimos', e)

def generate_factories(num):
    factories = []
    sectores = FabricaModel.get_sectores()
    for _ in range(num):
        factory = {
            'nombre_fabrica': fake.company(),
            'capital_inicial': fake.random_number(digits=7),
            'sector': fake.random_int(min=0, max = 26)
        }
        user_id = 14  # Ajusta el rango de usuarios existentes
        fabrica = FabricaModel.add_fabrica(factory['nombre_fabrica'], user_id, factory['capital_inicial'], sectores[factory['sector']])
        print("Generamos Fabricas")
        try:
            generate_trabajadores(20, fabrica[7], fabrica[0])
            generate_maquinas(20, fabrica[7], fabrica[0])
            generate_subtasks(20, fabrica[7], fabrica[0])
            #generate_subtasks(300)
        except Exception as ex:
            return {'error': f'Error al generar datos de la fabrica'}
    return factories

def generate_data():
    try:
        print("Generamos datos")
        generate_factories(20)
        return {'mensaje': 'Datos generados y añadidos correctamente'}
    except Exception as ex:
        return {'error': f'Error al generar datos ficticios: {ex}'}