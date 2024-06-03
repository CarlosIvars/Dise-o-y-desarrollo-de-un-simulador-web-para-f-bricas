# genetic_algorithm.py
from .problem_definition_rl import *
from stable_baselines3 import PPO

def evaluate_population(population, beneficios, costes_humanos, costes_tareas, fatigas, dependencias):
    return [evaluate_individual(individual, beneficios, costes_humanos, costes_tareas, fatigas, dependencias) for individual in population]

def selection_operator(population, aptitudes, k):
    selected_indices = sorted(range(len(aptitudes)), key=lambda i: aptitudes[i], reverse=True)[:k]
    return [population[i] for i in selected_indices]

def run_genetic_algorithm_with_rl(skills_matching, dependencias, num_generations, num_individuals, k, beneficios, costes_humanos, costes_tareas, fatigas):
    # Crear el entorno
    env = TaskAssignmentEnv(beneficios, costes_humanos, costes_tareas, fatigas, dependencias, len(skills_matching), len(costes_humanos))

    # Entrenar el modelo PPO
    model = PPO("MlpPolicy", env, verbose=1)
    model.learn(total_timesteps=10000)

    # Inicializar la población
    population = initialize_population(skills_matching, num_individuals, dependencias, fatigas)

    # Evaluar la población inicial
    aptitudes = evaluate_population(population, beneficios, costes_humanos, costes_tareas, fatigas, dependencias)
    
    # Ciclo de evolución
    for generation in range(num_generations):
        # Seleccionar individuos para reproducción
        selected = selection_operator(population, aptitudes, k)
        
        # Aplicar operadores genéticos (cruce y mutación)
        offspring = []
        for i in range(0, len(selected), 2):
            if i + 1 < len(selected):
                child1, child2 = crossover_operator(selected[i], selected[i+1], fatigas)
                child1 = mutation_operator(child1, skills_matching, dependencias, fatigas)
                child2 = mutation_operator(child2, skills_matching, dependencias, fatigas)
                offspring.extend([child1, child2])
        
        population[:] = offspring

        # Evaluar la nueva población
        aptitudes = evaluate_population(population, beneficios, costes_humanos, costes_tareas, fatigas, dependencias)
        
        # Optimizar con RL
        for individual in population:
            state = np.zeros((len(skills_matching), len(costes_humanos)))
            for subtask, worker in individual:
                if worker is not None:
                    state[subtask][worker] = 1

            done = False
            while not done:
                action, _states = model.predict(state.flatten())
                state, reward, done, _ = env.step(action)
                individual = [(i, np.argmax(state[i])) for i in range(len(state))]

    # Devolver el mejor individuo de la población final
    best_individual = max(population, key=lambda ind: evaluate_individual(ind, beneficios, costes_humanos, costes_tareas, fatigas, dependencias))
    return best_individual
