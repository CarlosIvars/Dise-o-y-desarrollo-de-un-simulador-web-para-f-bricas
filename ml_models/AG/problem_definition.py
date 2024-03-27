# problem_definition.py
"""
Define la representación del problema específico a resolver.
Incluye la codificación de los individuos, la función de aptitud y posibles restricciones.

    Definir la función de aptitud (evaluate_individual): Implementa la función evaluate_individual para evaluar la aptitud de cada individuo en función de tu problema específico. Esta función debe calcular un valor numérico que represente qué tan buena es una solución en términos del objetivo que estás tratando de optimizar.

    Inicializar la población (initialize_population): Implementa la función initialize_population para generar una población inicial de individuos. Esta función podría generar individuos aleatorios utilizando la función crear_individuo que mencionamos anteriormente, o podrías tener alguna otra estrategia de inicialización específica para tu problema.

    Definir operadores genéticos: Los operadores genéticos son necesarios para manipular la población y generar nuevas soluciones en cada generación. Esto incluye operadores de selección (por ejemplo, selección de torneo), operadores de cruce (por ejemplo, cruce de un punto o cruce uniforme), y operadores de mutación (por ejemplo, mutación de cambio de tarea o mutación de intercambio). Puedes definir estos operadores en tu archivo genetic_algorithm.py o directamente en problem_definition.py.

    Configurar el algoritmo genético: Configura los parámetros del algoritmo genético, como el tamaño de la población, el número máximo de generaciones, las probabilidades de cruce y mutación, etc. Esto puede hacerse en un archivo separado llamado genetic_algorithm.py.

    Implementar el bucle de evolución: Finalmente, implementa el bucle de evolución que iterará sobre las generaciones y aplicará los operadores genéticos para evolucionar la población hacia soluciones mejores. Este bucle generalmente se encuentra en el archivo principal de tu aplicación, que podría ser main.py o genetic_algorithm.py.
"""

import random
from ...app import models
from deap import creator, base

# Define el tipo de aptitud y el tipo de individuo
creator.create("FitnessMin", base.Fitness, weights=(-1.0,))  # Queremos minimizar la función de aptitud
creator.create("Individual", list, fitness=creator.FitnessMin)

def evaluate_individual(individual):
    total_fatiga = models.RecursosModel.calcular_fatiga_total(individual)
    total_costo = models.RecursosModel.calcular_coste_total(individual)
    total_beneficio = models.TareaModel.calcular_beneficio_total(individual)

    # Puntaje de aptitud: combinación lineal de las tres métricas
    puntaje_aptitud = peso_fatiga * total_fatiga + peso_costo * total_costo + peso_beneficio * total_beneficio

    return puntaje_aptitud
def initialize_population(tareas, num_individuals):
    """
    Inicializa la población de individuos.

    Args:
    - tareas (dict): Diccionario que contiene las tareas y los posibles humanos que pueden realizarlas.
    - num_individuals (int): Número de individuos que se generarán en la población.

    Returns:
    - population (list): Lista de individuos generada aleatoriamente.
    """
    population = []
    for _ in range(num_individuals):
        individuo = crear_individuo(tareas)
        population.append(individuo)
    return population

def crear_individuo(tareas):
    # Crea un individuo aleatorio a partir del diccionario de tareas
    individuo = []
    for tarea, posibles_humanos in tareas.items():
        humano_asignado = random.choice(posibles_humanos)
        individuo.append((tarea, humano_asignado))
    return creator.Individual(individuo)
