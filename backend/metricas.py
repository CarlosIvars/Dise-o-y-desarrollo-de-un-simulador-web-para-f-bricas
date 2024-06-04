import matplotlib.pyplot as plt

def plot_metrics(metrics):
    generations = range(len(metrics["best_fitnesses"]))
    
    plt.figure(figsize=(14, 7))

    plt.subplot(1, 3, 1)
    plt.plot(generations, metrics["best_fitnesses"], label="Best Fitness")
    plt.xlabel("Generations")
    plt.ylabel("Fitness")
    plt.title("Best Fitness Over Generations")
    plt.legend()

    plt.subplot(1, 3, 2)
    plt.plot(generations, metrics["average_fitnesses"], label="Average Fitness")
    plt.xlabel("Generations")
    plt.ylabel("Fitness")
    plt.title("Average Fitness Over Generations")
    plt.legend()

    plt.subplot(1, 3, 3)
    plt.plot(generations, metrics["genetic_diversity"], label="Genetic Diversity")
    plt.xlabel("Generations")
    plt.ylabel("Diversity")
    plt.title("Genetic Diversity Over Generations")
    plt.legend()

    plt.tight_layout()
    plt.show()
