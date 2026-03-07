
const { Kafka } = require("kafkajs");
const {
  KAFKA_BROKER,
  STOCK_DATA_TOPIC,
  CONSUMER_INTERVAL_MS,
} = require("../config");

let stockBuffer = {};

async function createConsumer() {
  // TODO-1: Create, connect, and subscribe a KafkaJS consumer to STOCK_DATA_TOPIC; return it
  const kafka = new Kafka({
    brokers: [KAFKA_BROKER]
  });

  const consumer = kafka.consumer({ groupId: "stock-stats-consumer-group" });

  await consumer.connect();
  await consumer.subscribe({
    topic: STOCK_DATA_TOPIC,
    fromBeginning: false
  });

  return consumer;
}

async function createStatsProducer() {
  // TODO-2: Create and connect a KafkaJS producer (for publishing stats); return it
  const kafka = new Kafka({
    brokers: [KAFKA_BROKER]
  });

  const producer = kafka.producer();
  await producer.connect();

  return producer;
}

function computeStats(priceEntries) {
  // TODO-3: Compute and return { low, high, mean, opening, closing, mar } from the price entries
  //         MAR = average of |p[i]-p[i-1]| / p[i] for i = 1..n-1
  if (priceEntries.length === 0) return null;

  const prices = priceEntries.map(e => e.price);

  const opening = prices[0];
  const closing = prices[prices.length-1];

  let low = prices[0];
  let high = prices[0];
  let sum = 0;

  for(let p of prices){
    if(p < low) low = p;
    if(p > high) high = p;
    sum += p;
  }

  const mean = sum / prices.length;

  let marSum = 0;
  for(let i=1; i<prices.length; i++){
    marSum += Math.abs(prices[i]-prices[i-1])/prices[i];
  }

  const mar =  prices.length > 1 ? marSum / (prices.length -1) : 0;

  return {
    low, high, mean, opening, closing, mar
  };
}

async function processAndPublishStats(producer) {
  // TODO-4: For each stock in stockBuffer, compute stats and publish to <stock>_stats topic
  //         with key=timestamp, value=JSON stats object; then clear the buffer
  for (const stock in stockBuffer){
    const entries = stockBuffer[stock];
    if(entries.length === 0) continue;

    const stats = computeStats(entries);

    const timestamp = new Date().toISOString();
    const topic = `${stock.toLowerCase()}_stats`;

    await producer.send({
      topic: topic,
      messages: [
        {
          key: timestamp,
          value: JSON.stringify(stats),
        },
      ],
    });

    console.log(`Published stats for ${stock}`);

    stockBuffer[stock] = [];

  }
}

async function runConsumer() {
  const consumer = await createConsumer();
  const statsProducer = await createStatsProducer();

  setInterval(() => {
    processAndPublishStats(statsProducer);
  }, CONSUMER_INTERVAL_MS);

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const data = JSON.parse(message.value.toString());
        const stock = data.stock;
        const price = data.price;
        const timestamp = message.key
          ? message.key.toString()
          : new Date().toISOString();

        if (!stockBuffer[stock]) {
          stockBuffer[stock] = [];
        }
        stockBuffer[stock].push({ price, timestamp });

        console.log(`Buffered: ${stock} @ $${price}`);
      } catch (err) {
        console.error("Error processing message:", err.message);
      }
    },
  });
}

runConsumer().catch(console.error);
