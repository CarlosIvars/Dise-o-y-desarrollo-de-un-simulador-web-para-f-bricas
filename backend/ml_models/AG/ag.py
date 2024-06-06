import numpy as np
from deap import base, creator, tools
import random
import matplotlib.pyplot as plt
import math

def genetic_algorithm_assignment(humanos, tareas, N_POP=100, CXPB=0.5, MUTPB=0.2, NGEN=100):
    # Función de aptitud
    def calculate_fitness(individual):
        total_beneficio = 0
        total_coste = 0
        total_fatiga = 0
        humanos_asignados = set()
        penalizacion = 0
        
        peso_beneficio = 0.25
        peso_coste = 0.25   
        peso_fatiga = 0.5

        for tarea, humano in individual.items():
            if humano is not None and humanos[humano]['fatiga'] < 100:
                if humano in humanos_asignados:
                    penalizacion += 10000000000 
                    #penalizacion = np.inf  # Penalización por humano asignado a múltiples tareas, caso que no se puede dar
                else:
                    humanos_asignados.add(humano)
                    total_beneficio += tareas[tarea]['beneficio']
                    total_coste += tareas[tarea]['coste_inicio'] + (humanos[humano]['coste_hora'] * tareas[tarea]['duracion'])
                    total_fatiga += humanos[humano]['fatiga']
            
        fitness =  (total_beneficio * peso_beneficio - total_coste * peso_coste - total_fatiga * peso_fatiga) - penalizacion 
        return fitness,

    # Estructura del individuo y la población
    creator.create("FitnessMax", base.Fitness, weights=(1.0,))
    creator.create("Individual", dict, fitness=creator.FitnessMax)

    toolbox = base.Toolbox()

    def create_individual():
        individual = {tarea: None for tarea in tareas.keys()}
        available_humanos = list(humanos.keys())
        random.shuffle(available_humanos)
        
        for tarea in tareas.keys():
            possible_humanos = [humano for humano in available_humanos if humano in tareas[tarea]['skills_matching']]
            if possible_humanos:
                selected_humano = random.choice(possible_humanos)
                individual[tarea] = selected_humano
                available_humanos.remove(selected_humano)
            else:
                individual[tarea] = None
        return individual

    # Operadores genéticos personalizados
    def cxDictTwoPoint(ind1, ind2):
        ind1_keys = list(ind1.keys())
        ind2_keys = list(ind2.keys())

        cxpoint1 = random.randint(1, len(ind1_keys) - 1)
        cxpoint2 = random.randint(1, len(ind1_keys) - 1)

        if cxpoint1 > cxpoint2:
            cxpoint1, cxpoint2 = cxpoint2, cxpoint1

        for key in ind1_keys[cxpoint1:cxpoint2]:
            ind1[key], ind2[key] = ind2[key], ind1[key]

        return ind1, ind2

    def mutIndividual(individual):
        tarea_to_mutate = random.choice(list(individual.keys()))
        current_humano = individual[tarea_to_mutate]
        
        possible_humanos = [humano for humano in humanos.keys() if humano in tareas[tarea_to_mutate]['skills_matching']]
        if current_humano in possible_humanos:
            possible_humanos.remove(current_humano)
        
        #Si no hay humanos que puedan realizar la tarea, entonces esta se queda ociosa
        if not possible_humanos:
            possible_humanos = [None]

        new_humano = random.choice(possible_humanos)
        
        while new_humano in individual.values() and new_humano is not None:
            new_humano = random.choice(possible_humanos)
        
        individual[tarea_to_mutate] = new_humano
        return individual,

    #Herramientas 
    toolbox.register("individual", tools.initIterate, creator.Individual, create_individual)
    toolbox.register("population", tools.initRepeat, list, toolbox.individual)
    toolbox.register("mate", cxDictTwoPoint)
    toolbox.register("mutate", mutIndividual)
    toolbox.register("select", tools.selTournament, tournsize=3)
    toolbox.register("evaluate", calculate_fitness)

    # Inicialización de la población
    pop = toolbox.population(N_POP)

    # Evaluación de los individuos
    fitnesses = list(map(toolbox.evaluate, pop))
    for ind, fit in zip(pop, fitnesses):
        ind.fitness.values = fit

    # Función para generar estadísticas de cada generación
    def build_stats(gen, pop, fits):
        record = {}
        length = len(pop)
        mean = sum(fits) / length
        sum2 = sum(x * x for x in fits)
        std = abs(sum2 / length - mean ** 2) ** 0.5

        record['gen'] = gen + 1
        record['min'] = min(fits)
        record['max'] = max(fits)
        record['avg'] = mean
        record['std'] = std

        print("  Min {}  Max {}  Avg {}  Std {}".format(min(fits), max(fits), mean, std))

        return record

    # Ciclo evolutivo
    print("-- GENERACIÓN 0 --")
    fits = [ind.fitness.values[0] for ind in pop]
    stats_records = [build_stats(0, pop, fits)]

    for g in range(NGEN):
        print("-- GENERACIÓN {} --".format(g + 1))
        offspring = toolbox.select(pop, len(pop))
        offspring = list(map(toolbox.clone, offspring))

        #Operacion de crossover
        for child1, child2 in zip(offspring[::2], offspring[1::2]):
            if random.random() < CXPB:
                toolbox.mate(child1, child2)
                del child1.fitness.values
                del child2.fitness.values

        #Operacio de  mutacion
        for mutant in offspring:
            if random.random() < MUTPB:
                toolbox.mutate(mutant)
                del mutant.fitness.values

        weak_ind = [ind for ind in offspring if not ind.fitness.valid]
        fitnesses = list(map(toolbox.evaluate, weak_ind))
        for ind, fit in zip(weak_ind, fitnesses):
            ind.fitness.values = fit

        pop[:] = offspring

        fits = [ind.fitness.values[0] for ind in pop]
        stats_records.append(build_stats(g, pop, fits))

    print("-- EVOLUCIÓN FINALIZADA --")

    # Mejores soluciones
    best_ind = tools.selBest(pop, 1)[0]
    print("Mejor individuo:", best_ind)
    print("Con aptitud:", best_ind.fitness.values[0])


    # Plot de estadísticas
    plt.figure(figsize=(10,8))
    front = np.array([(c['gen'], c['avg']) for c in stats_records])
    plt.plot(front[:, 0][1:], front[:, 1][1:], marker='o', linestyle='-', color='b')    
    plt.axis("tight")
    plt.show()

    return best_ind, stats_records