import * as _ from "lodash-es";
import { writeFileSync } from "fs";
import { faker } from "@faker-js/faker";
const capitalize = _.capitalize;
const range = _.range;
const sample = _.sample;

const userAmount = 10;
const categories = [
  "Fruits",
  "Grains",
  "Dairy",
  "Vegetables",
  "Protein",
  "Sugars",
  "None",
];
const db = {
  users: range(userAmount).map((_, id) => {
    const email = faker.internet.email();
    return {
      email,
      name: `${capitalize(faker.name.firstName())} ${capitalize(
        faker.name.lastName()
      )}`,
      password: faker.internet.password(),
      glucoseEntries: range(5).map(() => ({
        glucose: faker.datatype.number({ min: 70, max: 200 }),
        timestamp: faker.date.past().toISOString(),
      })),
      foodEntries: range(5).map(() => ({
        food: faker.food.dish(),
        carb: faker.datatype.number({ min: 10, max: 50 }).toString(),
        timestamp: faker.date.past().toISOString(),
        favorite: faker.datatype.boolean(),
        category: sample(categories),
        userId: email, // Ensure userId matches the user's email
      })),
    };
  }),
};

writeFileSync("db.json", JSON.stringify(db, null, 2), { encoding: "utf-8" });
