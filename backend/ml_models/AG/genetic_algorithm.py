"""
Implementación del algoritmo genético utilizando la librería DEAP.
"""
from .problem_definition import *

def evaluate_population(population, beneficios, costes, fatigas, dependencias):
    """
    Evalúa la aptitud de toda la población(lista de individuos) devuelve una lista con la aptitud de cada individuo
    """
    return [evaluate_individual(individual,beneficios, costes, fatigas, dependencias) for individual in population]

def selection_operator(population, aptitudes, k):
    """
    Implementa el operador de selección para seleccionar individuos para la siguiente generación.

    Args:
    - population (list): Lista de individuos en la población.
    - aptitudes (list): Lista de aptitudes correspondientes a cada individuo en la población.
    - k (int): Número de individuos a seleccionar.

    Returns:
    - selected (list): Lista de individuos seleccionados.
    """
    selected_indices = sorted(range(len(aptitudes)), key=lambda i: aptitudes[i], reverse=True)[:k]
    return [population[i] for i in selected_indices]


def run_genetic_algorithm(skills_matching,dependencias, num_generations, num_individuals,k,beneficios, costes, fatigas):
    # Inicializar la población
    population = initialize_population(skills_matching, num_individuals,dependencias,fatigas)

    # Evaluar la población inicial
    aptitudes = evaluate_population(population, beneficios, costes, fatigas, dependencias)
    
    # Ciclo de evolución
    for generation in range(num_generations):
        # Seleccionar individuos para reproducción
        selected = selection_operator(population, aptitudes, k)
        
        # Aplicar operadores genéticos (cruce y mutación)
        offspring = []
        for i in range(0, len(selected), 2):
            child1, child2 = crossover_operator(selected[i], selected[i+1], fatigas)
            child1 = mutation_operator(child1, skills_matching,dependencias,fatigas)
            child2 = mutation_operator(child2, skills_matching,dependencias,fatigas)
            offspring.extend([child1, child2])
        
        population[:] = offspring

        # Evaluar la nueva población
        aptitudes = evaluate_population(population, beneficios, costes, fatigas, dependencias)
        
    # Devolver el mejor individuo de la población final
    best_individual = max(population, key=lambda ind: ind.fitness.values)
    return best_individual
