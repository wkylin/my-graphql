// const express = require('express');
// const graphqlHTTP = require('express-graphql');
// const { buildSchema } = require('graphql');

import express from 'express';
import graphqlHTTP from 'express-graphql';
import {buildSchema} from 'graphql';

const app = express();

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }

  type Query {
    getDie(numSides: Int): RandomDie
    ip: String
  }
`);

// This class implements the RandomDie GraphQL type
class RandomDie {
  numSides: number
  constructor(numSides:number) {
    this.numSides = numSides;
  }

  rollOnce(): number {
    return 1 + Math.floor(Math.random() * this.numSides);
  }

  // @ts-ignore
  roll({numRolls}): number[] {
    let output = [];
    for (let i = 0; i < numRolls; i++) {
      output.push(this.rollOnce());
    }
    return output;
  }
}

// The root provides the top-level API endpoints

const root = {
  // @ts-ignore
  getDie: ({numSides}):RandomDie => {
    return new RandomDie(numSides || 6);
  },
  ip: function (args:any, request:any): string {
    return request.ip;
  }
};

const loggingMiddleware = (req: any, res: any, next:() => void) => {
  console.log('ip:', req.ip);
  next();
};

app.use(loggingMiddleware);

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
