from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("practise2").getOrCreate()

sc = spark.sparkContext

text_file = sc.textFile('../../lab/lab3/23b1068_3a.py')
counts = text_file.flatMap(lambda line: line.strip().split(" ")).map(lambda word: (word,1)).reduceByKey(lambda x,y: x+y)

output = counts.collect()
print(output)