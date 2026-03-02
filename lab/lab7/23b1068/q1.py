import sys
from pyspark import SparkContext
from itertools import combinations

if __name__ == "__main__":
    sc = SparkContext(appName="movies")

    input_file = sys.argv[1]

    lines = sc.textFile(input_file)

    movie_sessions = lines.map(lambda line: sorted(line.strip().split(",")))    
    pairs = movie_sessions.flatMap(lambda movies: combinations(movies, 2))

    pair_counts = pairs.map(lambda p: (p, 1)).reduceByKey(lambda a, b: a + b)

    top5 = pair_counts.sortBy(lambda x: (-x[1], x[0][0], x[0][1])).take(5)

    for pair, count in top5:
        print(f"{pair[0]}, {pair[1]}, {count}")

    sc.stop()