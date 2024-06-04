# problem_definition.py
import numpy as np
import random
from deap import creator, base

# Define el tipo de aptitud y el tipo de individuo
creator.create("FitnessMax", base.Fitness, weights=(1.0,-1.0))
creator.create("Individual", list, fitness=creator.FitnessMax)

def evaluate_individual(individual, beneficios, costes_recursos, costes_tareas, fatigas, dependencias):
    # Sumar los beneficios de las subtareas asignadas
    total_beneficio = sum(beneficios.get(subtask, 0) for subtask, recurso in individual if recurso is not None)
    
    # Sumar los costos de los recursos asignados
    total_costo_recursos = sum(costes_recursos.get(recurso, 0) for _, recurso in individual if recurso is not None)
    
    # Sumar los costos de las tareas asignadas
    total_costo_tareas = sum(costes_tareas.get(subtask, 0) for subtask, _ in individual if subtask in costes_tareas)
    
    # Sumar la fatiga de los recursos asignados
    total_fatiga = sum(fatigas.get(recurso, 0) for _, recurso in individual if recurso is not None)

    # Pesos para cada componente
    peso_fatiga = 0.4
    peso_costo_recursos = 0.2
    peso_costo_tareas = 0.2
    peso_beneficio = 0.8
    
    # Calcula el puntaje de aptitud: Recompensa beneficios y penaliza costos y fatiga
    puntaje_aptitud = (peso_beneficio * total_beneficio) - (peso_fatiga * total_fatiga + peso_costo_recursos * total_costo_recursos + peso_costo_tareas * total_costo_tareas)
    
    # Chequea dependencias y penaliza severamente si no se cumplen
    subtask_asignadas = [subtask for subtask, _ in individual]
    for subtask_dependiente, subtask_predecesora in dependencias.items():
        if subtask_dependiente in subtask_asignadas and subtask_predecesora not in subtask_asignadas:
            return 0,  # Penalización máxima si no se cumplen dependencias
    

    return puntaje_aptitud,

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
            # Buscar un humano disponible en toda la lista de habilidades
            for h in skills_matching[subtask]:
                if fatigas[h] < 100 and h not in humanos_asignados:
                    humano_asignado = h
                    humanos_asignados.add(humano_asignado)
                    individuo.append((subtask, humano_asignado))
                    break
            else:
                individuo.append((subtask, None))
    
    return creator.Individual(individuo)

def crossover_operator(individual1, individual2, fatigas):
    size = min(len(individual1), len(individual2))
    cxpoint = random.randint(1, size - 1)
    individual1[cxpoint:], individual2[cxpoint:] = individual2[cxpoint:], individual1[cxpoint:]

    for individual in (individual1, individual2):
        humanos_asignados = set()
        for i, (subtask, humano) in enumerate(individual):
            if humano in humanos_asignados:
                individual[i] = (subtask, None)
            elif humano is not None:
                humanos_asignados.add(humano)
                
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
    else:
        for humano in subtasks[subtask_a_mutar]:
            if humano not in [h for _, h in individual] and fatigas[humano] < 100:
                nuevo_individual[i] = (subtask, humano)
                break

    humanos_asignados = set()
    for i, (subtask, humano) in enumerate(nuevo_individual):
        if humano in humanos_asignados:
            nuevo_individual[i] = (subtask, None)
        elif humano is not None:
            humanos_asignados.add(humano)

    return creator.Individual(nuevo_individual)
