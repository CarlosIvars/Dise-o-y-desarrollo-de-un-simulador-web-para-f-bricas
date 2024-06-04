import numpy as np
from .problem_definition import *
from collections import Counter
import math
def evaluate_population(population, beneficios, costes_humanos, costes_tareas, fatigas, dependencias):
    return [evaluate_individual(individual, beneficios, costes_humanos, costes_tareas, fatigas, dependencias) for individual in population]

def selection_operator(population, aptitudes, k):
    selected_indices = sorted(range(len(aptitudes)), key=lambda i: aptitudes[i], reverse=True)[:k]
    return [population[i] for i in selected_indices]

def calculate_genetic_diversity(population):
    if not population:
        return 0

    gene_frequencies = Counter()
    num_genes = len(population[0])
    population_size = len(population)

    # Contar la frecuencia de cada gen en cada posición
    for individual in population:
        for i, gene in enumerate(individual):
            gene_frequencies[(i, gene)] += 1

    entropy = 0.0

    # Calcular la entropía para cada posición de gen
    for i in range(num_genes):
        position_entropy = 0.0
        genes_at_position = [gene for (pos, gene), count in gene_frequencies.items() if pos == i]
        total_genes_at_position = sum(gene_frequencies[(i, gene)] for gene in genes_at_position)

        for gene in genes_at_position:
            frequency = gene_frequencies[(i, gene)] / total_genes_at_position
            if frequency > 0:
                position_entropy -= frequency * math.log(frequency)

        entropy += position_entropy

    # Normalizar la entropía por el número de posiciones de genes
    entropy /= num_genes
    return entropy

def run_genetic_algorithm(skills_matching, dependencias, num_generations, num_individuals, k, beneficios, costes_humanos, costes_tareas, fatigas, crossover_rate=0.8, mutation_rate=0.2):
    population = initialize_population(skills_matching, num_individuals, dependencias, fatigas)
    aptitudes = evaluate_population(population, beneficios, costes_humanos, costes_tareas, fatigas, dependencias)

    best_fitnesses = []
    average_fitnesses = []
    genetic_diversity = []
    
    for generation in range(num_generations):
        selected = selection_operator(population, aptitudes, k)
        
        offspring = []
        for i in range(0, len(selected), 2):
            if i + 1 < len(selected):
                if random.random() < crossover_rate:
                    child1, child2 = crossover_operator(selected[i], selected[i+1], fatigas)
                else:
                    child1, child2 = selected[i], selected[i+1]
                
                if random.random() < mutation_rate:
                    child1 = mutation_operator(child1, skills_matching, dependencias, fatigas)
                if random.random() < mutation_rate:
                    child2 = mutation_operator(child2, skills_matching, dependencias, fatigas)
                
                offspring.extend([child1, child2])
        
        population[:] = offspring
        aptitudes = evaluate_population(population, beneficios, costes_humanos, costes_tareas, fatigas, dependencias)
        
        best_fitness = max(aptitudes)
        average_fitness = np.mean(aptitudes)
        diversity = calculate_genetic_diversity(population)
        
        best_fitnesses.append(best_fitness)
        average_fitnesses.append(average_fitness)
        genetic_diversity.append(diversity)
    
    best_individual = max(population, key=lambda ind: evaluate_individual(ind, beneficios, costes_humanos, costes_tareas, fatigas, dependencias))
    
    metrics = {
        "best_fitnesses": best_fitnesses,
        "average_fitnesses": average_fitnesses,
        "genetic_diversity": genetic_diversity
    }
    
    return best_individual, metrics
