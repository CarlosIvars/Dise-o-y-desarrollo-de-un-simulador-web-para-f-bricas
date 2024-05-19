from faker import Faker
import json
from random import sample
from app.models import * 

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
            'preferencias': None,
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

def generate_subtasks(num):
    for _ in range(num):
        subtask = {
            'nombre': fake.sentence(nb_words=3),
            'duracion': fake.random_number(digits=2),
            'beneficio': fake.random_number(digits=5),
            'coste': fake.random_number(digits=4),
            'descripcion': fake.sentence()
        }
        fabrica_id = fake.random_int(min=1, max=100)  # Ajusta el rango de fábricas existentes
        sector = fake.word()  # Puedes usar una lógica para asignar sectores adecuados
        TareaModel.add_subtask(subtask['nombre'], subtask['duracion'], subtask['beneficio'], subtask['coste'], 
                               subtask['descripcion'], fabrica_id, sector)

def generate_factories(num):
    factories = []
    sectores = FabricaModel.get_sectores()
    for _ in range(num):
        factory = {
            'nombre_fabrica': fake.company(),
            'capital_inicial': fake.random_number(digits=7),
            'sector': fake.random_int(min=0, max = 26)
        }
        user_id = 12  # Ajusta el rango de usuarios existentes
        fabrica = FabricaModel.add_fabrica(factory['nombre_fabrica'], user_id, factory['capital_inicial'], sectores[factory['sector']])
        print("Generamos Fabricas")
        try:
            generate_trabajadores(20, fabrica[7], fabrica[0])
            generate_maquinas(20, fabrica[7], fabrica[0])
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