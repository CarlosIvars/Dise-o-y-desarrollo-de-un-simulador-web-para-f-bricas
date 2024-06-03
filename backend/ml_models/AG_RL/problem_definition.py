# problem_definition.py
"""
Define la representación del problema específico a resolver.
Incluye la codificación de los individuos, la función de aptitud y posibles restricciones.

    Definir la función de aptitud (evaluate_individual): Implementa la función evaluate_individual para evaluar la aptitud de cada individuo en función de tu problema específico. Esta función debe calcular un valor numérico que represente qué tan buena es una solución en términos del objetivo que estás tratando de optimizar.

    Inicializar la población (initialize_population): Implementa la función initialize_population para generar una población inicial de individuos. Esta función podría generar individuos aleatorios utilizando la función crear_individuo que mencionamos anteriormente, o podrías tener alguna otra estrategia de inicialización específica para tu problema.

    Definir operadores genéticos: Los operadores genéticos son necesarios para manipular la población y generar nuevas soluciones en cada generación. Esto incluye operadores de selección (por ejemplo, selección de torneo), operadores de cruce (por ejemplo, cruce de un punto o cruce uniforme), y operadores de mutación (por ejemplo, mutación de cambio subtask o mutación de intercambio). Puedes definir estos operadores en tu archivo genetic_algorithm.py o directamente en problem_definition.py.

    Configurar el algoritmo genético: Configura los parámetros del algoritmo genético, como el tamaño de la población, el número máximo de generaciones, las probabilidades de cruce y mutación, etc. Esto puede hacerse en un archivo separado llamado genetic_algorithm.py.

    Implementar el bucle de evolución: Finalmente, implementa el bucle de evolución que iterará sobre las generaciones y aplicará los operadores genéticos para evolucionar la población hacia soluciones mejores. Este bucle generalmente se encuentra en el archivo principal de tu aplicación, que podría ser main.py o genetic_algorithm.py.
"""
import numpy as np
import random
from deap import creator, base


# Define el tipo de aptitud y el tipo de individuo
creator.create("FitnessMax", base.Fitness, weights=(1.0,))  # Queremos maximizar la función de aptitud
creator.create("Individual", list, fitness=creator.FitnessMax)

def evaluate_individual(individual, beneficios, costes_recursos, costes_tareas, fatigas, dependencias):
    total_costo_recursos = sum(costes_recursos[recurso] for _, recurso in individual if recurso is not None)
    total_costo_tareas = sum(costes_tareas[subtask] for subtask, _ in individual if subtask in costes_tareas)
    total_fatiga = sum(fatigas[recurso] for _, recurso in individual if recurso is not None)
    total_beneficio = sum(beneficios[subtask] for subtask, recurso in individual if recurso is not None)

    # Pesos para función de aptitud
    peso_fatiga = 0.5
    peso_costo_recursos = 0.2
    peso_costo_tareas = 0.2
    peso_beneficio = 0.3
    
    # Puntaje de aptitud
    puntaje_aptitud = -peso_fatiga * total_fatiga -peso_costo_recursos * total_costo_recursos -peso_costo_tareas * total_costo_tareas + peso_beneficio * total_beneficio
    
    # Lista de subtasks asignadas en el individuo
    subtask_asignadas = [subtask for subtask, _ in individual]

    # Verificar cumplimiento de dependencias
    for subtask_dependiente, subtask_predecesora in dependencias.items():
        if subtask_dependiente in subtask_asignadas and subtask_predecesora not in subtask_asignadas:
            puntaje_aptitud = -np.Infinity
    return puntaje_aptitud


def initialize_population(skills_matching, num_individuals, dependencias, fatigas):
    # Inicializa la población creando num_individuals individuos
    population = []
    for _ in range(num_individuals):
        individuo = crear_individuo(skills_matching, dependencias, fatigas)
        population.append(individuo)
    return population

def crear_individuo(skills_matching, dependencias, fatigas):
    # Creación de un individuo cumpliendo con las dependencias exigidas
    individuo = []
    humanos_asignados = set()
    
    # Priorizar subtasks sin dependencias y luego por su orden de dependencia
    subtasks_priorizadas = sorted(skills_matching.keys(), key=lambda x: (x in dependencias, dependencias.get(x, '')))
    for subtask in subtasks_priorizadas:
        # Humanos aún no asignados
        posibles_humanos = {h for h in skills_matching[subtask] if fatigas[h] < 100} - humanos_asignados        
        # print(f"Subtask: {subtask}, Posibles Humanos (fatiga < 100): {posibles_humanos}")  # Logueo para depuración
        if posibles_humanos:
            humano_asignado = random.choice(list(posibles_humanos))
            humanos_asignados.add(humano_asignado)
            individuo.append((subtask, humano_asignado))
        else:
            individuo.append((subtask, None))
    
    return creator.Individual(individuo)

def crossover_operator(individual1, individual2, fatigas):
    size = min(len(individual1), len(individual2))
    cxpoint = random.randint(1, size - 1)
    # Realiza el cruce
    individual1[cxpoint:], individual2[cxpoint:] = individual2[cxpoint:], individual1[cxpoint:]

    # Verifica y corrige fatiga
    for individual in (individual1, individual2):
        for i, (subtask, humano) in enumerate(individual):
            if humano is not None and fatigas[humano] >= 100:
                individual[i] = (subtask, None)  # Asigna None o busca una alternativa válida

    return individual1, individual2

def mutation_operator(individual, subtasks, dependencias, fatigas):
    """
    Aplica una mutación simple a un individuo.

    Args:
    - individual (list): El individuo a mutar.
    - subtasks (dict): Diccionario que contiene las subtasks y los posibles humanos que pueden realizarlas.
    
    Returns:
    - individual (list): El individuo mutado.
    """
    # Escoge una posición aleatoria en el individuo
    nuevo_individual = list(individual)
    subtask_a_mutar = random.choice(list(subtasks.keys()))
    humanos_posibles = {h for h in subtasks[subtask_a_mutar] if h not in [humano for _, humano in individual] and fatigas[h] < 100}

    # Verificar que las dependencias de la subtask a mutar sean respetadas
    if any(dependencia for dependencia, valor in dependencias.items() if valor == subtask_a_mutar and dependencia not in [subtask for subtask, _ in individual]):
        return creator.Individual(nuevo_individual)  # No realizar la mutación si se violarían las dependencias

    if humanos_posibles:
        nuevo_humano = random.choice(list(humanos_posibles))
        for i, (subtask, humano) in enumerate(nuevo_individual):
            if subtask == subtask_a_mutar:
                nuevo_individual[i] = (subtask, nuevo_humano)
                break
    else:
        pass  # Si no hay humanos disponibles, considera no hacer la mutación o asignar None

    return creator.Individual(nuevo_individual)