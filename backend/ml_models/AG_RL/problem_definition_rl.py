# problem_definition.py
import numpy as np
import random
from deap import creator, base



def evaluate_individual(individual, beneficios, costes_humanos, costes_tareas, fatigas, dependencias):
    total_costo_humanos = sum(costes_humanos[humano] for _, humano in individual if humano is not None)
    total_costo_tareas = sum(costes_tareas[subtask] for subtask, _ in individual if subtask in costes_tareas)
    total_fatiga = sum(fatigas[humano] for _, humano in individual if humano is not None)
    total_beneficio = sum(beneficios[subtask] for subtask, humano in individual if humano is not None)

    # Pesos para función de aptitud
    peso_fatiga = 0.5
    peso_costo_humanos = 0.2
    peso_costo_tareas = 0.2
    peso_beneficio = 0.3
    
    # Puntaje de aptitud
    puntaje_aptitud = -peso_fatiga * total_fatiga -peso_costo_humanos * total_costo_humanos -peso_costo_tareas * total_costo_tareas + peso_beneficio * total_beneficio
    
    # Lista de subtasks asignadas en el individuo
    subtask_asignadas = [subtask for subtask, _ in individual]

    # Verificar cumplimiento de dependencias
    for subtask_dependiente, subtask_predecesora in dependencias.items():
        if subtask_dependiente in subtask_asignadas and subtask_predecesora not in subtask_asignadas:
            puntaje_aptitud = -np.Infinity
    return puntaje_aptitud

def initialize_population(skills_matching, num_individuals, dependencias, fatigas):
    population = []
    for _ in range(num_individuals):
        individuo = crear_individuo(skills_matching, dependencias, fatigas)
        population.append(individuo)
    return population

def crear_individuo(skills_matching, dependencias, fatigas):
    individuo = []
    humanos_asignados = set()
    
    subtasks_priorizadas = sorted(skills_matching.keys(), key=lambda x: (x in dependencias, dependencias.get(x, '')))
    for subtask in subtasks_priorizadas:
        posibles_humanos = {h for h in skills_matching[subtask] if fatigas[h] < 100} - humanos_asignados        
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
    individual1[cxpoint:], individual2[cxpoint:] = individual2[cxpoint:], individual1[cxpoint:]

    for individual in (individual1, individual2):
        for i, (subtask, humano) in enumerate(individual):
            if humano is not None and fatigas[humano] >= 100:
                individual[i] = (subtask, None)

    return individual1, individual2

def mutation_operator(individual, subtasks, dependencias, fatigas):
    nuevo_individual = list(individual)
    subtask_a_mutar = random.choice(list(subtasks.keys()))
    humanos_posibles = {h for h in subtasks[subtask_a_mutar] if h not in [humano for _, humano in individual] and fatigas[h] < 100}

    if any(dependencia for dependencia, valor in dependencias.items() if valor == subtask_a_mutar and dependencia not in [subtask for subtask, _ in individual]):
        return creator.Individual(nuevo_individual)

    if humanos_posibles:
        nuevo_humano = random.choice(list(humanos_posibles))
        for i, (subtask, humano) in enumerate(nuevo_individual):
            if subtask == subtask_a_mutar:
                nuevo_individual[i] = (subtask, nuevo_humano)
                break
    return creator.Individual(nuevo_individual)
