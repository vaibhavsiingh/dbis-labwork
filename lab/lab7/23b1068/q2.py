import sys
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, countDistinct, when, sum as spark_sum, max as spark_max


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 q2.py transactions.csv")
        sys.exit(1)

    input_path = sys.argv[1]

    spark = SparkSession.builder.appName("Q2_FraudDetection").getOrCreate()

    df = spark.read.csv(input_path, header=True, inferSchema=True)


    txn_counts = df.groupBy("user_id").agg(
        count("*").alias("total_txns")
    )

    max_value = txn_counts.agg(
        spark_max("total_txns").alias("max_txns")
    ).collect()[0]["max_txns"]

    top_users = (
        txn_counts
        .filter(col("total_txns") == max_value)
        .select("user_id")
        .orderBy("user_id")
        .limit(10)
    )

    for row in top_users.collect():
        print(row["user_id"])


    user_stats = df.groupBy("user_id").agg(
        count("*").alias("total_txns"),
        countDistinct("city").alias("distinct_cities"),
        spark_sum(
            when(col("status") == "FAILED", 1).otherwise(0)
        ).alias("failed_txns")
    )

    suspicious = (
        user_stats
        .filter(
            (col("total_txns") > 5000) |
            (col("distinct_cities") > 10) |
            (col("failed_txns") > 50)
        ).select("user_id").orderBy("user_id").limit(10)
    )

    for row in suspicious.collect():
        print(row["user_id"])

    spark.stop()

