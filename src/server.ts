// const express = require('express');
// const graphqlHTTP = require('express-graphql');
// const { buildSchema } = require('graphql');

import express from 'express';
import graphqlHTTP from 'express-graphql';
import {buildSchema} from 'graphql';
let mongoose = require('mongoose');


mongoose.connect('mongodb+srv://wkylin:wkylin@cluster0-wguhd.gcp.mongodb.net/graphql', {useUnifiedTopology: true, useNewUrlParser: true }).then((db: any) => {
      // console.log('db', db);
    });
// mongoose.connect('mongodb://localhost:27017/graphql', {useUnifiedTopology: true, useNewUrlParser: true });


const app = express();

let userSchema = new mongoose.Schema({
  name: String,
  sex: String
});

let UserModel = mongoose.model("User", userSchema)

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }

  type User {
    name: String
    sex: String
  }
  type Query {
    getDie(numSides: Int): RandomDie
    ip: String
    findUser: [User]
  }
`);

// This class implements the RandomDie GraphQL type
class RandomDie {
  numSides: number;
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

// interface Users {
//   id:string
//   name:string
//   sex: string
// }

// The root provides the top-level API endpoints

const root = {
  // @ts-ignore
  getDie: ({numSides}):RandomDie => {
    return new RandomDie(numSides || 6);
  },
  ip: (args:any, request:any): String => {
    return request.ip;
  },
  findUser: async function(args:any) {
    const user = await UserModel.find();
    return user;
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

console.log('we\'re connected!');
app.listen(4000, () => {
  console.log('Running a GraphQL API server at localhost:4000/graphql');
});



