const { Kafka } = require("kafkajs");
const {
  KAFKA_BROKER,
  STOCK_DATA_TOPIC,
  INITIAL_STOCK_PRICES,
  JUMP_SIZE,
  TIME_INTERVAL_MS,
} = require("../config");

async function createProducer() {
  // TODO-1: Create and connect a KafkaJS producer, return it
  const kafka =  new Kafka({
    brokers: [KAFKA_BROKER]
  });
  const producer = kafka.producer();
  await producer.connect();
  return producer;
}

function generateNewPrice(currentPrice, jumpSize) {
  // TODO-2: Return a new price using a uniform random walk in [-jumpSize, +jumpSize];
  //         if the result is negative, return the original price unchanged
  const diff = (Math.random() - 0.5)* 2* jumpSize;  
  const newPrice = currentPrice + diff;
  if(newPrice > 0) return newPrice;
  else return currentPrice;
}

async function runProducer() {
  // TODO-3: Every TIME_INTERVAL_MS, pick a random stock, update its price,
  //         and publish { stock, price } to STOCK_DATA_TOPIC with the timestamp as the message key
  producer = await createProducer();
  const stocks = Object.keys(INITIAL_STOCK_PRICES);
  const prices = { ...INITIAL_STOCK_PRICES};

  setInterval(async() => {
    const stock = stocks[Math.floor(Math.random()*stocks.length)];

    const newPrice = generateNewPrice(prices[stock], JUMP_SIZE[stock]);
    prices[stock] = newPrice;

    const timestamp = new Date().toISOString();

    await producer.send({
      topic: STOCK_DATA_TOPIC,
      messages: [
        {
          key: timestamp,
          value: JSON.stringify({stock: stock, price: newPrice})
        }
      ]
    });

    console.log(`Produced ${stock}: ${newPrice}`);
  }, TIME_INTERVAL_MS);
}

runProducer().catch(console.error);
