# genetic_algorithm.py
"""
Implementación del algoritmo genético utilizando la librería DEAP.
Define la configuración del algoritmo, la función de aptitud, los operadores genéticos, etc.
"""
from deap import base, creator, tools, algorithms
import problem_definition

def evaluate_population(population):
    """
    Evalúa la aptitud de toda la población.

    Args:
    - population (list): Lista de individuos en la población.

    Returns:
    - aptitudes (list): Lista de aptitudes correspondientes a cada individuo en la población.
    """
    return [problem_definition.evaluate_individual(individual) for individual in population]

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


def run_genetic_algorithm(tareas, num_generations, num_individuals):
    # Inicializar la población
    population = problem_definition.initialize_population(tareas, num_individuals)
    
    # Evaluar la población inicial
    evaluate_population(population)
    
    # Ciclo de evolución
    for generation in range(num_generations):
        # Seleccionar individuos para reproducción
        selected = selection_operator(population)
        
        # Aplicar operadores genéticos (cruce y mutación)
        offspring = []
        for i in range(0, len(selected), 2):
            child1, child2 = problem_definition.crossover_operator(selected[i], selected[i+1])
            child1 = problem_definition.mutation_operator(child1, tareas)
            child2 = problem_definition.mutation_operator(child2, tareas)
            offspring.extend([child1, child2])
        
        # Evaluar la descendencia
        evaluate_population(offspring)
        
        # Reemplazar la población anterior con la descendencia
        population[:] = offspring
    
    # Devolver el mejor individuo de la población final
    best_individual = max(population, key=lambda ind: ind.fitness.values)
    return best_individual
